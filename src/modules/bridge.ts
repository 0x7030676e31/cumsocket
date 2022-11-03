import Core from "../core/core";
import api from "../api";
import * as types from "../api/types";

// const CTYPES = [];

export default class Bridge {
  public readonly ctx!: Core;
  public readonly id = "bridge";
  public readonly env = ["bridge_from", "bridge_webhook_id", "bridge_webhook_token"];

  private _from: string[] = [];
  private _webhook: [string, string] = ["", ""];

  public async init(ctx: Core): Promise<void> {
    this._from = process.env.bridge_from!.split(/\s*,\s*/);
    this._webhook = [process.env.bridge_webhook_id!, process.env.bridge_webhook_token!];
  
  }

  @Core.listen("MESSAGE_CREATE")
  public async onMessageCreate(msg: types.messages.Message): Promise<void> {
    if (!this._from.includes(msg.channel_id) || msg.author.bot) return;
  
    const urls = msg.embeds.filter(v => /image|video/.test(v.type!)).map(v => v.url);
    const att = msg.attachments.filter(v => /^(image|video)/.test(v.content_type!)).map(v => v.url);

    const content = [...urls, ...att].join("\n");
    api.webhooks.execute(...this._webhook, { content, username: msg.author.username, avatar_url: this.getAvatar(msg.author) });
  }

  private getAvatar(author: types.users.Author): string {
    return author.avatar ? `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png` : "https://i.pinimg.com/736x/91/ce/69/91ce69b6c7c6ab40b1d35808979394a5.jpg";
  }
}