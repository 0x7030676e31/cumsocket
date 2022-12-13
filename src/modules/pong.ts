import Core, { types } from "../core/index.js";

// Used to calculate timestamp from snowflake
const EPOCH = 1420070400000n;

export default class Pong {
  public readonly id: string = "pong";
  public readonly ctx!: Core;

  // How bot's mention looks like
  private mention!: string;

  public async load(ctx: Core): Promise<void> {
    this.mention = `<@${ctx.getIdFromToken()}>`;
  }

  @Core.listen("MESSAGE_CREATE")
  public async onMessageCreate(msg: types.MESSAGE_CREATE): Promise<void> {
    // Check if message is mention
    if (msg.content !== this.mention) return;

    // Respond to message, if failed - return
    const reply = await this.ctx.api.messages.respond(msg.channel_id, msg.id, "🏓 Ping!").assume();
    if (reply === null) return;

    // Calculate ping
    const timestamp1 = (BigInt(msg.id) >> 22n) + EPOCH;
    const timestamp2 = (BigInt(reply.id) >> 22n) + EPOCH;
    const diff = timestamp2 - timestamp1;

    // Edit message to show ping
    this.ctx.api.messages.edit(msg.channel_id, reply.id, {
      content: `🏓 Pong! ${diff}ms`,
      allowed_mentions: { parse: ["everyone", "roles", "users"], replied_user: false },
    });
  }
}