import Core from "./core";
import * as types from "../api/types";
import api from "../api";

type exprTokens = (exprToken | exprTokens)[];
type exprToken = token | { type: "bool", value: boolean };
type rTokens = ({ type: "op"| "id", value: string } | { type: "bool", value: boolean })[];

type tokens = (token | tokens)[];
type token = { type: "op" | "var" | "id", value: string };
class Lexer {
  private _content: string;
  private _cursor: number = 0;

  private _tokens: tokens = [];
  private _ref: tokens = this._tokens;
  private _depth: number = 0;

  private _last: string = "op";
  private _error: string = "";

  private readonly _rules: [string, RegExp][] = [
    ["var", /^(guild|channel|user)/],
    ["op", /^(==|!=|&&|\|\|)/],
    ["id", /^\d+/],
    ["open", /^\(/],
    ["close", /^\)/],
  ];

  constructor(content: string) {
    this._content = content.replaceAll(/[\u200B-\u200D\uFEFF]+|\s+$/g, "")

    while (this._cursor < this._content.length) {
      // get next token
      const match = this.match();
      if (!match) {
        this._error = `Unknown token at ${this._cursor}`;
        break;
      }

      // add token to the current reference / change depth of the reference
      const [type, matchArr] = match;
      switch (type) {
        case "var":
        case "op":
        case "id":
          if ((type === "op" && this._last === "op") || (type !== "op" && this._last === "var")) {
            this._error = `Unexpected token "${type}" after "${this._last}" at ${this._cursor}`;
            return;
          }

          this._last = type === "op" ? "op" : "var";
          this._ref.push({ type, value: matchArr[0] });
          break;

        // open parenthesis
        case "open":
          if (this._last === "var") {
            this._error = `Unexpected token "(" after "var" at ${this._cursor}`;
            return;
          }
          this._last = "op";
          this._depth++;
          this._ref.push([]);
          this._ref = this._ref.at(-1) as tokens;
          break;

        // close parenthesis
        case "close":
          if (this._depth === 0 || this._ref.length === 0) {
            this._error = `Unexpected token ")" at ${this._cursor}`;
            return;
          } else if (this._last === "op") {
            this._error = `Unexpected token ")" after "${this._last}" at ${this._cursor}`;
            return;
          }

          this._last = "var";
          this._depth--;
          this._ref = this._tokens;
          for (let i = 0; i < this._depth; i++) this._ref = this._ref.at(-1) as tokens;
          break;
      }
    }

    if (this._depth !== 0 || this._last === "op") this._error = "Unexpected end of input";
  }

  private match(): [string, RegExpExecArray] | null {
    let str = this._content.slice(this._cursor);
    
    // remove whitespaces at the beginning
    const spaces = /^\s+/.exec(str);
    if (spaces) {
      this._cursor += spaces[0].length;
      str = this._content.slice(this._cursor);
    }
    
    // look for first matching rule
    for (const [type, regex] of this._rules) {
      const match = regex.exec(str);
      if (!match) continue;

      this._cursor += match[0].length;
      return [type, match];
    }
    
    return null;
  }

  public get tokens(): tokens | string {
    return this._error || structuredClone(this._tokens);
  }
}

type vars = { guild: string, channel: string, user: string };
class Expression {
  private readonly _tokens: exprTokens;
  private _vars!: vars;

  private readonly _order: string[][] = [
    ["&&", "||"],
    ["!=", "=="],
  ];

  constructor(tokens: tokens) {
    this._tokens = tokens;
  }

  private _exec(tokens: exprTokens): null | exprToken {
    // use recursion to exec expressions at any depth
    while (true) {
      const idx = tokens.findIndex(v => v instanceof Array);
      if (idx === -1) break;
    
      const result = this._exec(tokens[idx] as exprTokens);
      if (result === null) return null;
      tokens.splice(idx, 1, result);
    }

    // replace all "guild", "channel" etc vars to ids 
    const rTokens = (tokens as exprToken[]).map(v => v.type === "var" ? { type: "id", value: this._vars[v.value as keyof vars] } : v) as rTokens;

    // make operations on values
    while (true) {
      let passed: boolean = false;
      // loop through operation order
      for (const order of this._order) {
        const idx = rTokens.findIndex(v => order.includes(v.value as string));
        if (idx === -1) continue;

        const op = rTokens[idx].value as string;
        const left = rTokens[idx - 1].value;
        const right = rTokens[idx + 1].value;

        // compare left and right side
        let result: boolean;
        switch (op) {
          case "&&":
            result = Boolean(left) && Boolean(right);
            break;

          case "||":
            result = Boolean(left) || Boolean(right);
            break;

          case "==":
            result = left == right;
            break;

          case "!=":
            result = left != right;
            break;
        }

        rTokens.splice(idx - 1, 3, { type: "bool", value: result! });
        passed = true;
        break;
      }

      if (!passed) break;
    }
    
    return rTokens[0];
  } 

