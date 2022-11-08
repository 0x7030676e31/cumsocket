import Decimal from "decimal.js";
import Interpreter from "./interpreter";
import Lexer from "./lexer";

export default class Math {
  private _result: Decimal | null = null;

  constructor(content: string) {
    const lexer = new Lexer(content);
    const tokens = lexer.parse();
    if (!tokens) {
      this._result = null;
      return;
    }

    
  }

  public get result(): string | null {
    if (!this._result) return null;
    if (this._result.isNaN()) return "NaN placeholder";
    if (!this._result.isFinite()) return "Infinity placeholder";
    return `=${this._result.toDecimalPlaces(+process.env.math_display_precision!).toString()}`;
  }
}