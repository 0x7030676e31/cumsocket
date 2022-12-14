export default class Lexer {
  protected readonly _content: string;
  protected readonly raw: string;
  private cursor: number = 0;

  private depth: number = 0;
  private last: "op" | "var" = "op";

  private readonly rules: [string, RegExp][] = [
    ["var", /^\s*(guild|channel|user)/],
    ["op", /^\s*(==|!=|&&|\|\|)/],
    ["id", /^\s*\d+/],
    ["open", /^\s*\(/],
    ["close", /^\s*\)/],
  ];

  constructor(content: string) {
    // Format the content
    this._content = content.trim().replaceAll(/[\u200B-\u200D\uFEFF]+/g, "");
    this.raw = this._content
      .replaceAll(/\s+/g, "")
      .replaceAll(/\d+|guild|channel|user/g, v => `"${v}"`);
  }

  // Tokenize the content
  public parse(): void | string {
    while (this.cursor < this._content.length) {
      const match = this.match();
      if (!match) return `Matching failed at ${this.cursor}`;
    
      // Match the token type
      switch (match) {
        case "var":
        case "op":
        case "id":
          if (["var", "id"].includes(match) && this.last === "var") return "Found two values in a row";
          if (match === "op" && this.last === "op") return "Found two operators in a row";
          this.last = match === "op" ? "op" : "var";
          break;

        // Open parenthesis - increase depth
        case "open":
          if (this.last === "var") return "Found a value before an opening parenthesis";
          this.depth++;
          break;

        // Close parenthesis - decrease depth
        case "close":
          if (this.last === "op") return "Found an operator before a closing parenthesis";
          if (this.depth === 0) return "Found a closing parenthesis without an opening parenthesis";
          this.depth--;
          break;
      }
    }

    // Final checks
    if (this.last === "op") return "Found an operator at the end of the expression";
    if (this.depth !== 0) return "Missing closing parenthesis";
  }

  // Get the next token from the content
  private match(): string | null {
    const str = this._content.slice(this.cursor);

    // Search for a matching rule
    for (const [name, rule] of this.rules) {
      const match = rule.exec(str);
      if (!match) continue;
    
      // Move the cursor and return the token type
      this.cursor += match[0].length;
      return name;
    }

    // No matching rule found, return null
    return null;
  }
}