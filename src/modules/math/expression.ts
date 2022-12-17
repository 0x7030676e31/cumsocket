import { Decimal } from "decimal.js";
import Std from "./std.js";

type Tokens = (Token | Tokens)[];
type Token =
  { type: "operator" | "modifier" | "function" , value: string } |
  { type: "comma" } |
  Unit;

type FmtdTokens = ( Unit | { type: "operator" | "modifier" | "function" , value: string })[];
type Unit = { type: "number", value: Decimal };

// Used to check if tokens order is valid
enum TokenType {
  Number,
  Operator,
  Function,
  Open,
  Comma,
}

export default class Expression {
  // Rules for tokenizing
  private static readonly rules: [string, RegExp][] = [
    [ "space",     /^\s+/                       ],
    [ "number",    /^0x[0-9a-f]+(\.[0-9a-f]+)?/ ],
    [ "number",    /^0o[0-7]+(\.[0-7]+)?/       ],
    [ "number",    /^0b[01]+(\.[01]+)?/         ],
    [ "number",    /^\d+(\.\d+)?/               ],
    [ "operator",  /^([+*\-%^]|\/{1,2})/        ],
    [ "modifier",  /^(°|!{1,2})/                ],
    [ "function",  /^[a-z]+(?=\()/              ],
    [ "variable",  /^[a-z]+/                    ],
    [ "open",      /^\(/                        ],
    [ "close",     /^\)/                        ],
    [ "comma",     /^,/                         ],
    [ "abs",       /^\|/                        ],
  ];

  // Order of operations
  private static readonly opOrder: string[][] = [
    [ "^", "%" ],
    [ "*", "/", "//" ],
    [ "+", "-" ],
  ];

  private static readonly superscript: { [key: string]: string } = {
    "⁰": "0",
    "¹": "1",
    "²": "2",
    "³": "3",
    "⁴": "4",
    "⁵": "5",
    "⁶": "6",
    "⁷": "7",
    "⁸": "8",
    "⁹": "9",
    "⁻": "-",
  };

  private static formatSuperscript(str: string): string {
    return str.split("").map(v => Expression.superscript[v]).join("");
  }

  private static readonly subscript: { [key: string]: string } = {
    "₀": "0",
    "₁": "1",
    "₂": "2",
    "₃": "3",
    "₄": "4",
    "₅": "5",
    "₆": "6",
    "₇": "7",
    "₈": "8",
    "₉": "9",
    "₋": "-",
  };

  private static formatSubscript(str: string): string {
    return str.split("").map(v => Expression.subscript[v]).join("");
  }

  private static readonly fractions: { [key: string]: string } = {
    "½": "1/2",
    "⅓": "1/3",
    "¼": "1/4",
    "⅕": "1/5",
    "⅙": "1/6",
    "⅐": "1/7",
    "⅛": "1/8",
    "⅑": "1/9",
    "⅒": "1/10",
    "⅔": "2/3",
    "⅖": "2/5",
    "¾": "3/4",
    "⅗": "3/5",
    "⅜": "3/8",
    "⅘": "4/5",
    "⅚": "5/6",
    "⅝": "5/8",
    "⅞": "7/8",
    "↉": "0",
  }

  // Function to replace `|`
  private static readonly absFn: string = "abs";

  // Content of expression
  private content: string;
  // Position of lexer
  private cursor: number = 0;

  // List of matched tokens
  private tokens: Tokens = [];
  // Reference to matched tokens
  private ref: Tokens = this.tokens;
  // Depth of nested tokens
  private depth: number = 0;
  
  // Depth where comma is allowed
  private asFunction: number[] = [];
  // Depth of absolute value sign
  private asAbsolute: number[] = [];

  // Last matched token type
  private lastToken!: TokenType;

  constructor(expr: string) {
    // Format input expression
    this.content = expr
      .replaceAll(/[\u200B-\u200D\uFEFF]+/g, "")
      .replaceAll("π", "pi")
      .replaceAll("τ", "tau")
      .replaceAll("√", "sqrt")
      .replaceAll(/[×⋅∙•]/g, "*")
      .replaceAll(/[÷:]/g, "/")
      .replaceAll(/(⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)[⁄\/](₋?[₀₁₂₃₄₅₆₇₈₉]+)/g, (_, numerator, denominator) => `((${Expression.formatSuperscript(numerator)})/(${Expression.formatSubscript(denominator)}))`)
      .replaceAll(/[½⅓¼⅕⅙⅐⅛⅑⅒⅔⅖¾⅗⅜⅘⅚⅝⅞↉]/g, fraction => `(${Expression.fractions[fraction]})`)
      .replaceAll(/⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, power => `^(${Expression.formatSuperscript(power)})`)
      .toLowerCase();
  }

  public parse(): Decimal | null {
    // Check if expression content is long enough
    if (this.content.length === 0 || /^([+\-]?\s*[\s\d\.xob]+|[a-z]+)$/.test(this.content)) return null;

    while (this.cursor < this.content.length) {
      const token = this.next();
      if (!token) return null ;

      const [ type, match ] = token;
      if (type === "space") continue;

      const lastToken = this.lastToken;
      switch (type) {
        // Numbers
        case "number":
          this.ref.push({ type: "number", value: new Decimal(match[0]) });
          this.lastToken = TokenType.Number;
          break;

        // Operators
        case "operator":
          if ([TokenType.Function, TokenType.Comma].includes(lastToken)) return null;
          this.ref.push({ type: "operator", value: match[0] });
          this.lastToken = TokenType.Operator;
          break;

        // Those thing after number that can modify the number
        case "modifier":
          if (lastToken === undefined || lastToken !== TokenType.Number || !Std.modifiers[match[0]]) return null;
          this.ref.push({ type: "modifier", value: match[0] });
          this.lastToken = TokenType.Number;
          break;

        // Functions (if possible constants too)
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

        // Constants (if possible functions too)
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

        // Open parenthesis
        case "open":
          this.depth++;
          if (lastToken === TokenType.Function) this.asFunction.push(this.depth);
          
          this.ref.push([]);
          this.ref = this.ref[this.ref.length - 1] as Tokens;
          
          this.lastToken = TokenType.Open;
          break;

        // Close parenthesis, also used for evaluating current-scope expression
        case "close":
          if (this.depth === 0 || lastToken === undefined || [TokenType.Operator, TokenType.Function, TokenType.Comma].includes(lastToken)) return null;
          
          let asFunction: number | undefined = undefined;
          if (this.asFunction.at(-1) === this.depth) asFunction = this.asFunction.pop();
          
          this.depth--;
          this.ref = this.tokens;
          for (let i = 0; i < this.depth; i++) this.ref = this.ref.at(-1) as Tokens;
          
          // Evaluating part
          const args = this.ref.at(-1) as any;
          const result = asFunction !== undefined ? this.evalFunction((this.ref.at(-2) as any).value, args) : this.eval(args);

          if (result === null) return null;

          // Replace last token with result
          this.ref.splice(asFunction !== undefined ? -2 : -1, asFunction !== undefined ? 2 : 1, { type: "number", value: result });
          
          this.lastToken = TokenType.Number;
          break;

        // Used for separate function arguments
        case "comma":
          if (this.asFunction.at(-1) !== this.depth || lastToken !== TokenType.Number) return null;
          this.ref.push({ type: "comma" });
          this.lastToken = TokenType.Comma;
          break;

        // `|` indicating absolute value
        case "abs":
          if (this.asAbsolute.at(-1) === this.depth) {
            this.insert(")");
            this.asAbsolute.pop();
            break;
          }

          this.insert(Expression.absFn + "(");
          this.asAbsolute.push(this.depth + 1);
          break;
      }
    }

    // Check if expression is valid
    return this.depth !== 0 || this.asAbsolute.length || [TokenType.Operator, TokenType.Function].includes(this.lastToken) ? null : this.eval(this.tokens as FmtdTokens);
  }

  // Evaluate a function
  private evalFunction(fn: string, tokens: Token[]): Decimal | null {
    const func = Std.getFunction(fn);
    
    // Split tokens into arguments
    const args: Token[][] = [];
    while (true) {
      const idx = tokens.findIndex(t => t.type === "comma");
      if (idx === -1) break;
      args.push(tokens.splice(0, idx + 1).slice(0, -1));
    }
    if (tokens.length) args.push(tokens);

    // Check if the number of arguments is correct
    if (args.length < func[0] || args.length > func[1]) return null;

    // Evaluate each argument
    const decimals = args.map(arg => this.eval(arg as FmtdTokens));
    if (decimals.some(v => v === null)) return null;
    
    // Return the result
    return func[2](...decimals as Decimal[]);
  }

  // Evaluate a list of tokens
  private eval(tokens: FmtdTokens): Decimal | null {
    // Remove "+" or "-" at the beginning
    if (tokens[0].type === "operator") {
      if (tokens[0].value === "-") tokens[1].value = (tokens[1] as Unit).value.neg();
      else if (tokens[0].value !== "+") return null;

      tokens.shift();
    }

    if (!tokens.length) return null;

    // Check for bracketless function correctness
    const indexes = tokens.map((t, i, s) => s[i - 1]?.type === "function" && t.type === "number" ? i : -1).filter(i => i !== -1);
    for (const i of indexes) {
      const funcToken = tokens[i - 1] as any;
      const func = Std.getFunction(funcToken.value);
  
      if (!func || func[0] !== 1) return null;
    }

    // Evalueate bracketless functions
    indexes.reverse().forEach(i => tokens.splice(i - 1, 2, { type: "number", value: Std.getFunction(tokens[i - 1].value as string)![2](tokens[i].value as Decimal) }));

    // Negate all numbers that have a - before them
    tokens.forEach((t, i, s) => s[i - 1]?.type === "operator" && t.value === "-" && s[i + 1]?.type === "number" ? s.splice(i, 2, { type: "number", value: (s[i + 1] as Unit).value.neg() }) : 0)

    // Apply modifiers
    tokens.forEach((t, i, s) => t.type === "modifier" ? (s[i - 1] as Unit).value = Std.modifiers[t.value]((s[i - 1] as Unit).value) : 0);
    
    // Insert "*" between 2 numbers
    tokens.forEach((t, i, s) => t.type === "number" && s[i + 1]?.type === "number" ? s.splice(i + 1, 0, { type: "operator", value: "*" }) : 0);

    // At this poit all tokens should be numbers or operators so math can be done easily
    while (true) {
      let found: boolean = false;
      
      // Loop through operators and find the first one
      for (const order of Expression.opOrder) {
        // Find the first operator in the list
        const idx = tokens.findIndex(t => t.type === "operator" && order.includes(t.value));
        if (idx === -1) continue;

        // Do the math between the numbers before and after the operator
        exec(idx);
        found = true;
        break;
      }
      
      if (!found) break;
    }

    // Return the result
    return (tokens[0] as Unit).value;


    // Do the math on the token at the given index
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

      // Insert the result into the token list
      tokens.splice(idx - 1, 3, { type: "number", value: result! });
    }
  }

  // Insert a string at the cursor position
  private insert(content: string): void {
    this.content = `${this.content.slice(0, this.cursor)}${content}${this.content.slice(this.cursor)}`;
  }

  // Get the next matched token
  private next(): [ string, RegExpExecArray ] | null {
    // Get the string from the cursor to the end
    const str = this.content.slice(this.cursor);
    
    // Loop through the rules and find the first match
    for (const [type, regex] of Expression.rules) {
      const match = regex.exec(str);
      if (!match) continue;

      this.cursor += match[0].length;
      return [ type, match ];
    }

    // No match found, return null
    return null;
  }
}