import Decimal from "decimal.js";
import Std from "./std";

const RULES: [string, RegExp][] = [
  ["number", /^\d+(\.\d+)?/],
  ["number", /^0x[0-f]+(\.[0-f]+)?/],
  ["number", /^0o[0-7]+(\.[0-7]+)?/],
  ["number", /^0b[01]+(\.[01]+)?/],
  ["operator", /^([+*\-%]|\/{1,2})/],
  ["modifier", /^(°|!{1,2})/],
  ["function", /^[a-z]+\(/],
  ["variable", /^[a-zθωερψυιοασδφγηςκλζχξωβνμ]+/],
  ["open", /^\(/],
  ["close", /^\)/],
  ["comma", /^,/],
  ["abs", /^\|/],
]

type Tokens = (Token | Tokens)[];
type Token =
  { type: "number", value: Decimal } |
  { type: "operator" | "modifier" | "function" , value: string } |
  { type: "comma" | "open" | "close" };

export default class Lexer {
  private readonly _content: string;
  private cursor = 0;

  private tokens: Tokens = [];
  private ref: Tokens = this.tokens;
  private depth = 0;

  private insideParentheses: number[] = [];
  private asAbsolute: number[] = [];

  constructor(content: string) {
    this._content = content
      .replaceAll(/[\u200B-\u200D\uFEFF\s]+/g, "")
      .replaceAll("π", "pi")
      .replaceAll("τ", "tau")
      .replaceAll("√", "sqrt")
      .replaceAll(/[×⋅∙•]/g, "*")
      .replaceAll(/[÷:]/g, "/");
  }

  public parse(): Tokens | null {
    while (this.cursor < this._content.length) {
      const token = this.next();
      if (!token) return null;

      const [name, match] = token;
      switch (name) {
        case "number":
          this.ref.push({ type: "number", value: new Decimal(match[0]) });
          break;

        case "operator":
          this.ref.push({ type: "operator", value: match[0] });
          break;

        case "modifier":
          this.ref.push({ type: "modifier", value: match[0] });
          break;

        case "function":
          if (Std.functions[match[0].slice(0, -1)]) this.ref.push({ type: "function", value: match[0].slice(0, -1) });
          else if (Std.constants[match[0].slice(0, -1)]) {
            this.ref.push({ type: "number", value: Std.constants[match[0].slice(0, -1)] });
            this.insideParentheses.push(this.depth + 1);
          }
          else return null;
          break;
      
        case "variable":
          if (Std.constants[match[0]]) this.ref.push({ type: "number", value: Std.constants[match[0]] });
          else if (Std.functions[match[0]]) this.ref.push({ type: "function", value: match[0] });
          else return null;
          break;

        case "open":
          this.depth++;
          if ((this.ref.at(-1) as Token)?.type === "function") this.insideParentheses.push(this.depth);
          this.ref.push([]);
          this.ref = this.ref.at(-1) as Tokens;
          break;

        case "close":
          if (this.depth === 0 || this.asAbsolute.at(-1) === this.depth) return null;
          if (this.insideParentheses.at(-1) === this.depth) this.insideParentheses.pop();
          this.depth--;
          this.ref = this.tokens;
          for (let i = 0; i < this.depth; i++) this.ref = this.ref.at(-1) as Tokens;
          break;

        case "comma":
          if (this.insideParentheses.at(-1) !== this.depth) return null;
          this.ref.push({ type: "comma" });
          break;

        case "abs":
          if (this.asAbsolute.at(-1) === this.depth) {
            this.depth--;
            this.ref = this.tokens;
            for (let i = 0; i < this.depth; i++) this.ref = this.ref.at(-1) as Tokens;
            break;
          }

          this.depth++;
          this.ref.push({ type: "function", value: "abs" }, []);
          this.ref = this.ref.at(-1) as Tokens;
          this.asAbsolute.push(this.depth);
          break;
        
      }
    }

    return this.depth !== 0 ||
      this.asAbsolute.length ||
      !(this.tokens.length || (this.tokens[0] instanceof Array)) ||
      (this.tokens.length === 2 && (this.tokens[0] as any).type === "operator")
      ? null : this.tokens; 
  }

  private next(): [string, RegExpExecArray] | null {
    const str = this._content.slice(this.cursor);
    for (const [name, regex] of RULES) {
      const match = regex.exec(str);
      if (!match) continue;

      this.cursor += match[0].length;
      return [name, match];
    }

    return null;
  }
}
