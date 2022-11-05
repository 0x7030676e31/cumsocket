import Core from "../core/core";
import api from "../api";
import * as types from "../api/types";

const EGGS = ["🥚", "🍳"];

export default class Egg {
  public readonly ctx!: Core;
  public readonly id = "egg";
  public readonly env = ["rare_egg_chance"];

  private self!: string;

  @Core.listen("READY")
  public async onReady(data: any): Promise<void> {
    this.self = data.user.id;
  }

  @Core.listen("MESSAGE_CREATE")
  public async onMessageCreate(msg: types.messages.Message): Promise<void> {
    if (!msg.content.toLowerCase().includes("egg") || msg.author.id === this.self) return;
  
    api.messages.react(msg.channel_id, msg.id, this.getEgg());
  }

  @Core.listen("MESSAGE_EDIT")
  public async onMessageEdit(msg: types.messages.Message): Promise<void> {
    if (msg.author.id === this.self) return;
    
    const hasEggEmoji = await this.hasEgg(msg.channel_id, msg.id);
    const hasEggText = msg.content.toLowerCase().includes("egg");

    if (hasEggEmoji && !hasEggText) api.messages.reactionDelete(msg.channel_id, msg.id, hasEggEmoji);
    else if (!hasEggEmoji && hasEggText) api.messages.react(msg.channel_id, msg.id, this.getEgg());
  }

  private async hasEgg(channel: string, message: string): Promise<null | string> {
    const messages = await api.messages.get(channel, { limit: 1, around: message });
    return messages[0].reactions?.find(r => EGGS.includes(r.emoji.name))?.emoji.name ?? null;
  }

  private getEgg(): string {
    return EGGS[Math.random() > +process.env.rare_egg_chance! ? 0 : 1];
  }
}
