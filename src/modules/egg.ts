import Core, { types } from "../core/index.js";
// import { exec } from "child_process";
// import zmq from 'zeromq';

const EGGS = ["🥚", "🍳"];
const REG = /egg|🥚|🍳/i; 
const PORT = 5555;
const ATT_REG = /^image(?!=\/gif)/;

export default class Egg {
  public readonly ctx!: Core;
  public readonly id: string = "egg";
  public readonly env: string[] = ["rare_egg_chance", "egg_ai_threshold"];
  
  private self!: string;
  private chance!: number;
  private threshold!: number;
  private count!: number;
  // private client!: zmq.Request;

  public async load(ctx: Core): Promise<void> {
    this.self = ctx.getSelfId();
    this.chance = +process.env.rare_egg_chance!
    this.threshold = +process.env.egg_ai_threshold!
    
    const storage = ctx.storage!;
    if (!storage.has("egg_count")) await storage.set("egg_count", "0");
    this.count = +storage.get("egg_count")!;


    // run egg ai server
    // exec("python3 ai/egg_detector.py");

    // load zmq client
    // this.client = new zmq.Request();
    // this.client.connect(`tcp://localhost:${PORT}`);
  }

  @Core.listen("MESSAGE_CREATE")
  public async onMessage(msg: types.MESSAGE_CREATE): Promise<any> {
    if (msg.author.id === this.self) return;
    
    // add a random egg reaction
    if (REG.test(msg.content)) return this.addEgg(msg.channel_id, msg.id);

    // get attachments and check if they contain an egg
    const urls = msg.attachments.filter(v => v.content_type && ATT_REG.test(v.content_type)).map(v => v.url);
    if (!urls.length) return;

    const hasEgg = await this.hasEggAI(urls);
    if (hasEgg) this.addEgg(msg.channel_id, msg.id);
  }

  @Core.listen("MESSAGE_UPDATE")
  public async onMessageUpdate(msg: types.MESSAGE_UPDATE): Promise<any> {
    if (msg.author?.id === this.self) return;

    // get attachments
    const urls = msg.attachments?.filter(v => v.content_type && ATT_REG.test(v.content_type)).map(v => v.url) || [];

    // check if the message has an egg reaction and if content matches egg pattern or contains an egg in one of the attachments
    const hasEggContent = REG.test(msg.content ?? "") || await this.hasEggAI(urls);
    const hasEggReaction = await this.hasEgg(msg.channel_id, msg.id);
  
    if (hasEggReaction === null) return;

    // add/remove egg reaction depending on content and reactions
    if (hasEggContent && hasEggReaction === false) return this.addEgg(msg.channel_id, msg.id);
    if (!hasEggContent && hasEggReaction !== false) return this.removeEgg(msg.channel_id, msg.id, hasEggReaction);
  }

  // check if a message has an egg reaction
  private async hasEgg(channel: string, id: string): Promise<false | string | null> {
    const messages = await this.ctx.api.messages.get(channel, { around: id, limit: 1 }).unwrap();
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

  // check if an image contains an egg using the egg ai
  private async hasEggAI(urls: string[]): Promise<boolean> {
    return false;

    // for (const url of urls) {
    //   this.client.send(url);
    //   const value = (await this.client.receive()).toString();
    //   if (+value >= this.threshold) return true;
    // }

    // return false;
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
