import Core, { types } from "../core";
import Expression from "./expression";

type dbMain = { id: number, module: string, state: boolean }[];
type dbRules = { parent: number, state: boolean, prior: number, expr: string}[];
type perms = { [key: string]: { state: boolean, rules: { state: boolean, prior: number, expr: Expression, temp?: true }[] }};
type meta = { user: string, channel: string, guild?: string, message: string };

const CMD = /^[?!$]\s*perms\s+((?<id>[a-z]{1,16})\s+(?<method>list|add\s+(?<add_state>(allow|block)\s+)?(:(?<add_priority>\d+)\s+)?(?<add_expr>[\da-z\s&|()!=]+)|(remove|delete)\s+(?<remove_range>all|\d+\.\.\d+|\.\.\d+|\d+\.\.|\d+)|cleanup|state\s+((?<state_prior>\d+)\s+)?(?<state>allow|block)|move\s+(?<move_from>\d+)\s+to\s+(?<move_to>\d+))|(?<root>--(list|cleanup|clearall)$))$/;

export default class Permissions {
  public readonly ctx!: Core;
  public readonly id = "permissions"; 

  private perms: perms = {};
  private refers: [string, number][] = [];

  private meta: meta = { user: "", channel: "", message: "" };

  // load the permissions
  public async init(ctx: Core) {
    await ctx.dbQuery("CREATE TABLE IF NOT EXISTS permsMain (id serial, module varchar(16), state boolean);");
    await ctx.dbQuery("CREATE TABLE IF NOT EXISTS permsRules (parent integer, state boolean, prior smallint, expr text);");
    
    const permsMain: dbMain = (await ctx.dbQuery("SELECT * FROM permsMain;")).rows;
    const permsRules: dbRules = (await ctx.dbQuery("SELECT * FROM permsRules;")).rows;

    // insert missing modules
    const missing = ctx.ids.filter(id => !permsMain.some(v => v.module === id));
    if (missing.length) ctx.dbQuery(`INSERT INTO permsMain (module, state) VALUES ${missing.map(v => `('${v}', true)`).join(", ")};`);

    const max = Math.max(...permsMain.map(v => v.id), 0);
    missing.forEach((v, i) => permsMain.push({ id: max + i + 1, module: v, state: true }));
    
    let modulesCount = 0;
    let rulesCount = 0;

    // process the permissions
    permsMain.forEach(v => {
      if (!ctx.ids.includes(v.module)) return;
      this.refers.push([v.module, v.id]);
      this.perms[v.module] = { state: v.state, rules: [] };
      modulesCount++;
    });
    permsRules.forEach(v => {
      const parent = this.refers.find(ref => ref[1] === v.parent)?.[0];
      if (!parent) return;
      this.perms[parent].rules.push({ state: v.state, prior: v.prior, expr: Expression.decode(v.expr) });
      rulesCount++;
    });

    ctx.log("Permissions", `Successfully loaded ${rulesCount} rules for ${modulesCount - missing.length} modules.`);
  }

  // Process event and execute callback if all conditions are met
  public async process(id: string, callback: (data: any, events: string) => Promise<void> | void, payload: any, event: string, ): Promise<void> {
    if (!this.perms[id]) {
      callback(payload, event);
      return;
    }

    // extract data from payload
    let guild: string;
    let channel: string;
    let user: string;
    switch (event) {
      case "MESSAGE_CREATE":
      case "MESSAGE_UPDATE":
      case "MESSAGE_DELETE":
      case "MESSAGE_DELETE_BULK":
        guild = payload.guild_id;
        channel = payload.channel_id;
        user = payload.author.id;
        break;

      // I will add more events later

      default:
        // console.log(`Executing callback for ${event} event without permissions for id ${id}, not supported yet`);
        callback(payload, event);
        return;
    }

    // check if any expression is true
    const perms = this.perms[id];
    for (const rule of perms.rules) {
      const passed = rule.expr.exec({ guild, channel, user });
      if (!passed) continue;

      if (rule.state) callback(payload, event);
      return;
    }

    if (perms.state) callback(payload, event);
  }

