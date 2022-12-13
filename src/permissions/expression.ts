import Lexer from "./lexer.js";

// Used to evalue, decode and encode an expression

export default class Expression extends Lexer {
  public static readonly table: string[] = ["guild", "channel", "user", "&&", "||", "==", "!=", "(", ")"];

  // Evaluate an expression
  public exec(vars: Partial<vars>): boolean {
    const expression = this.raw.replaceAll(/guild|channel|user/g, v => vars[v as keyof vars] ?? "-1");
    return eval(expression);
  }

  public stringify(): string {
    // Format expression
    return this._content
      .replaceAll(/\s+/g, "")
      .replaceAll(/&&|\|\||!=|==/g, v => ` ${v} `);
  }

  // FORMAT: 1 char == 16 bits == 4 tokens, token = idx + 1 OR i64 (additionally one "1" bit every 8 bits)
  public encode(): string {
    let expr = this._content.replaceAll(/\s+/g, "");
    let bin = "";
  
    while (expr.length) {
      // Match token
      const match = /^(\d+|guild|channel|user|&&|\|\||==|!=|\(|\))/.exec(expr)!;
      const idx = Expression.table.indexOf(match[0]) + 1 || 10;
      expr = expr.slice(match[0].length);
      
      // Insert index token
      bin += `${"0".repeat(4 - idx.toString(2).length)}${idx.toString(2)}`;
      if (idx !== 10) continue;

      // Convert i64 to binary
      const i64 = BigInt(match[0]).toString(2);
      bin += `${"0".repeat(64 - i64.length)}${i64}`.match(/[01]{8}/g)!.map(v => `${v}1`).join("");
    }

    const suffixLength = (12 - (bin.length + 4) % 12) / 4;
    return `${"0".repeat(4 - suffixLength.toString(2).length)}${suffixLength.toString(2)}${bin}${"1111".repeat(suffixLength)}`.match(/[01]{12}/g)!.map(v => String.fromCharCode(+`0b${v}`)).join("").replaceAll("'", "''");
  }

  // Decode a binary expression
  public static decode(str: string): Expression {
    const chunks = str.split("").map(v => v.charCodeAt(0).toString(2)).map(v => `${"0".repeat(12 - v.length)}${v}`).join("").match(/[01]{4}/g)!;
    
    // Remove suffix
    const suffixLength = +`0b${chunks.shift()}`;
    const bin = suffixLength ? chunks.slice(0, suffixLength * -1) : chunks;
    let text = "";
  
    // Decode
    while (bin.length) {
      const idx = +`0b${bin.shift()}` - 1;
    
      // Get token from expr and add to text
      if (idx !== 9) text += Expression.table[idx];
      else text += BigInt(`0b${bin.splice(0, 18).join("").match(/[01]{9}/g)!.map(v => v.slice(0, 8)).join("")}`).toString();
    }

    return new Expression(text);
  }
}

interface vars {
  user: string;
  channel: string;
  guild: string;
}