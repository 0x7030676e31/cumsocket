import Core, { types } from "../core";

export default class Ezvent {
  public readonly ctx!: Core;
  public readonly id: string = "ezevent";
  public readonly env: string[] = ["ezvent_channel", "ezvent_message", "ezvent_cooldown"];

  private self!: string;
  private target!: string;
  private message!: string;
  private cooldown: number = 0;

  private timeout: NodeJS.Timeout | null = null;

  public async load(ctx: Core): Promise<void> {
    // get bot's id
    this.self = ctx.getSelfId();
    
    // get env vars
    this.target = process.env.ezvent_channel!;
    this.message = process.env.ezvent_message!;
    this.cooldown = +process.env.ezvent_cooldown! * 1000;

    // check if last message is sent by bot, if not - send one
    const message = await ctx.api.messages.get(this.target, { limit: 1 }).expect(() => null);
    if (message === null) return;
    if (message[0].author.id !== this.self) this.send();
  }

  @Core.listen("MESSAGE_CREATE")
  public async onMessage(msg: types.MESSAGE_CREATE): Promise<void> {
    if (msg.author.id === this.self || msg.channel_id !== this.target) return;

    // set timeout for next message
    if (this.timeout !== null) clearTimeout(this.timeout);
    this.timeout = setTimeout(this.send.bind(this), this.cooldown);
  }

  // send message and reset timeout
  private async send(): Promise<void> {
    this.ctx.api.messages.send(this.target, { content: this.message });
    this.timeout = null;
  }
}