import Lexer from "./lexer";

export default class Expression extends Lexer {
  public static readonly table: string[] = ["&&", "||", "==", "!=", "(", ")", "guild", "channel", "user"];

  public exec(vars: Partial<vars>): boolean {
    const expression = this.raw.replaceAll(/guild|channel|user/g, v => vars[v as keyof vars] ?? "-1");
    return eval(expression);
  }

  public stringify(): string {
    return this._content
      .replaceAll(/\s+/g, "")
      .replaceAll(/&&|\|\||!=|==/g, v => ` ${v} `);
  }

  public encode(): string {
    let buff: string = "";
    let text = this._content.replaceAll(/\s+/g, "");

    // encode the expression
    while (text.length) {
      const [ match ] = /^(\d+|guild|channel|user|==|!=|&&|\|\||\(|\))/.exec(text)!;
      
      // find the index of the token in the table
      const idx = Expression.table.includes(match) ? Expression.table.indexOf(match) : 9;
      text = text.slice(match.length);
      
      // encode the token
      buff += `${"0".repeat(4 - idx.toString(2).length)}${idx.toString(2)}`;
      
      if (idx !== 9) continue;
      
      // encode the id
      const bin = BigInt(match).toString(2);
      buff += `${"0".repeat(64 - bin.length)}${bin}`;
    }

    // convert the binary to text
    buff += "0".repeat(12 - (buff.length % 12));
    return buff.match(/[01]{1,12}/g)!.map(v => +`0b1111${v}`).map(v => String.fromCharCode(v)).join("");
  }

  public static decode(text: string): Expression {
    // split the text into binary chunks
    const bin = text.split("").map(v => v.charCodeAt(0).toString(2).slice(4)).map(v => `${"0".repeat(12 - v.length)}${v}`.match(/[01]{4}/g)!).flat();
    let content: string = "";
    
    // remove zeros at the end
    while (+`0b${bin.at(-1)}` === 0) bin.pop();
    
    // decode the expression
    while (bin.length) {
      const idx = +`0b${bin.shift()}`;
      if (idx !== 9) content += Expression.table[idx];
      else content += BigInt(`0b${bin.splice(0, 16).join("") || "0"}`).toString();
    }

    return new Expression(content);
  }
}

interface vars {
  user: string;
  channel: string;
  guild: string;
}