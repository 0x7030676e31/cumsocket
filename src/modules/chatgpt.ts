import Core, { types } from "../core/index.js";
import { ChatGPTAPI } from "chatgpt";

export default class ChatGPT {
  public readonly ctx!: Core;
  public readonly id: string = "chatgpt";
  public readonly env: string[] = ["chatgpt_token", "chatgpt_timeout", "chatgpt_cooldown"];
  
  private mention!: string;
  private api!: ChatGPTAPI;
  private free: boolean = true;
  private timeout!: number;
  private cooldown!: number;

  public async load(ctx: Core): Promise<void> {
    this.timeout = +process.env.chatgpt_timeout!;
    this.cooldown = +process.env.chatgpt_cooldown!;
    this.mention = `<@${ctx.getSelfId()}>`;

    // init chatgpt
    this.api = new ChatGPTAPI({
      sessionToken: process.env.chatgpt_token!
    });
    await this.api.ensureAuth();
  }

  @Core.listen("MESSAGE_CREATE")
  public async onMessage(msg: types.MESSAGE_CREATE): Promise<any> {
    // check if message starts with mention
    if (!msg.content.startsWith(this.mention)) return;

    // get content
    const content = msg.content.slice(this.mention.length).trim();
    if (!content) return;
    
    // check if chatgpt is free
    if (!this.free) return this.ctx.api.messages.reactionAdd(msg.channel_id, msg.id, "💬");
    this.free = false;

    // send waiting message
    const { id } = await this.ctx.api.messages.respond(msg.channel_id, msg.id, "📨 Waiting for ChatGPT response...").unwrap();
    
    // ask chatgpt
    setTimeout(() => this.free = true, this.cooldown);
    this.api.sendMessage(content, { timeoutMs: this.timeout }).then(
      content => this.edit(msg.channel_id, id, content),
      err => this.edit(msg.channel_id, id, "⚠️ ChatGPT encountered an error: " + err.message),
    );
  }

  private async edit(channel_id: string, id: string, content: string): Promise<void> {
    this.ctx.api.messages.edit(channel_id, id, { content: content, allowed_mentions: { parse: ["everyone", "roles", "users"], replied_user: false }, });
  }
}