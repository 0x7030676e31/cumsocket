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
    if (this._result.isNaN()) return "*Sorry dear user but the creator of this bot would get even more depressed implementing imaginary numbers so satisfy yourself with this answer instead*";
    if (!this._result.isFinite() && this._result.isPos()) return "Uh Oh, looks like I've reached the limit of my knowledge. I can't calculate that ridiculously big number";
    if (!this._result.isFinite() && this._result.isNeg()) return "Infinitely small number sounds very interesting, isn't it? I'm not sure if I can calculate that though";
    return `=${this._result.toDecimalPlaces(+process.env.math_display_precision!).toString()}`;
  }
}