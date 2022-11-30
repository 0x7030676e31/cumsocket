import Core, { types } from "../../core";
import Expression from "./expression";
import Decimal from "decimal.js";

export default class Math {
  public readonly ctx!: Core;
  public readonly id: string = "math";
  public readonly env: string[] = ["math_precision", "math_display_precision"];

  private precision!: number;

  public async load(): Promise<void> {
    // setup precision
    Decimal.set({ precision: +process.env.math_precision! });
    this.precision = +process.env.math_display_precision!;
  }

  @Core.listen("MESSAGE_CREATE")
  public async onMessage(msg: types.MESSAGE_CREATE): Promise<void> {
    if (!msg.content.length || msg.author.bot) return;

    // create and evaluate expression from message
    const expr = new Expression(msg.content);
    const result = expr.parse();

    // check if expression is valid
    if (result === null) return;
  
    // send formatted result
    this.ctx.api.messages.respond(msg.channel_id, msg.id, this.format(result));
  }

  private format(value: Decimal): string {
    if (value.isNaN()) return "*Sorry dear user but the creator of this bot would get even more depressed implementing imaginary numbers or whatever is this so satisfy yourself with this answer instead*";
    if (!value.isFinite() && value.isPos()) return "Uh Oh, looks like I've reached the limit of my knowledge. Who can even calculate this ridiculously large number?";
    if (!value.isFinite() && value.isNeg()) return "Infinitely small numbers sounds very interesting, isn't it? I'm not sure if I can calculate that though :(";
    return "=" + new Decimal(value.toNearest(`1e-${this.precision}`).toPrecision(this.precision)).toString();
  }
}