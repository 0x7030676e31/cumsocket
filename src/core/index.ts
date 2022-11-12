import { Client as dbClient, QueryResult } from "pg";
import Permissions from "./perms";
import Handler from "./handler";
import Client from "./client";
import api from "../api";
export * as types from "../api/types";

import fs from "fs";

export default class Core extends Handler {
  // [Module class, callback, events to listen to]
  private static _listeners: [Object, (data: any, events: string) => Promise<void> | void, ...string[]][] = [];
  private _eventListeners: { [key: string]: [string, ((data: any, events: string) => Promise<void> | void)][] } = {};
  private _ids: string[] = [];
  private _perms!: Permissions;
  private _db!: dbClient;
  public readonly client: Client = new Client();
  public readonly api: typeof api = api;

  constructor(token: string) {
    super(token);
    this.loadDB();
    this.on("dispatch", this.dispatch.bind(this));
    this.loadModules("modules");
  }

  // (decorator) register a listener
  public static listen(...events: string[]) {
    return (target: Object, _: string | symbol, descriptor: PropertyDescriptor) => {
      Core._listeners.push([target, descriptor.value, ...events.map(v => v.toUpperCase())]);
      return descriptor;
    }
  }

  // connect to the database
  private loadDB(): void {
    if (!process.env.DATABASE_URL) throw new Error("Cannot connect to database: DATABASE_URL is not set");
    this._db = new dbClient({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    this._db.connect();
  }

  // handle an incoming message payload
  private async dispatch(data: any, event: string): Promise<void> {
    // this._client.dispatch(data, event);
    this._eventListeners[event]?.forEach(v => this._perms.process(...v, data, event));
  }

  // check if object is a class constructor
  private isClass(v: any): boolean {
    return Boolean(v && typeof v === "function" && v.prototype && !Object.getOwnPropertyDescriptor(v, 'prototype')?.writable);
  }

  // load modules from a specific directory
  private loadModules(dir: string): void {
    if (!fs.existsSync(`build/${dir}`)) throw new Error(`Directory ${dir} does not exist`);

    const modules =
      fs.readdirSync(`build/${dir}`)
      .filter(v => v.endsWith(".js"))
      .map(v => require(`../${dir}/${v}`).default)
      .filter(v => this.isClass(v))
      .concat([ require("./perms").default ])
      .map<Module>(v => Object.assign(new v(this), { ctx: this }))
      .filter(module => {
        // check if the module has a correct id and if all env variables are set
        if (module.ignore === true) return false;
        if (!module.id && typeof module.id !== "string" && !/^[a-zA-Z]{1,16}$/.test(module.id)) throw new Error(`Module ${module.constructor.name} does not have a valid id`);
        module.env?.forEach(v => {
          if (!process.env[v]) throw new Error(`Module ${module.constructor.name} requires environment variable ${v}`);
        });
        return true;
      });

    // add ids to list
    modules.forEach(v => this._ids.push(v.id) && this.log("Core", `Loaded module "${v.id}".`));
    this._perms = modules.at(-1) as Permissions;

    // load listeners and bind them to the modules
    Core._listeners.forEach(([target, callback, ...events]) => {
      const ctx = modules.find(v => target.isPrototypeOf(v));
      events.forEach(v  => {
        if (!this._eventListeners[v]) this._eventListeners[v] = [];
        if (ctx) this._eventListeners[v].push([ctx.id, callback.bind(ctx)]);
      });
    });

    // call "ready" event
    modules.forEach(v => v.init?.(this));
  }

  // send a query to the database
  public async dbQuery(query: string, ...args: any[]): Promise<QueryResult<any>> {
    return await this._db.query(query.replaceAll(/\$(\d+)/g, (_, i) => `${args[+i - 1]}` ?? "null"));
  }

  // get all active module ids
  public get ids(): string[] {
    return structuredClone(this._ids);
  }
}

interface Module {
  ctx: Core;
  id: string;
  env?: string[];
  ignore?: boolean;
  init?: (ctx: Core) => Promise<void> | void;
}
