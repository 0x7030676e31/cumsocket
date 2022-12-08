import Core, { types } from "../core/index.js";
import { ChatGPTAPI } from "chatgpt";

export default class ChatGPT {
  public readonly ctx!: Core;
  public readonly id: string = "chatgpt";
  public readonly env: string[] = ["chatgpt_token"];
  
  private mention!: string;
  private api!: ChatGPTAPI;
  private free: boolean = true;

  public async load(ctx: Core): Promise<void> {
    this.mention = `<@${ctx.getSelfId()}>`;
    this.api = new ChatGPTAPI({
      sessionToken: process.env.chatgpt_token!
    });
    await this.api.ensureAuth();
  }

  @Core.listen("MESSAGE_CREATE")
  public async onMessage(msg: types.MESSAGE_CREATE): Promise<any> {
    if (!msg.content.startsWith(this.mention)) return;

    const content = msg.content.slice(this.mention.length).trim();
    if (!content) return;
    
    if (!this.free) return this.ctx.api.messages.reactionAdd(msg.channel_id, msg.id, "💬");
    this.free = false;

    const { id } = await this.ctx.api.messages.respond(msg.channel_id, msg.id, "📨 Waiting for ChatGPT response...").unwrap();
    this.api.sendMessage(content, { timeoutMs: 30_000 }).then(async (content) => {
      await this.ctx.api.messages.edit(msg.channel_id, id, { content: content }).get();
      setTimeout(() => this.free = true, 3000);
    }, async (err) => {
      await this.ctx.api.messages.edit(msg.channel_id, id, { content: "⚠️ ChatGPT encountered an error: " + err.message }).get();
      setTimeout(() => this.free = true, 3000);
    });
  }
}