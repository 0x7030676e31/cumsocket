import Permissions from "./perms";
import DataBase from "./database";
import Handler from "./handler";
import fs from "fs";
import { QueryResult } from "pg";

export default class Core extends Handler {
  // [Module class, callback, events to listen to]
  private static _listeners: [Object, (data: any, events: string) => Promise<void> | void, ...string[]][] = [];
  private _eventListeners: { [key: string]: ((data: any, events: string) => Promise<void> | void)[] } = {};
  private _ids: string[] = [];
  private _perms!: Permissions;
  private _db!: DataBase;

  constructor(token: string) {
    super(token);

    this._db = new DataBase();

    this.on("dispatch", this.dispatch.bind(this));
    this.loadModules("modules");
  }

  // (decorator) register a listener
  public static listen(...events: string[]) {
    return (target: Object, _: string | symbol, descriptor: PropertyDescriptor) => {
      Core._listeners.push([target, descriptor.value, ...events.map(v => v.toLowerCase())]);
      return descriptor;
    }
  }

  // handle an incoming message payload
  private async dispatch(data: any, event: string): Promise<void> {
    // TODO: rewrite this to use perms module
    this._eventListeners[event.toLowerCase()]?.forEach(v => v(data, event));
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
      .filter(v => {
        // check if the module has a correct id and if all env variables are set
        if (v.ignore === true) return false;
        if (!v.id && typeof v.id !== "string" && !/^[a-zA-Z]{1,16}$/.test(v.id)) throw new Error(`Module ${v.constructor.name} does not have a valid id`);
        v.env?.forEach(v => {
          if (!process.env[v]) throw new Error(`Module ${v.constructor.name} requires environment variable ${v}`);
        });
        return true;
      });

    // add ids to list
    modules.forEach(v => this._ids.push(v.id) && console.log("Loaded module", v.id));
    this._perms = modules.at(-1) as Permissions;

    // load listeners and bind them to the modules
    Core._listeners.forEach(([target, callback, ...events]) => {
      const ctx = modules.find(v => target.isPrototypeOf(v));
      events.forEach(v  => {
        if (!this._eventListeners[v]) this._eventListeners[v] = [];
        if (ctx) this._eventListeners[v].push(callback.bind(ctx));
        else this._eventListeners[v].push(callback);
      });
    });

    // call "ready" event
    modules.forEach(v => v.init?.(this));
  }

  public async dbQuery(query: string): Promise<QueryResult<any>> {
    return await this._db.query(query);
  }

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