  public exec(vars: { channel: string, user: string, guild?: string }): boolean {
    this._vars = { guild: vars.guild || "0", channel: vars.channel, user: vars.user };
    return this._exec(structuredClone(this._tokens)) !== null;
  }
}

const PATTERN = /^[?!$]\s*perms\s+(?<id>[a-z]+)\s+(?<method>list$|add\s+(?<add_state>allow|block)\s+(~(?<add_priority>\d+)\s+)?(?<add_expr>[\da-z\s&|()!=]+$)|remove\s+|edit\s+)/;

type perms = { [key: string]: [state, ...exprSet[]] };
type exprSet = [state, number, Expression];
type state = "allow" | "block";
export default class Permissions {
  public id = "permissions";
  public ctx!: Core;

  private _perms: perms = {};
  private _last: [string, string] = ["", ""];

  constructor() {
    this._perms["test"] = ["allow", 
      ["allow", 2, new Expression(new Lexer("1 == 1").tokens as tokens)],
      ["allow", 4, new Expression(new Lexer("1 == 1").tokens as tokens)],
      ["allow", 1, new Expression(new Lexer("1 == 1").tokens as tokens)],
      ["allow", 7, new Expression(new Lexer("1 == 1").tokens as tokens)],
    ];

    const sorted = (this._perms["test"].slice(1) as exprSet[]).sort((a, b) => +(a[1] - b[1])).reverse();
    console.log(sorted)
  }

  @Core.listen("MESSAGE_CREATE")
  public async onMessage(msg: types.messages.Message): Promise<void> {
    // check if message is a command
    const match = PATTERN.exec(msg.content);
    if (!match) return;

    this._last = [msg.channel_id, msg.id];

    const id = match.groups!.id;
    const method = match.groups!.method.split(/\s+/)[0];

    if (!this.ctx.ids.includes(id)) {
      this.response("Invalid id");
      return;
    }
    
    // do stuff depending on method
    switch (method) {
      case "add":
        const priorities = this._perms[id]?.slice(1).map<number>(v => v[1] as number) || [];
        const priority = +(match.groups!.add_priority ?? Math.max(-1, ...priorities) + 1);
        // check if priority is not taken
        if (priorities.includes(priority)) {
          this.response("Priority already exists");
          return;
        }
        const response = this.add(id, match.groups!.add_state as state, priority, match.groups!.add_expr);
        if (typeof response === "string") this.response(response);
        return;

      default:
        this.response("Not supported yet");
    }
  }

  private async response(content: string): Promise<void> {
    api.messages.send(this._last[0], {
      content,
      message_reference: { channel_id: this._last[0], message_id: this._last[1] },
      allowed_mentions: {
        parse: ["everyone", "roles", "users"],
        replied_user: false
      },
      tts: false,
    });
  }

  // add permission to id
  private add(id: string, state: state, priority: number, expr: string): void | string {
    const tokens = new Lexer(expr).tokens;
    if (typeof tokens === "string") return tokens;

    const expression = new Expression(tokens);
    if (!this._perms[id]) this._perms[id] = ["allow"];
    this._perms[id].push([state, priority, expression]);

    this.resort();
  }

  // resort permissions by priority
  private resort(): void {
    Object.entries(this._perms).forEach(([key, entry]) => {
      const state = [0];
      const sorted = (entry.slice(1) as exprSet[]).sort((a, b) => +(a[1] - b[1])).reverse();
      this._perms[key] = [entry[0], ...sorted];
    });
  }

  // Process event and execute callback if all conditions are met
  public async process(id: string, callback: (data: any, events: string) => Promise<void> | void, payload: any, event: string, ): Promise<void> {
    if (!this._perms[id]) {
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

      default:
        console.log(`Executing callback for ${event} event without permissions for id ${id}, not supported yet`);
        callback(payload, event);
        return;
    }

    // check if any expression is true
    const perms = this._perms[id];
    const allow = perms[0] === "allow";
    for (const perm of (perms.slice(1) as exprSet[])) {
      const passed = perm[2].exec({ guild, channel, user });
      if (!passed) continue;

      if (perm[0] === "allow") callback(payload, event);
      return;
    }

    if (allow) callback(payload, event);
  }
}
