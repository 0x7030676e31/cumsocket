import Core, { types } from "../core/core";
import Decimal from "decimal.js";
import MathExpr from "./math/";

export default class Math {
  public readonly ctx!: Core;
  public readonly id = "math";
  public readonly env = ["math_precision", "math_display_precision"];

  ignore = true;

  constructor() {
    const expr = new MathExpr("1+2");
    console.log(expr.result);
  }

  // public readonly ignore = true;

  public async init(ctx: Core): Promise<void> {
    Decimal.set({ precision: +process.env.math_precision! });
  }

  @Core.listen("MESSAGE_CREATE")
  public async onMessageCreate(msg: types.messages.Message): Promise<void> {
    // TODO
  }
}