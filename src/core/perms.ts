type exprTokens = (exprToken | exprTokens)[];
type exprToken = token | { type: "bool", value: boolean };
type rTokens = ({ type: "op"| "id", value: string } | { type: "bool", value: boolean })[];

type tokens = (token | tokens)[];
type token = { type: "op" | "var" | "id", value: string };
class Lexer {
  private _content: string;
  private _cursor: number = 0;

  private _tokens: tokens = [];
  private _ref: tokens = this._tokens;
  private _depth: number = 0;

  private _last: string = "op";
  private _error: string = "";

  private readonly _rules: [string, RegExp][] = [
    ["var", /^(guild|channel|user)/],
    ["op", /^(==|!=|&&|\|\|)/],
    ["id", /^\d+/],
    ["open", /^\(/],
    ["close", /^\)/],
  ];

  constructor(content: string) {
    this._content = content.replaceAll(/[\u200B-\u200D\uFEFF]+|\s+$/g, "")

    while (this._cursor < this._content.length) {
      // get next token
      const match = this.match();
      if (!match) {
        this._error = `Unknown token at ${this._cursor}`;
        break;
      }

      // add token to the current reference / change depth of the reference
      const [type, matchArr] = match;
      switch (type) {
        case "var":
        case "op":
        case "id":
          if ((type === "op" && this._last === "op") || (type !== "op" && this._last === "var")) {
            this._error = `Unexpected token "${type}" after "${this._last}" at ${this._cursor}`;
            return;
          }

          this._last = type === "op" ? "op" : "var";
          this._ref.push({ type, value: matchArr[0] });
          break;

        // open parenthesis
        case "open":
          if (this._last === "var") {
            this._error = `Unexpected token "(" after "var" at ${this._cursor}`;
            return;
          }
          this._last = "op";
          this._depth++;
          this._ref.push([]);
          this._ref = this._ref.at(-1) as tokens;
          break;

        // close parenthesis
        case "close":
          if (this._depth === 0 || this._ref.length === 0) {
            this._error = `Unexpected token ")" at ${this._cursor}`;
            return;
          } else if (this._last === "op") {
            this._error = `Unexpected token ")" after "${this._last}" at ${this._cursor}`;
            return;
          }

          this._last = "var";
          this._depth--;
          this._ref = this._tokens;
          for (let i = 0; i < this._depth; i++) this._ref = this._ref.at(-1) as tokens;
          break;
      }
    }

    if (this._depth !== 0 || this._last === "op") this._error = "Unexpected end of input";
  }

  private match(): [string, RegExpExecArray] | null {
    let str = this._content.slice(this._cursor);
    
    // remove whitespaces at the beginning
    const spaces = /^\s+/.exec(str);
    if (spaces) {
      this._cursor += spaces[0].length;
      str = this._content.slice(this._cursor);
    }
    
    // look for first matching rule
    for (const [type, regex] of this._rules) {
      const match = regex.exec(str);
      if (!match) continue;

      this._cursor += match[0].length;
      return [type, match];
    }
    
    return null;
  }

  public get tokens(): tokens | string {
    return this._error || structuredClone(this._tokens);
  }
}

type vars = { guild: string, channel: string, user: string };
class Expression {
  private readonly _tokens: exprTokens;
  private _vars!: vars;

  private readonly _order: string[][] = [
    ["&&", "||"],
    ["!=", "=="],
  ];

  constructor(tokens: tokens) {
    this._tokens = tokens;
  }

  private _exec(tokens: exprTokens): null | exprToken {
    // use recursion to exec expressions at any depth
    while (true) {
      const idx = tokens.findIndex(v => v instanceof Array);
      if (idx === -1) break;
    
      const result = this._exec(tokens[idx] as exprTokens);
      if (result === null) return null;
      tokens.splice(idx, 1, result);
    }

    // replace all "guild", "channel" etc vars to ids 
    const rTokens = (tokens as exprToken[]).map(v => v.type === "var" ? { type: "id", value: this._vars[v.value as keyof vars] } : v) as rTokens;

    // make operations on values
    while (true) {
      let passed: boolean = false;
      // loop through operation order
      for (const order of this._order) {
        const idx = rTokens.findIndex(v => order.includes(v.value as string));
        if (idx === -1) continue;

        const op = rTokens[idx].value as string;
        const left = rTokens[idx - 1].value;
        const right = rTokens[idx + 1].value;

        // compare left and right side
        let result: boolean;
        switch (op) {
          case "&&":
            result = Boolean(left) && Boolean(right);
            break;

          case "||":
            result = Boolean(left) || Boolean(right);
            break;

          case "==":
            result = left == right;
            break;

          case "!=":
            result = left != right;
            break;
        }

        rTokens.splice(idx - 1, 3, { type: "bool", value: result! });
        passed = true;
        break;
      }

      if (!passed) break;
    }
    
    return rTokens[0];
  } 

  public exec(vars: { channel: string, user: string, guild?: string }): boolean {
    this._vars = { guild: vars.guild || "0", channel: vars.channel, user: vars.user };
    return this._exec(structuredClone(this._tokens)) !== null;
  }
}

type perms = { [key: string]: [state, ...[state, Expression][]] };
type state = "allow" | "block";
export default class Permissions {
  public add(expr: string): void | string {
    const tokens = new Lexer(expr).tokens;
    if (typeof tokens === "string") return tokens;


  }
}