  // handle a command
  @Core.listen("MESSAGE_CREATE")
  public async onMessageCreate(msg: types.messages.Message): Promise<void> {
    const match = CMD.exec(msg.content.toLowerCase());
    if (!match) return;

    // save the meta data
    const groups = match.groups!;
    const ids = this.ctx.ids;
    this.meta.user = msg.author.id;
    this.meta.channel = msg.channel_id;
    this.meta.guild = msg.guild_id;
    this.meta.message = msg.id;

    // perform root operations
    if (groups.root) {
      switch (groups.root) {
        // list all modules + their state, index and amount of rules
        case "--list":
          const numMaxLength = Math.max(...this.refers.map(v => v[1].toString().length));
          const idMaxLength = Math.max(...this.refers.map(v => v[0].length));
          const rulesMaxLength = Math.max(...Object.values(this.perms).map(v => v.rules.length.toString().length));
          
          const content = this.refers.map(([name, idx]) => `${idx}.${" ".repeat(numMaxLength - idx.toString().length)} | ${name}${" ".repeat(idMaxLength - name.length)} | ${this.perms[name].state ? "allow" : "block"} | ${this.perms[name].rules.length}${" ".repeat(rulesMaxLength - this.perms[name].rules.length)}|${ids.includes(name) ? "" : " unused"}`).join("\n");
          this.respond(`\`\`\`\n${content}\n\`\`\``);
          break;

        // remove all unused modules from the database
        case "--cleanup":
          const unused = this.refers.filter(([name]) => !ids.includes(name));
          if (unused.length) {
            await this.ctx.dbQuery(`DELETE FROM permsMain WHERE id IN (${unused.map(v => v[1]).join(", ")});`);
            await this.ctx.dbQuery(`DELETE FROM permsRules WHERE parent IN (${unused.map(v => v[1]).join(", ")});`);
          }
          
          // TODO: reorder the ids in permsMain and permsRules (not necessary, but nice to have)
          this.respond(`Successfully cleaned up ${unused.length} unused modules.`);
          break; 

        // deletes everything from the database and insert fresh data
        case "--clearall":
          await this.ctx.dbQuery("TRUNCATE TABLE permsMain RESTART IDENTITY;");
          await this.ctx.dbQuery("TRUNCATE TABLE permsRules;");
          await this.ctx.dbQuery(`INSERT INTO permsMain (module, state) VALUES ${ids.map(v => `(${v}, true)`).join(", ")};`);

          this.refers = [];
          ids.forEach((v, i) => {
            this.perms[v] = { state: true, rules: [] };
            this.refers.push([v, i + 1]);
          });

          this.respond("Cleared all permissions.");
          break;
      }
      return;
    }

    // get the id and check if it exists
    const id = groups.id;
    if (!ids.includes(id)) {
      this.respond(`Module "${id}" does not exist.`);
      return;
    }

    const parent = this.refers.find(v => v[0] === id)![1];
    const perms = this.perms[id];

    // perform basic operations on the specific module
    const action = groups.method.match(/^[a-z]+/)![0];
    switch (action) {
      // display the rules
      case "list":
        const priorMaxLength = Math.max(...perms.rules.map(v => v.prior.toString().length));
        const content = perms.rules.map(v => `${v.prior}.${" ".repeat(priorMaxLength - v.prior.toString().length)} | ${v.state ? "allow" : "block"} | ${v.expr.stringify()}`).join("\n");
        this.respond(`Current default state: **${perms.state ? "allow" : "block"}**${content ? `\n\`\`\`\n${content}\n\`\`\`` : ""}`);
        break;

      // add a new rule
      case "add":
        const state = groups.add_state.trim() === "allow";
        const prior = isNaN(+groups.add_prior) ? Math.max(...perms.rules.map(v => v.prior), -1) + 1 : +groups.add_prior;
        const expr = groups.add_expr
        
        const expression = new Expression(expr.replaceAll("uthis", this.meta.user).replaceAll("gthis", this.meta.guild ?? "0").replaceAll("cthis", this.meta.channel));
        const error = expression.parse();

        if (typeof error === "string") {
          this.respond(`Failed to parse expression: ${error}`);
          return;
        }

        await this.insert(id, state, prior, expression);
        this.respond(`Successfully added rule with state ${state ? "allow" : "block"} and prior ${prior} to module "${id}".`);
        break;

      // delete a specific range of rules
      case "remove":
      case "delete":
        const range = groups.remove_range;
        let count: number = 0;
        if (range === "all") {
          count = perms.rules.length;
          await this.ctx.dbQuery(`DELETE FROM permsRules WHERE parent = ${parent};`);
          perms.rules = [];
        } else if (/^\d+$/.test(range)) {
          await this.ctx.dbQuery(`DELETE FROM permsRules WHERE parent = ${parent} AND prior = ${range};`);
          if (perms.rules.some(v => v.prior === +range)) {
            count = 1;
            perms.rules.splice(perms.rules.findIndex(v => v.prior === +range), 1);
          }
        } else if (/^\d+\.\.\d+/.test(range)) {
          const [start, end] = range.split("..").map(v => +v);
          await this.ctx.dbQuery(`DELETE FROM permsRules WHERE parent = ${parent} AND prior BETWEEN ${start} AND ${end};`);
          count = perms.rules.filter(v => v.prior >= start && v.prior <= end).length;
          perms.rules = perms.rules.filter(v => v.prior < start || v.prior > end);
        } else if (/^\.\.\d+/.test(range)) {
          const end = +range.slice(2);
          await this.ctx.dbQuery(`DELETE FROM permsRules WHERE parent = ${parent} AND prior <= ${end};`);
          count = perms.rules.filter(v => v.prior <= end).length;
          perms.rules = perms.rules.filter(v => v.prior > end);
        } else {
          const start = +range.slice(2);
          await this.ctx.dbQuery(`DELETE FROM permsRules WHERE parent = ${parent} AND prior >= ${start};`);
          count = perms.rules.filter(v => v.prior >= start).length;
          perms.rules = perms.rules.filter(v => v.prior < start);
        }

        this.respond(`Successfully removed ${count} rules from module "${id}".`);
        break;

      // reorders the rules
      case "cleanup":
        perms.rules = perms.rules.sort((a, b) => (a.prior < b.prior) as unknown as number);
        this.ctx.dbQuery(`WITH updateData AS (SELECT prior AS tmp, ROW_NUMBER() OVER (ORDER BY prior) rn - 1 FROM permsRules WHERE parent = ${parent}) UPDATE permsRules SET prior = rn FROM updateData WHERE tmp = prior AND parent = ${parent};`);
        this.respond("Successfully cleaned up the rules.");
        break;

      // chnage the default or the state of a specific rule
      case "state":
        const statePrior = +groups.state_prior;
        const newState = groups.state === "allow";

        if (isNaN(statePrior)) {
          perms.state = newState;
          await this.ctx.dbQuery(`UPDATE permsMain SET state = ${newState} WHERE id = ${parent};`);
          this.respond(`Successfully changed the default state of module "${id}" to ${newState ? "allow" : "block"}.`);
          break;
        }

        const rule = perms.rules.find(v => v.prior === statePrior);
        if (!rule) {
          this.respond(`Rule with prior ${statePrior} does not exist.`);
          return;
        }

        rule.state = newState;
        await this.ctx.dbQuery(`UPDATE permsRules SET state = ${newState} WHERE parent = ${parent} AND prior = ${statePrior};`);
        this.respond(`Successfully changed the state of rule with prior ${statePrior} to ${newState ? "allow" : "block"}.`);
        break;

      // change the priority of a rule
      case "move":
        const from = +groups.move_from;
        const to = +groups.move_to;

        if (!perms.rules.some(v => v.prior === from)) {
          this.respond(`Rule with prior ${from} does not exist.`);
          return;
        }

        const tempRule = perms.rules.splice(perms.rules.findIndex(v => v.prior === from), 1)[0];
        await this.ctx.dbQuery(`DELETE FROM permsRules WHERE parent = ${parent} AND prior = ${from};`);
        await this.insert(id, tempRule.state, to, tempRule.expr);

        this.respond(`Successfully moved rule with prior ${from} to ${to}.`);
        break;
    }
  }

  // inserts a new rule into the database
  private async insert(id: string, state: boolean, prior: number, expr: Expression): Promise<void> {
    const parent = this.refers.find(v => v[0] === id)![1];
    const perms = this.perms[id];

    if (perms.rules.some(v => v.prior === prior)) {
      perms.rules.forEach((v, i, s) => s[i].prior = v.prior >= prior ? v.prior + 1 : v.prior);
      await this.ctx.dbQuery(`UPDATE permsRules SET prior = prior + 1 WHERE parent = ${parent} AND prior >= ${prior};`);
    }

    const idx = perms.rules.findIndex((v, i, s) => prior < (s[i - 1]?.prior ?? Infinity) && prior > v.prior);
    perms.rules.splice(idx === -1 ? perms.rules.length : idx, 0, { state, prior, expr });

    await this.ctx.dbQuery(`INSERT INTO permsRules (parent, state, prior, expr) VALUES (${parent}, ${state}, ${prior}, '${expr.encode()}');`);
  }

  // repond to the message
  private async respond(content: string): Promise<void> {
    this.ctx.api.messages.send(this.meta.channel, {
      content,
      message_reference: { channel_id: this.meta.channel, message_id: this.meta.message },
      allowed_mentions: {
        parse: ["everyone", "roles", "users"],
        replied_user: true,
      },
      tts: false,
    });
  }
}

// $ perms --list
// $ perms --cleanup
// $ perms --clearall
// $ perms egg list
// $ perms egg add allow :1 guild == 123
// $ perms egg add block :2 channel == 456
// $ perms egg remove/delete all
// $ perms egg remove/delete 50..100
// $ perms egg remove/delete ..100
// $ perms egg remove/delete 50..
// $ perms egg remove/delete 50
// $ perms egg cleanup
// $ perms egg state allow
// $ perms egg state 5 block
// $ perms egg move 5 to 10
