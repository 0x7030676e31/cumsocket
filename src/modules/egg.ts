import Core, { types } from "../core/index.js";

const EGGS = ["🥚", "🍳"];
const REG = /egg|🥚|🍳/i; 

export default class Egg {
  public readonly ctx!: Core;
  public readonly id: string = "egg";
  public readonly env: string[] = [ "rare_egg_chance" ];
  
  // Bot's id
  private self!: string;
  // Chance of getting a rare egg
  private chance!: number;
  // Egg count
  private count?: number;
  private trackCount: boolean = false;


  public async load(ctx: Core): Promise<void> {
    // Set up env and self id
    this.self = ctx.getIdFromToken();
    this.chance = +process.env.rare_egg_chance!
    
    // Check if storage is available
    const storage = ctx.storage;
    if (!storage) return;

    // Get egg count from storage
    await storage.setIfNotExists("egg_count", "0");
    this.count = storage.numericGet("egg_count");
    this.trackCount = true;
  }

  @Core.listen("MESSAGE_CREATE")
  public async onMessage(msg: types.MESSAGE_CREATE): Promise<any> {
    if (msg.author.id === this.self || !REG.test(msg.content)) return;
    
    // Add egg reaction
    this.addEgg(msg.channel_id, msg.id);
  }

  @Core.listen("MESSAGE_UPDATE")
  public async onMessageUpdate(msg: types.MESSAGE_UPDATE): Promise<any> {
    if (msg.author?.id === this.self) return;

    // Check if new message content contains egg
    const eggContent = REG.test(msg.content ?? "");
    
    // Check if message has egg reaction (error if fetching failed)
    const eggReaction = await this.hasEgg(msg.channel_id, msg.id);
    if (eggReaction === null) return;

    // Add/remove egg reaction depending on content and reactions
    if (eggContent && eggReaction === false) return this.addEgg(msg.channel_id, msg.id);
    if (!eggContent && eggReaction !== false) return this.removeEgg(msg.channel_id, msg.id, eggReaction);
  }

  // Check if a message has an egg reaction (false - no reaction, string - egg reaction, null - error)
  private async hasEgg(channel: string, id: string): Promise<false | string | null> {
    // Fetch message
    const messages = await this.ctx.api.messages.get(channel, { around: id, limit: 1 }).assume();
    if (!messages) return null;
    
    // Check if message has reactions
    const message = messages[0];
    if (!message.reactions) return false;

    // Find the egg reaction
    return message.reactions.find(v => v.me && EGGS.includes(v.emoji.name))?.emoji.name ?? false;
  }

  // Generate a random egg emoji
  private getEgg(): string {
    return EGGS[Math.random() > this.chance ? 0 : 1];
  }

  // Add egg reaction to the message
  private async addEgg(channel: string, message: string): Promise<void> {
    this.ctx.api.messages.reactionAdd(channel, message, this.getEgg());
    if (!this.trackCount) return;

    this.count = await this.ctx.storage!.numericIncr("egg_count");
  }

  // Remove egg reaction from the message
  private async removeEgg(channel: string, message: string, egg: string): Promise<void> {
    this.ctx.api.messages.reactionDelete(channel, message, egg);
    if (!this.trackCount) return;

    this.count = await this.ctx.storage!.numericDecr("egg_count");
  }
}
