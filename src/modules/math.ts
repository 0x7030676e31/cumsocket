import Core, { types } from "../core/core";
import Decimal from "decimal.js";
import MathExpr from "./math/";

export default class Math {
  public readonly ctx!: Core;
  public readonly id = "math";
  public readonly env = ["math_precision", "math_display_precision"];


  public async init(): Promise<void> {
    Decimal.set({ precision: +process.env.math_precision! });
  }

  @Core.listen("MESSAGE_CREATE")
  public async onMessageCreate(msg: types.messages.Message): Promise<void> {
    if (!msg.content.length || msg.author.bot) return;

    const expr = new MathExpr(msg.content);
    const result = expr.result;

    if (!result) return;
    this.ctx.api.messages.respondWithContent(msg.channel_id, msg.id, result);
  }
}