import Core, { types } from "../core/index.js";

const EGGS = ["🥚", "🍳"];
const REG = /egg|🥚|🍳/i; 

export default class Egg {
  public readonly ctx!: Core;
  public readonly id: string = "egg";
  public readonly env: string[] = ["rare_egg_chance"];
  
  private self!: string;
  private chance!: number;
  private count!: number;

  public async load(ctx: Core): Promise<void> {
    this.self = ctx.getSelfId();
    this.chance = +process.env.rare_egg_chance!
    
    const storage = ctx.storage!;
    await storage.setIfNotExists("egg_count", "0");
    this.count = +storage.get("egg_count")!;
  }

  @Core.listen("MESSAGE_CREATE")
  public async onMessage(msg: types.MESSAGE_CREATE): Promise<any> {
    if (msg.author.id === this.self || !REG.test(msg.content)) return;
    
    // add a random egg reaction
    this.addEgg(msg.channel_id, msg.id);
  }

  @Core.listen("MESSAGE_UPDATE")
  public async onMessageUpdate(msg: types.MESSAGE_UPDATE): Promise<any> {
    if (msg.author?.id === this.self) return;

    // check if the message has an egg reaction and if content matches egg pattern
    const hasEggContent = REG.test(msg.content ?? "");
    const hasEggReaction = await this.hasEgg(msg.channel_id, msg.id);
  
    if (hasEggReaction === null) return;

    // add/remove egg reaction depending on content and reactions
    if (hasEggContent && hasEggReaction === false) return this.addEgg(msg.channel_id, msg.id);
    if (!hasEggContent && hasEggReaction !== false) return this.removeEgg(msg.channel_id, msg.id, hasEggReaction);
  }

  // check if a message has an egg reaction
  private async hasEgg(channel: string, id: string): Promise<false | string | null> {
    const messages = await this.ctx.api.messages.get(channel, { around: id, limit: 1 }).assume();
    if (!messages) return null;
    
    const message = messages[0];
    if (!message.reactions) return false;

    // find the egg reaction
    return message.reactions.find(v => v.me && EGGS.includes(v.emoji.name))?.emoji.name ?? false;
  }

  // generate a random egg
  private getEgg(): string {
    return EGGS[Math.random() > this.chance ? 0 : 1];
  }

  private async addEgg(channel: string, message: string): Promise<void> {
    this.ctx.api.messages.reactionAdd(channel, message, this.getEgg());
    this.count++;
    await this.ctx.storage!.set("egg_count", this.count.toString());
  }

  private async removeEgg(channel: string, message: string, egg: string): Promise<void> {
    this.ctx.api.messages.reactionDelete(channel, message, egg);
    this.count--;
    await this.ctx.storage!.set("egg_count", this.count.toString());
  }
}
