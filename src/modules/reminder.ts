import Core, { types } from "../core/core";
import Decimal from "decimal.js";

type reminder = { id: string, author: string, channel: string, guild?: string, message: string, time: number, timeout?: NodeJS.Timeout };

const CMD = /^((?<opt_a>remind(\s+me)?\s+(?<time>\d{1,30}(\.\d{1,15})?)\s*(?<unit>s(ec(onds?)?)?|m(in(ute)?s?)?|h(ours?)?|d(ays?)?|w(eeks?)?|mo(nths?)?|y(ears?)?))|(?<opt_b>reminders?\s+(remove|delete)\s+(?<rm_target>all|\d+)$)|(?<opt_c>(my\s*)?reminders?)$)/;
const MAX_REMINDERS = 5;
const UNITS = { y: 31536000, mo: 2592000, w: 604800, d: 86400, h: 3600, m: 60, s: 1 };
const CACHE: { [key: string]: string } = {};
const DEC = Decimal.clone().set({ precision: 50 });

/*
  Time in the local class as well as databse is stored in seconds.
  For reference:
    Date now is in milliseconds.
    setTimeout takes in milliseconds.

  $ remind me 1.5 hours
  $ reminders remove 1
  $ my reminders
*/

export default class Reminder {
  public readonly ctx!: Core;
  public readonly id = "reminder";

  private reminders: reminder[] = [];

  public async init(ctx: Core): Promise<void> {
    await ctx.dbQuery("CREATE TABLE IF NOT EXISTS reminders (id serial, author bigint, channel bigint, guild bigint, message bigint, time integer);");
    const data = await ctx.dbQuery("SELECT * FROM reminders;");
  
    this.reminders = data.rows.map(v => ({
      id: v.id.toString(),
      author: v.author.toString(),
      channel: v.channel.toString(),
      guild: v.guild?.toString() ?? undefined,
      message: v.message.toString(),
      time: v.time,
    }));
  }

  @Core.listen("READY")
  public async onReady(): Promise<void> {
    // Set timeouts for reminders 
    this.reminders.forEach((v, i, s) => s[i].timeout = setTimeout(this.remind.bind(this, v), v.time * 1000 - Date.now()));
  }
  
  @Core.listen("MESSAGE_CREATE")
  public async onMessageCreate(msg: types.messages.Message): Promise<void> {
    const prefix = /^[$?!]\s*/.exec(msg.content.toLowerCase());
    
    if (!prefix) return;
    
    const match = CMD.exec(msg.content.slice(prefix[0].length).toLowerCase());
    if (!match) return;
    if (match.groups!.opt_a) return this.reminderAdd(msg, match);
    if (match.groups!.opt_b) return this.reminderRemove(msg, match);
    if (match.groups!.opt_c) return this.reminderList(msg);
  }

  // Add a reminder
  private async reminderAdd(msg: types.messages.Message, match: RegExpExecArray): Promise<any> {
    const reminders = this.reminders.filter(v => v.author === msg.author.id);
    if (reminders.length >= MAX_REMINDERS) return this.dm(msg.author.id, `You can only have ${MAX_REMINDERS} reminders at the same time.`);

    const time = new DEC(match.groups!.time);
    const unit = match.groups!.unit[0];
    
    // Convert to seconds
    const sec = time.mul(Object.entries(UNITS).find(v => unit.startsWith(v[0]))![1]);

    if (sec.lessThan(30)) return await this.dm(msg.author.id, "You can't set a reminder for less than 30 seconds.");
    if (sec.greaterThan(63072000)) return await this.dm(msg.author.id, "You can't set a reminder for more than 2 years.");

    // Add to database
    const whenRemind = sec.add(Date.now() / 1000).floor();
    const newReminderId = (await this.ctx.dbQuery("INSERT INTO reminders (author, channel, guild, message, time) VALUES ($1, $2, $3, $4, $5) RETURNING id;", 
      msg.author.id,
      msg.channel_id,
      msg.guild_id ?? null,
      msg.id,
      whenRemind.toString()
    )).rows[0].id.toString();

    // Add to local storage and set timeout
    this.reminders.push({ id: newReminderId, author: msg.author.id, channel: msg.channel_id, guild: msg.guild_id, message: msg.id, time: whenRemind.toNumber() });
    this.reminders.at(-1)!.timeout = setTimeout(this.remind.bind(this, this.reminders.at(-1)!), sec.mul(1000).toNumber());

    // Send confirmation
    this.dm(msg.author.id, `I'll remind you in <t:${sec.mul(1000).toNumber()}:R>! Use \`$ my reminders\` to see your reminders.`);
  }

  // Remove a reminder
  private async reminderRemove(msg: types.messages.Message, match: RegExpExecArray): Promise<any> {
    const target = match.groups!.rm_target;

    // Remove all reminders
    if (target === "all") {
      this.reminders.forEach(v => clearTimeout(v.timeout!));
      this.reminders = this.reminders.filter(v => v.author !== msg.author.id);
      await this.ctx.dbQuery("DELETE FROM reminders WHERE author = $1;", msg.author.id);
      return this.dm(msg.author.id, "All your reminders have been removed.");
    }
    
    // check if the reminder exists
    if (!this.reminders.some(v => v.id === target)) return this.dm(msg.author.id, "That reminder doesn't exist. Use `$ my reminders` to see your reminders.");

    // Remove the reminder
    this.reminders = this.reminders.filter(v => v.id !== target);
    await this.ctx.dbQuery("DELETE FROM reminders WHERE id = $1;", target);
    this.dm(msg.author.id, "That reminder has been removed.");
  }

  // display all reminders
  private async reminderList(msg: types.messages.Message): Promise<any> {
    const reminders = this.reminders.filter(v => v.author === msg.author.id);
    if (!reminders.length) return this.dm(msg.author.id, "You don't have any reminders. If you want to add one, use `$ remind me <time>`.");
  
    // Send the reminders
    const content = reminders.map(v => `**${v.id}** <t:${v.time * 1000}:F> https://discord.com/channels/${v.guild ?? "@me"}/${v.channel}/${v.message}`).join("\n");
    this.dm(msg.author.id, `You have ${reminders.length} reminders in total:\n${content}\n\nIf you want to delete some of your reminders, use \`$ reminders delete <id or all>\`.`);
  }

  // execute a reminder
  private async remind(reminder: reminder): Promise<void> {
    const url = `https://discord.com/channels/${reminder.guild ?? "@me"}/${reminder.channel}/${reminder.message}`;
    const content = (await this.ctx.api.messages.get(reminder.channel, { around: reminder.message, limit: 1 }))?.[0]?.content;

    this.dm(reminder.author, `[${reminder.id}] Your reminder is up!\n${url}\n\nMessage content: \`${content ?? "Message failed to load."}\``);
    
    this.reminders = this.reminders.filter(v => v.id !== reminder.id);
    this.ctx.dbQuery(`DELETE FROM reminders WHERE id = ${reminder.id};`);
  }

  // send a DM to a user
  private async dm(user: string, content: string): Promise<void> {
    const id = CACHE[user] ?? (await this.ctx.api.users.getChannel(user)).id;
    if (!CACHE[user]) CACHE[user] = id;

    await this.ctx.api.messages.send(id, {
      content,
      tts: false,
    });
  }
}