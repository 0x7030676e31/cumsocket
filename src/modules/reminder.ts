import Core, { types } from "../core/core";
import Decimal from "decimal.js";

type reminder = { id: string, author: string, channel: string, guild?: string, message: string, time: number, timeout?: NodeJS.Timeout };

const CMD = /^[$?!]\s*remind(\s*me)?\s*(?<time>\d{1,30}(\.\d{1,15})?)\s*(?<unit>s(ec)?|m(mins?)?|d(ays?)?|w(eeks?)?|mo(nths?)?|y(ears?)?)$/;
const UNITS = { y: 31536000, mo: 2592000, w: 604800, d: 86400, h: 3600, m: 60, s: 1 };
const CACHE: { [key: string]: string } = {};
const DEC = Decimal.clone().set({ precision: 50 });

export default class Reminder {
  public readonly ctx!: Core;
  public readonly id = "reminder";

  public ignore = true;

  private reminders: reminder[] = [];

  public async init(ctx: Core): Promise<void> {
    await ctx.dbQuery("CREATE TABLE IF NOT EXISTS reminders (id serial, author bigint, channel bigint, guild bigint, message bigint, time integer);");
    const data = await ctx.dbQuery("SELECT * FROM reminders;");
  
    this.reminders = data.rows.map(v => /* TODO */ null as any);
  }

  @Core.listen("READY")
  public async onReady(): Promise<void> {
    this.reminders.forEach((v, i, s) => s[i].timeout = setTimeout(this.remind.bind(this, v), v.time - Date.now()));
  }
  
  @Core.listen("MESSAGE_CREATE")
  public async onMessageCreate(msg: types.messages.Message): Promise<void> {
    const match = CMD.exec(msg.content.toLowerCase());
    if (!match) return;

    const reminders = this.reminders.filter(v => v.author === msg.author.id);
    if (reminders.length >= 5) return this.dm(msg.author.id, "You can only have 5 reminders at the same time.");


    const time = new DEC(match.groups!.time);
    const unit = match.groups!.unit[0];
    
    const sec = time.mul(Object.entries(UNITS).find(([u, v]) => unit.startsWith(u))![1]);

    if (sec.lessThan(30)) return await this.dm(msg.author.id, "You can't set a reminder for less than 30 seconds.");
    if (sec.greaterThan(63072000)) return await this.dm(msg.author.id, "You can't set a reminder for more than 2 years.");

    const whenRemind = sec.add(Date.now() / 1000).floor();
    const response = (await this.ctx.dbQuery("INSERT INTO reminders (author, channel, guild, message, time) VALUES ($1, $2, $3, $4, $5) RETURNING id;", 
      msg.author.id,
      msg.channel_id,
      msg.guild_id ?? null,
      msg.id,
      whenRemind.toString()
    )).rows[0].id;
    this.reminders.push({ id: response, author: msg.author.id, channel: msg.channel_id, guild: msg.guild_id, message: msg.id, time: whenRemind.toNumber() });
    this.reminders.at(-1)!.timeout = setTimeout(this.remind.bind(this, this.reminders.at(-1)!), sec.mul(1000).toNumber());
  }

  private async remind(reminder: reminder): Promise<void> {
    const url = `https://discord.com/channels/${reminder.guild ?? "@me"}/${reminder.channel}/${reminder.message}`;
    this.dm(reminder.author, `Your reminder is up! ${url}`);
    
    this.reminders = this.reminders.filter(v => v.id !== reminder.id);
    this.ctx.dbQuery(`DELETE FROM reminders WHERE id = ${reminder.id};`);
  }

  private async dm(user: string, content: string): Promise<void> {
    const id = CACHE[user] ?? (await this.ctx.api.users.getChannel(user)).id;
    if (!CACHE[user]) CACHE[user] = id;

    await this.ctx.api.messages.send(id, {
      content,
      tts: false,
    });
  }
}