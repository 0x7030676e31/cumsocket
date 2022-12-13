import Webhooks from "./webhooks.js";
import Message from "./messages.js";
import Core from "../core/index.js";

export default class {
  private readonly ctx: Core;

  public webhooks!: Webhooks;
  public messages!: Message;
  
  constructor(ctx: Core) {
    this.ctx = ctx;

    this.webhooks = new Webhooks(ctx);
    this.messages = new Message(ctx);
  }
}