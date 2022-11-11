import Decimal from "decimal.js";
import Expression from "./expression";

export default class Math {
  private _result: Decimal | null = null;

  constructor(content: string) {
    const expr = new Expression(content);
    this._result = expr.parse();
  }

  public get result(): string | null {
    if (!this._result) return null;
    if (this._result.isNaN()) return "NaN placeholder";
    if (!this._result.isFinite() && this._result.isPos()) return "Positive infinity placeholder";
    if (!this._result.isFinite() && this._result.isNeg()) return "Negative infinity placeholder";
    return `=${this._result.toDecimalPlaces(+process.env.math_display_precision!).toString()}`;
  }
}