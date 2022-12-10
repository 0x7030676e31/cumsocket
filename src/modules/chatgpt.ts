import Core, { types } from "../core/index.js";
import { ChatGPTAPI, ChatGPTConversation } from "chatgpt";

const BAD_WORDS = new RegExp(Buffer.from("KD88IVthLXpBLVpdKSg/OmN1bXxzZW1lbnxjb2NrfHB1c3N5fGN1bnR8bmlnZy5yKSg/IVthLXpBLVpdKQ==", "base64").toString());
const MAX_REQUESTS = 3;

export default class ChatGPT {
  public readonly ctx!: Core;
  public readonly id: string = "chatgpt";
  public readonly env: string[] = ["chatgpt_token", "chatgpt_timeout", "chatgpt_cooldown"];
  
  private mention!: string;
  private api!: ChatGPTAPI;
  private requests: number = 0;
  private lastRequest: number = 0;
  private timeout!: number;
  private cooldown!: number;
  private convo!: ChatGPTConversation;

  public async load(ctx: Core): Promise<void> {
    this.timeout = +process.env.chatgpt_timeout!;
    this.cooldown = +process.env.chatgpt_cooldown!;
    this.mention = `<@${ctx.getSelfId()}>`;

    // init chatgpt
    this.api = new ChatGPTAPI({
      sessionToken: process.env.chatgpt_token!
    });
    await this.api.ensureAuth();
    this.convo = this.api.getConversation();
  }

  @Core.listen("MESSAGE_CREATE")
  public async onMessage(msg: types.MESSAGE_CREATE): Promise<any> {
    // check if message starts with mention
    if (!msg.content.startsWith(this.mention)) return;

    // get content
    const content = msg.content.slice(this.mention.length).trim();
    if (!content) return;
    
    // check if too many requests are currently being processed
    if (this.requests === MAX_REQUESTS) return this.ctx.api.messages.reactionAdd(msg.channel_id, msg.id, "💬");
    this.requests++;

    // wait for cooldown
    const diff = Date.now() - this.lastRequest;
    if (diff < this.cooldown) await new Promise(resolve => setTimeout(resolve, this.cooldown - diff));
    this.lastRequest = Date.now();

    // send waiting message
    const { id } = await this.ctx.api.messages.respond(msg.channel_id, msg.id, "📨 Waiting for ChatGPT response...").unwrap();
    
    // ask chatgpt
    await this.convo.sendMessage(content, { timeoutMs: this.timeout }).then(
      content => this.edit(msg.channel_id, id, this.validate(content)),
      err => this.edit(msg.channel_id, id, "⚠️ ChatGPT encountered an error: " + err.message),
    );

    this.requests--;
  }

  // validate response
  private validate(input: string): string {
    if (BAD_WORDS.test(input)) return "⚠️ ChatGPT response contains bad words that are not allowed.";
    if (input.length > 2000) return "⚠️ ChatGPT response is too long. (placeholder message)";
    return input;
  }

  private async edit(channel_id: string, id: string, content: string): Promise<void> {
    this.ctx.api.messages.edit(channel_id, id, { content: content, allowed_mentions: { parse: ["everyone", "roles", "users"], replied_user: false }, });
  }
}