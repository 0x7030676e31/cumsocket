import Core, { types, apiTypes } from "../core/index.js";

// Copy attachments (images and videos) from selected channels and send them via webhook

export default class Bridge {
  public readonly ctx!: Core;
  public readonly id: string = "bridge";
  public readonly env: string[] = ["bridge_from", "bridge_webhook_id", "bridge_webhook_token"];

  private _from: string[] = [];
  private _webhook: [string, string] = ["", ""];

  public async load(): Promise<void> {
    this._from = process.env.bridge_from!.split(/\s+/);
    this._webhook = [process.env.bridge_webhook_id!, process.env.bridge_webhook_token!];
  }

  @Core.listen("MESSAGE_CREATE")
  public async onMessageCreate(msg: types.MESSAGE_CREATE): Promise<void> {
    // Check if message is from selected channel and not from bot
    if (!this._from.includes(msg.channel_id) || msg.author.bot) return;
  
    // Get all attachments from the message
    const urls = msg.embeds.filter(v => /image|video/.test(v.type!)).map(v => v.url);
    const att = msg.attachments.filter(v => /^(image|video)/.test(v.content_type!)).map(v => v.url);

    // Create list of attachments
    const content = [...urls, ...att].join("\n");
    if (!content) return;

    // Send message to webhook
    const avatar_url = this.getAvatar(msg.author);
    this.ctx.api.webhooks.execute(...this._webhook, { content, username: msg.author.username, ...(avatar_url && { avatar_url }) });
  }

  // Get avatar url from user
  private getAvatar(author: apiTypes.users.Author): string | null {
    return author.avatar ? `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}` : null;
  }
}