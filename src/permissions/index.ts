import Core, { listeners, callback, types } from "../core/index.js";
import Expression from "./expression.js";

// Database structure
type dbMain = { id: number, module: string, state: boolean };
type dbRules = { parent: number, state: boolean, prior: number, expr: string};
type perms = { [key: string]: { state: boolean, rules: { state: boolean, prior: number, expr: Expression, temp?: true }[] }};
type meta = { user: string, channel: string, guild?: string, message: string };

// Regex for detecting commands
const CMD = /^[?!$]\s*perms\s+((?<id>[a-z]{1,16})\s+(?<method>list(?<list_full>\s+full)?|add\s+(?<add_state>(allow|block)\s+)?(:(?<add_prior>\d+)\s+)?(?<add_expr>[\da-z\s&|()!=]+)|append\s+(?<append_prior>\d+)\s+(?<append_expr>[\s\S]+)|(remove|delete)\s+(?<remove_range>all|\d+\.\.\d+|\.\.\d+|\d+\.\.|\d+)|cleanup|state\s+((?<state_prior>\d+)\s+)?(?<state>allow|block)|move\s+(?<move_from>\d+)\s+to\s+(?<move_to>\d+))|(?<root>--(list|cleanup|clearall)$))$/;
// When list command should cut the output
const MAX_EXPR_LEN = 100;

export default class Permissions {
  public readonly ctx!: Core;
  public readonly id = "permissions";
  public readonly env = ["DATABASE_URL"];
  public readonly isImportant = true;

  private listeners: listeners = {};
  private perms: perms = {};

  // [id, parent]
  private refers: [string, number][] = [];
  // Store events until the module is ready to handle them
  private queue: { id: string; callback: callback; payload: any; event: string }[] = [];
  // State of the module
  private isReady: boolean = false;
  // Store meta data for the current message
  private meta: meta = { user: "", channel: "", message: "" };


