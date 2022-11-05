import Lexer from "./lexer";

export default class Expression extends Lexer {
  public static readonly table: string[] = ["guild", "channel", "user", "&&", "||", "==", "!=", "(", ")"];

  public exec(vars: Partial<vars>): boolean {
    const expression = this.raw.replaceAll(/guild|channel|user/g, v => vars[v as keyof vars] ?? "-1");
    return eval(expression);
  }

  public stringify(): string {
    return this._content
      .replaceAll(/\s+/g, "")
      .replaceAll(/&&|\|\||!=|==/g, v => ` ${v} `);
  }

  // FORMAT: 1 char == 16 bits == 4 tokens, token = idx + 1 OR i64 (additionally one "1" bit every 8 bits)
  public encode(): string {
    let buff: string = "";
    let text = this._content.replaceAll(/\s+/g, "");

    // encode the expression
    while (text.length) {
      const [ match ] = /^(\d+|guild|channel|user|==|!=|&&|\|\||\(|\))/.exec(text)!;
      
      // find the index of the token in the table
      const idx = (Expression.table.includes(match) ? Expression.table.indexOf(match) : 9) + 1;
      text = text.slice(match.length);
      
      // encode the token
      buff += `${"0".repeat(4 - idx.toString(2).length)}${idx.toString(2)}`;
      
      if (idx !== 10) continue;
      
      // encode the id
      const bin = BigInt(match).toString(2);
      `${"0".repeat(64 - bin.length)}${bin}`.match(/[01]{8}/g)!.forEach(v => buff += `${v}1`);
    }

    // convert binary to text
    const prefixLength = (16 - ((buff.length + 4) % 16)) / 4;
    return `${"0".repeat(4 - prefixLength.toString(2).length)}${prefixLength.toString(2)}${buff}${"1111".repeat(prefixLength)}`.match(/[01]{1,16}/g)!.map(v => +`0b${v}`).map(v => String.fromCharCode(v)).join("");
  }

  public static decode(text: string): Expression {
    // split the text into binary chunks
    const chunks = text.split("").map(v => v.charCodeAt(0).toString(2)).map(v => `${"0".repeat(16 - v.length)}${v}`).join("").match(/[01]{4}/g)!;
    const prefix = +`0b${chunks.shift()}`;
    const bin = chunks.slice(0, prefix * -1);

    let content: string = "";
    
    // decode the expression
    while (bin.length) {
      const idx = +`0b${bin.shift()}`;
      if (idx !== 10) content += Expression.table[idx - 1];
      else content += BigInt(`0b${bin.splice(0, 18).join("").match(/[01]{9}/g)!.map(v => v.slice(0, -1)).join("")}`).toString();
    } 

    return new Expression(content);
  }
}

interface vars {
  user: string;
  channel: string;
  guild: string;
}