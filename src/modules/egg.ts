import Core, { types } from "../core/core";

const EGGS = ["🥚", "🍳"];
const REG = /egg|🥚|🍳/i;

export default class Egg {
  public readonly ctx!: Core;
  public readonly id = "egg";
  public readonly env = ["rare_egg_chance"];

  private self!: string;

  @Core.listen("READY")
  public async onReady(data: any): Promise<void> {
    this.self = data.user.id;
  }

  // react to messages with an egg emoji
  @Core.listen("MESSAGE_CREATE")
  public async onMessageCreate(msg: types.messages.Message): Promise<void> {
    if (!REG.test(msg.content) || msg.author.id === this.self) return;
  
    this.ctx.api.messages.react(msg.channel_id, msg.id, this.getEgg());
  }

  // check if a message has an egg emoji or contains egg word and delete / add emoji
  @Core.listen("MESSAGE_EDIT")
  public async onMessageEdit(msg: types.messages.Message): Promise<void> {
    if (msg.author.id === this.self) return;
    
    const hasEggEmoji = await this.hasEgg(msg.channel_id, msg.id);
    const hasEggText = REG.test(msg.content);

    if (hasEggEmoji && !hasEggText) this.ctx.api.messages.reactionDelete(msg.channel_id, msg.id, hasEggEmoji);
    else if (!hasEggEmoji && hasEggText) this.ctx.api.messages.react(msg.channel_id, msg.id, this.getEgg());
  }

  // check if a message has an egg emoji
  private async hasEgg(channel: string, message: string): Promise<null | string> {
    const messages = await this.ctx.api.messages.get(channel, { limit: 1, around: message });
    return messages[0].reactions?.find(r => EGGS.includes(r.emoji.name))?.emoji.name ?? null;
  }

  // get a random egg emoji
  private getEgg(): string {
    return EGGS[Math.random() > +process.env.rare_egg_chance! ? 0 : 1];
  }
}
