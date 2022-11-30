import Decimal from "decimal.js";
import Std from "./std";

type Tokens = (Token | Tokens)[];
type Token =
  { type: "operator" | "modifier" | "function" , value: string } |
  { type: "comma" } |
  Unit;

type FmtdTokens = ( Unit | { type: "operator" | "modifier" | "function" , value: string })[];
type Unit = { type: "number", value: Decimal };

// used to check if tokens order is valid
enum TokenType {
  Number,
  Operator,
  Function,
  Open,
  Comma,
}

export default class Lexer {
  private static readonly rules: [string, RegExp][] = [
    [ "space",     /^\s+/                 ],
    [ "number",    /^0x[0-f]+(\.[0-f]+)?/ ],
    [ "number",    /^0o[0-7]+(\.[0-7]+)?/ ],
    [ "number",    /^0b[01]+(\.[01]+)?/   ],
    [ "number",    /^\d+(\.\d+)?/         ],
    [ "operator",  /^([+*\-%^]|\/{1,2})/  ],
    [ "modifier",  /^(°|!{1,2})/          ],
    [ "function",  /^[a-z]+(?=\()/        ],
    [ "variable",  /^[a-z]+/              ],
    [ "open",      /^\(/                  ],
    [ "close",     /^\)/                  ],
    [ "comma",     /^,/                   ],
    [ "abs",       /^\|/                  ],
  ];

  private static readonly opOrder: string[][] = [
    [ "^", "%" ],
    [ "*", "/", "//" ],
    [ "+", "-" ],
  ]

  private static readonly absFn: string = "abs";

  private content: string;
  private cursor: number = 0;

  private tokens: Tokens = [];
  private ref: Tokens = this.tokens;
  private depth: number = 0;
  
  private asFunction: number[] = [];
  private asAbsolute: number[] = [];

  private lastToken!: TokenType;

  constructor(expr: string) {
    this.content = expr
      .replaceAll(/[\u200B-\u200D\uFEFF]+/g, "")
      .replaceAll("π", "pi")
      .replaceAll("τ", "tau")
      .replaceAll("√", "sqrt")
      .replaceAll(/[×⋅∙•]/g, "*")
      .replaceAll(/[÷:]/g, "/")
      .toLowerCase();

    console.log(this.content);
  }

  public parse(): Decimal | null {
    // check if expression content is long enough
    if (this.content.length === 0 || /^([+\-]?\s*[\s\d\.xob]+|[a-z]+)$/.test(this.content)) return null;

    while (this.cursor < this.content.length) {
      const token = this.next();
      if (!token) return null ;

      const [ type, match ] = token;
      if (type === "space") continue;

      const lastToken = this.lastToken;
      switch (type) {
        case "number":
          this.ref.push({ type: "number", value: new Decimal(match[0]) });
          this.lastToken = TokenType.Number;
          break;

        case "operator":
          if ([TokenType.Function, TokenType.Comma].includes(lastToken)) return null;
          this.ref.push({ type: "operator", value: match[0] });
          this.lastToken = TokenType.Operator;
          break;

        // those thing after number that can modify the number
        case "modifier":
          if (lastToken === undefined || lastToken !== TokenType.Number || !Std.modifiers[match[0]]) return null;
          this.ref.push({ type: "modifier", value: match[0] });
          this.lastToken = TokenType.Number;
          break;

        case "function":
          if (Std.isFunction(match[0])) {
            if (lastToken && lastToken === TokenType.Function) return null;

            this.ref.push({ type: "function", value: match[0] });
            this.lastToken = TokenType.Function;
            break;
          }

          if (Std.isConstant(match[0])) {
            this.ref.push({ type: "number", value: Std.getConstant(match[0]) });
            this.lastToken = TokenType.Number;
            break;
          }

          return null;

        case "variable":
          if (Std.isConstant(match[0])) {
            this.ref.push({ type: "number", value: Std.getConstant(match[0]) });
            this.lastToken = TokenType.Number;
            break;
          }
          
          if (Std.isFunction(match[0])) {
            if (lastToken && lastToken === TokenType.Function) return null;
            
            this.ref.push({ type: "function", value: match[0] });
            this.lastToken = TokenType.Function;
            break;
          }

          return null;

        case "open":
          this.depth++;
          if (lastToken === TokenType.Function) this.asFunction.push(this.depth);
          
          this.ref.push([]);
          this.ref = this.ref[this.ref.length - 1] as Tokens;
          
          this.lastToken = TokenType.Open;
          break;

        // close parenthesis, also used for evaluating current-scope expression
        case "close":
          if (this.depth === 0 || lastToken === undefined || [TokenType.Operator, TokenType.Function, TokenType.Comma].includes(lastToken)) return null;
          
          let asFunction: number | undefined = undefined;
          if (this.asFunction.at(-1) === this.depth) asFunction = this.asFunction.pop();
          
          this.depth--;
          this.ref = this.tokens;
          for (let i = 0; i < this.depth; i++) this.ref = this.ref.at(-1) as Tokens;
          
          // evaluating part
          const args = this.ref.at(-1) as any;
          const result = asFunction !== undefined ? this.evalFunction((this.ref.at(-2) as any).value, args) : this.eval(args);

          if (result === null) return null;

          // replace last token with result
          this.ref.splice(asFunction !== undefined ? -2 : -1, asFunction !== undefined ? 2 : 1, { type: "number", value: result });
          
          this.lastToken = TokenType.Number;
          break;

        // used for separate function arguments
        case "comma":
          if (this.asFunction.at(-1) !== this.depth || lastToken !== TokenType.Number) return null;
          this.ref.push({ type: "comma" });
          this.lastToken = TokenType.Comma;
          break;

        // "|" is used to indicate absolute value
        case "abs":
          if (this.asAbsolute.at(-1) === this.depth) {
            this.insert(")");
            this.asAbsolute.pop();
            break;
          }

          this.insert(Lexer.absFn + "(");
          this.asAbsolute.push(this.depth + 1);
          break;
      }
    }

    return this.depth !== 0 || this.asAbsolute.length || [TokenType.Operator, TokenType.Function].includes(this.lastToken) ? null : this.eval(this.tokens as FmtdTokens);
  }

  // evaluate a function
  private evalFunction(fn: string, tokens: Token[]): Decimal | null {
    const func = Std.getFunction(fn);
    
    // split tokens into arguments
    const args: Token[][] = [];
    while (true) {
      const idx = tokens.findIndex(t => t.type === "comma");
      if (idx === -1) break;
      args.push(tokens.splice(0, idx + 1).slice(0, -1));
    }
    if (tokens.length) args.push(tokens);

    // check if the number of arguments is correct
    if (args.length < func[0] || args.length > func[1]) return null;

    // evaluate each argument
    const decimals = args.map(arg => this.eval(arg as FmtdTokens));
    if (decimals.some(v => v === null)) return null;
    
    // return the result
    return func[2](...decimals as Decimal[]);
  }

  // evaluate a list of tokens
  private eval(tokens: FmtdTokens): Decimal | null {
    // remove "+" or "-" at the beginning
    if (tokens[0].type === "operator") {
      if (tokens[0].value === "-") tokens[1].value = (tokens[1] as Unit).value.neg();
      else if (tokens[0].value !== "+") return null;

      tokens.shift();
    }

    if (!tokens.length) return null;

    // check for bracketless function correctness
    const indexes = tokens.map((t, i, s) => s[i - 1]?.type === "function" && t.type === "number" ? i : -1).filter(i => i !== -1);
    for (const i of indexes) {
      const funcToken = tokens[i - 1] as any;
      const func = Std.getFunction(funcToken.value);
  
      if (!func || func[0] !== 1) return null;
    }

    // evalueate bracketless functions
    indexes.reverse().forEach(i => tokens.splice(i - 1, 2, { type: "number", value: Std.getFunction(tokens[i - 1].value as string)![2](tokens[i].value as Decimal) }));

    // negate all numbers that have a - before them
    tokens.forEach((t, i, s) => s[i - 1]?.type === "operator" && t.value === "-" && s[i + 1]?.type === "number" ? s.splice(i, 2, { type: "number", value: (s[i + 1] as Unit).value.neg() }) : 0)

    // apply modifiers
    tokens.forEach((t, i, s) => t.type === "modifier" ? (s[i - 1] as Unit).value = Std.modifiers[t.value]((s[i - 1] as Unit).value) : 0);
    
    // insert "*" between 2 numbers
    tokens.forEach((t, i, s) => t.type === "number" && s[i + 1]?.type === "number" ? s.splice(i + 1, 0, { type: "operator", value: "*" }) : 0);

    // now we have a list of numbers and operators so we can just evaluate it
    while (true) {
      let found: boolean = false;
      
      // loop through operators and find the first one
      for (const order of Lexer.opOrder) {
        // find the first operator in the list
        const idx = tokens.findIndex(t => t.type === "operator" && order.includes(t.value));
        if (idx === -1) continue;

        exec(idx);
        found = true;
        break;
      }
      
      if (!found) break;
    }

    return (tokens[0] as Unit).value;


    // do the math on the tokena at the given index
    function exec(idx: number): void {
      const op = tokens[idx].value;
      const a = tokens[idx - 1].value as Decimal;
      const b = tokens[idx + 1].value as Decimal;

      let result: Decimal;
      switch (op) {
        case "+":  result = a.add(b);      break;
        case "-":  result = a.sub(b);      break;
        case "*":  result = a.mul(b);      break;
        case "/":  result = a.div(b);      break;
        case "//": result = a.divToInt(b); break;
        case "%":  result = a.mod(b);      break;
        case "^":  result = a.pow(b);      break;
      }

      tokens.splice(idx - 1, 3, { type: "number", value: result! });
    }
  }

  // insert a string at the cursor position
  private insert(content: string): void {
    this.content = `${this.content.slice(0, this.cursor)}${content}${this.content.slice(this.cursor)}`;
  }

  // get the next matched token
  private next(): [ string, RegExpExecArray ] | null {
    const str = this.content.slice(this.cursor);
    for (const [type, regex] of Lexer.rules) {
      const match = regex.exec(str);
      if (!match) continue;

      this.cursor += match[0].length;
      return [ type, match ];
    }

    return null;
  }
}