  public async load(ctx: Core): Promise<void> {
    // Register listeners
    ctx.on("dispatch", this.dispatch.bind(this));
    
    // Load permissions from database
    ctx.log("Permissions", "Fetching permissions from database...");
    const fetchingMs = Date.now();

    // Create tables if not exists
    await ctx.dbQuery("CREATE TABLE IF NOT EXISTS permsMain (id serial, module varchar(16), state boolean);");
    await ctx.dbQuery("CREATE TABLE IF NOT EXISTS permsRules (parent integer, state boolean, prior smallint, expr text);");
    
    // Extract data from database
    const permsMain = (await ctx.dbQuery<dbMain>("SELECT * FROM permsMain;"))!.rows;
    const permsRules = (await ctx.dbQuery<dbRules>("SELECT * FROM permsRules;"))!.rows;
    
    // Insert missing modules
    const missing = ctx.idList().filter(id => !permsMain.some(v => v.module === id));
    if (missing.length) ctx.dbQuery("INSERT INTO permsMain (module, state) VALUES $1;", missing.map(v => `('${v}', true)`).join(", "));

    const max = Math.max(...permsMain.map(v => v.id), 0);
    missing.forEach((v, i) => permsMain.push({ id: max + i + 1, module: v, state: true }));

    // Count the modules and rules for logging purposes
    let modulesCount = 0;
    let rulesCount = 0;

    // Process and store the permissions
    permsMain.forEach(v => {
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

    ctx.log("Permissions", `Successfully loaded ${rulesCount} rules for ${modulesCount - missing.length} modules. Took ${Date.now() - fetchingMs}ms`);
  }

  public async ready(ctx: Core): Promise<void> {
    // Get the listeners
    this.listeners = ctx.getListeners();
    
    // Process the queue
    this.isReady = true;
    this.queue.forEach(v => this.process(v.id, v.callback, v.payload, v.event));  
  }

  // Dispatch the events
  public async dispatch(payload: any, event: string): Promise<void> {
    this.listeners[event]?.forEach(([id, callback]) => this.process(id, callback, payload, event));
  }

  // Process the upcoming events
  private async process(id: string, callback: callback, payload: any, event: string): Promise<any> {
    if (!this.isReady) return this.queue.push({ id, callback, payload, event });
    if (!this.perms[id]) return callback(payload, event);

    // Extract data from payload    // TODO: add more events, for now only message events are supported
    let guild: string = "0";
    let channel: string = "0";
    let user: string;
    switch (event) {
      case "MESSAGE_CREATE":
      case "MESSAGE_UPDATE":
      case "MESSAGE_DELETE":
      case "MESSAGE_DELETE_BULK":
        guild = payload.guild_id || "0";
        channel = payload.channel_id || "0";
        user = payload.author?.id || "0";
        break;

      default:
        this.ctx.log("Permissions", `Executing callback for ${event} event without permissions for id ${id}, not supported yet`);
        callback(payload, event);
        return;
    }

    // Loop through the rules from highest to lowest priority checking if the rule is passed
    const perms = this.perms[id];
    for (const rule of perms.rules) {
      const passed = rule.expr.exec({ guild, channel, user });
      if (!passed) continue;

      if (rule.state) callback(payload, event);
      return;
    }

    // If no rule is passed, use the default state
    if (perms.state) callback(payload, event);
  }

  // Handle the commands
  @Core.listen("MESSAGE_CREATE")
  public async onMessageCreate(msg: types.MESSAGE_CREATE): Promise<void> {
    const match = CMD.exec(msg.content.toLowerCase());
    if (!match) return;

    // Save the meta data for the current message
    const groups = match.groups!;
    const ids = this.ctx.idList();
    this.meta.user = msg.author.id;
    this.meta.channel = msg.channel_id;
    this.meta.guild = msg.guild_id;
    this.meta.message = msg.id;

    // Perform root operations
    if (groups.root) {
      switch (groups.root) {
        // List all modules + their state, index, amount of rules and if they are used or not, kinda messy
        case "--list":
          const numMaxLength = Math.max(...this.refers.map(v => v[1].toString().length));
          const idMaxLength = Math.max(...this.refers.map(v => v[0].length));
          const rulesMaxLength = Math.max(...Object.values(this.perms).map(v => v.rules.length.toString().length));
          
          const content = this.refers.sort((a, b) => a[1] - b[1]).map(([name, idx]) => `${idx}.${" ".repeat(numMaxLength - idx.toString().length)} | ${name}${" ".repeat(idMaxLength - name.length)} | ${this.perms[name].state ? "allow" : "block"} | ${this.perms[name].rules.length}${" ".repeat(rulesMaxLength - this.perms[name].rules.length.toString().length)}${ids.includes(name) ? "" : "  (unused)"}`).join("\n");
          this.respond(`\`\`\`\n${content}\n\`\`\``);
          break;

        // Remove all unused modules from the database, reorder ids in "main" and "rules" table as well
        case "--cleanup":
        // Remove unused modules  
        const unused = this.refers.filter(([name]) => !ids.includes(name));
          this.refers = this.refers.filter(([name]) => ids.includes(name));
          if (unused.length) {
            await Promise.all([
              this.ctx.dbQuery("DELETE FROM permsMain WHERE id IN ($1);", unused.map(v => v[1]).join(", ")),
              this.ctx.dbQuery("DELETE FROM permsRules WHERE parent IN ($1);", unused.map(v => v[1]).join(", ")),
            ]);
          }
          
          // Reorder ids in permsMain
          this.refers = this.refers.sort((a, b) => a[1] - b[1]);
          const newOrder = this.refers.map((v, i) => [v[1], i + 1]).filter(v => v[0] !== v[1]);
          this.refers = this.refers.map((v, i) => [v[0], i + 1]);
          
          // Update values in the database, update ethe SEQUENCE as well
          await Promise.all([
            this.ctx.dbQuery(newOrder.map(v => `UPDATE permsMain SET id = ${v[1]} WHERE id = ${v[0]};`).join(";")),
            this.ctx.dbQuery(newOrder.map(v => `UPDATE permsRules SET parent = ${v[1]} WHERE parent = ${v[0]};`).join(";")),
            this.ctx.dbQuery("ALTER SEQUENCE permsMain_id_seq RESTART WITH $1;", ids.length + 1),
          ]);

          // Update the priority of the rules, I really don't want to come back to this
          Object.entries(this.perms).forEach(([key, value]) => value.rules.forEach((_, i) => this.perms[key].rules[i].prior = i));
          await this.ctx.dbQuery(`UPDATE permsRules SET prior = temp.idx - 1 FROM (SELECT ROW_NUMBER() OVER (PARTITION BY parent ORDER BY prior) AS idx, parent, prior FROM permsRules) AS temp WHERE permsRules.prior = temp.prior AND permsRules.parent = temp.parent;`)

          this.respond(`Successfully removed ${unused.length} unused modules, reordered ${newOrder.length} ids and ${ids.length} modules.`);
          break; 

        // Deletes everything from the database and insert fresh data from the local storage (only for "main" table)
        case "--clearall":
          // Delete everything
          await Promise.all([
            this.ctx.dbQuery("TRUNCATE TABLE permsMain RESTART IDENTITY;"),
            this.ctx.dbQuery("TRUNCATE TABLE permsRules;"),
          ]);

          // Insert fresh data
          await this.ctx.dbQuery("INSERT INTO permsMain (module, state) VALUES $1;", ids.map(v => `(${v}, true)`).join(", "));

          // Update id references
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

    // Operations performed on a specific module

    // Get the id and check if it exists
    const id = groups.id;
    if (!ids.includes(id)) return this.respond(`Module "${id}" does not exist.`);

    // Find parent id and the permissions for the specific module
    const parent = this.refers.find(v => v[0] === id)![1];
    const perms = this.perms[id];

    // Perform basic operations on the specific module
    const action = groups.method.match(/^[a-z]+/)![0];
    switch (action) {
      // Display the rules
      case "list":
        const full = Boolean(groups.list_full); // Display full expression?
        
        // Calculate the length of the "prior" column
        const priorMaxLength = Math.max(...perms.rules.map(v => v.prior.toString().length));
        
        // Generate the content table
        const content = perms.rules.map(v => `${v.prior}.${" ".repeat(priorMaxLength - v.prior.toString().length)} | ${v.state ? "allow" : "block"} | ${full ? v.expr.stringify() : this.exprStringify(v.expr)}`).join("\n");
        this.respond(`Current default stfate: **${perms.state ? "allow" : "block"}**${content ? `\n\`\`\`\n${content}\n\`\`\`` : ""}`);
        break;

      // Add a new rule
      case "add":
        // State for the new rule
        const state = groups.add_state.trim() === "allow";
        
        // Priority for the new rule, if not specified, it will be the highest priority + 1
        const prior = isNaN(+groups.add_prior) ? Math.max(...perms.rules.map(v => v.prior), -1) + 1 : +groups.add_prior;
        const expr = groups.add_expr
        
        // Generate the expression object
        const expression = this.convert(expr);
        const error = expression.parse();

        // Check if the expression is valid
        if (typeof error === "string") {
          this.respond(`Failed to parse expression: ${error}`);
          return;
        }

        // Insert the new rule into the database
        await this.insert(id, state, prior, expression);
        this.respond(`Successfully added rule with state ${state ? "allow" : "block"} and prior ${prior} to module "${id}".`);
        break;

      // Append an expression to an existing rule
      case "append":
        // Get the rule to append to
        const target = +groups.append_prior;
        const source = this.perms[id].rules.find(v => v.prior === target); 
        if (!source) return this.respond(`Rule with prior ${target} does not exist.`);

        // Generate the new expression
        const newExpr = this.convert(source.expr.stringify() + groups.append_expr);
        const err = newExpr.parse();

        // Check if the expression is valid
        if (typeof err === "string") {
          this.respond(`Failed to parse expression: ${err}`);
          return;
        }

        // Update the database
        source.expr = newExpr;
        await this.ctx.dbQuery("UPDATE permsRules SET expr = '$1' WHERE parent = $2 AND prior = $3;", newExpr.encode(), parent, target);
        this.respond(`Successfully appended expression to rule with prior ${target}.`);
        break;

      // Delete a specific range of rules all, 1, 1..2, 1.., ..5 etc
      case "remove":
      case "delete":
        const range = groups.remove_range;
        let count: number = 0;
        
        if (range === "all") {
          count = perms.rules.length;
          await this.ctx.dbQuery("DELETE FROM permsRules WHERE parent = $1;", parent);
          perms.rules = [];
        } else if (/^\d+$/.test(range)) {
          await this.ctx.dbQuery("DELETE FROM permsRules WHERE parent = $1 AND prior = $2;", parent, range);
          if (!perms.rules.some(v => v.prior === +range)) break;
          count = 1;
          perms.rules.splice(perms.rules.findIndex(v => v.prior === +range), 1);
        } else if (/^\d+\.\.\d+/.test(range)) {
          const [start, end] = range.split("..").map(v => +v);
          await this.ctx.dbQuery("DELETE FROM permsRules WHERE parent = $1 AND prior BETWEEN $2 AND $3;", parent, start, end);
          count = perms.rules.filter(v => v.prior >= start && v.prior <= end).length;
          perms.rules = perms.rules.filter(v => v.prior < start || v.prior > end);
        } else if (/^\.\.\d+/.test(range)) {
          const end = +range.slice(2);
          await this.ctx.dbQuery("DELETE FROM permsRules WHERE parent = $1 AND prior <= $2;", parent, end);
          count = perms.rules.filter(v => v.prior <= end).length;
          perms.rules = perms.rules.filter(v => v.prior > end);
        } else {
          const start = +range.slice(2);
          await this.ctx.dbQuery("DELETE FROM permsRules WHERE parent = $1 AND prior >= $2;", parent, start);
          count = perms.rules.filter(v => v.prior >= start).length;
          perms.rules = perms.rules.filter(v => v.prior < start);
        }

        this.respond(`Successfully removed ${count} rules from module "${id}".`);
        break;

      // Reorder the rules by priority
      case "cleanup":
        perms.rules = perms.rules.sort((a, b) => (a.prior < b.prior) as unknown as number);
        await this.ctx.dbQuery("UPDATE permsRules SET prior = temp.idx - 1 FROM (SELECT ROW_NUMBER() OVER (PARTITION BY parent ORDER BY prior) AS idx, prior FROM permsRules WHERE parent = $1) AS temp WHERE permsRules.prior = temp.prior AND permsRules.parent = $1;", parent);
        this.respond("Successfully cleaned up the rules.");
        break;

      // Change the default or a specific rule's state
      case "state":
        const statePrior = +groups.state_prior;
        const newState = groups.state === "allow";

        // Check if the state is the default state
        if (isNaN(statePrior)) {
          perms.state = newState;
          await this.ctx.dbQuery("UPDATE permsMain SET state = $1 WHERE id = $2;", newState, parent);
          this.respond(`Successfully changed the default state of module "${id}" to ${newState ? "allow" : "block"}.`);
          break;
        }

        // Check if the rule exists
        const rule = perms.rules.find(v => v.prior === statePrior);
        if (!rule) return this.respond(`Rule with prior ${statePrior} does not exist.`);

        // Update the database
        rule.state = newState;
        await this.ctx.dbQuery("UPDATE permsRules SET state = $1 WHERE parent = $2 AND prior = $3;", newState, parent, statePrior);
        this.respond(`Successfully changed the state of rule with prior ${statePrior} to ${newState ? "allow" : "block"}.`);
        break;

      // Change the priority of a rule
      case "move":
        const from = +groups.move_from;
        const to = +groups.move_to;

        // Check if the rule exists
        if (!perms.rules.some(v => v.prior === from)) return this.respond(`Rule with prior ${from} does not exist.`);

        // Move the rule
        const tempRule = perms.rules.splice(perms.rules.findIndex(v => v.prior === from), 1)[0];
        await this.ctx.dbQuery("DELETE FROM permsRules WHERE parent = $1 AND prior = $2;", parent, from);
        await this.insert(id, tempRule.state, to, tempRule.expr);

        this.respond(`Successfully moved rule with prior ${from} to ${to}.`);
        break;
    }
  }

  // Inserts a new rule into the database
  private async insert(id: string, state: boolean, prior: number, expr: Expression): Promise<void> {
    // Get the parent and the permissions object
    const parent = this.refers.find(v => v[0] === id)![1];
    const perms = this.perms[id];

    // If the rule already exists, move rules above and insert the new rule at the correct position
    if (perms.rules.some(v => v.prior === prior)) {
      perms.rules.forEach((v, i, s) => s[i].prior = v.prior >= prior ? v.prior + 1 : v.prior);
      await this.ctx.dbQuery("UPDATE permsRules SET prior = prior + 1 WHERE parent = $1 AND prior >= $1;", prior);
    }

    // Insert the rule at the correct position (local)
    const idx = perms.rules.findIndex((v, i, s) => prior < (s[i - 1]?.prior ?? Infinity) && prior > v.prior);
    perms.rules.splice(idx === -1 ? perms.rules.length : idx, 0, { state, prior, expr });

    // Insert the rule at the correct position (database)
    await this.ctx.dbQuery("INSERT INTO permsRules (parent, state, prior, expr) VALUES ($1, $2, $3, '$4');", parent, state, prior, expr.encode());
  }

  // Stringify the expression
  private exprStringify(expr: Expression): string {
    const str = expr.stringify()
    if (str.length > MAX_EXPR_LEN) return str.slice(0, MAX_EXPR_LEN - 3) + "...";
    return str;
  }

  // Generate new expression replacing some variables with their values
  private convert(expr: string): Expression {
    return new Expression(expr.replaceAll("uthis", this.meta.user).replaceAll("gthis", this.meta.guild ?? "0").replaceAll("cthis", this.meta.channel));
  }

  // Repond to the message, just a shortcut
  private async respond(content: string): Promise<void> {
    this.ctx.api.messages.respond(this.meta.channel, this.meta.message, content);
  }
}

// $ perms --list
// $ perms --cleanup
// $ perms --clearall
// $ perms egg list
// $ perms egg add allow :1 guild == 123
// $ perms egg add block :2 channel == 456
// $ perms egg append 2 && user == 789
// $ perms egg remove/delete all
// $ perms egg remove/delete 50..100
// $ perms egg remove/delete ..100
// $ perms egg remove/delete 50..
// $ perms egg remove/delete 50
// $ perms egg cleanup
// $ perms egg state allow
// $ perms egg state 5 block
// $ perms egg move 5 to 10