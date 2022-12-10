import Client from "../client/index.js";
import DBStorage from "./dbstorage.js";
import * as api from "../api/index.js";
import Handler from "./handler.js";
import pg from "pg";
import fs from "fs";

export * as apiTypes from "../api/types/index.js";
export * as types from "./mapping.js";

const err = (msg: string) => { throw new Error(msg); };

export type callback = (data: any, events: string) => Promise<void> | void;
export type listeners = { [key: string]: [string, callback][] }
export default class Core extends Handler {
  // [Module class, callback, events to listen to]
  private static _listeners: [Object, (data: any, events: string) => Promise<void> | void, ...string[]][] = [];
  
  // (decorator) register a listener
  public static listen(...events: string[]) {
    return (target: Object, _: string | symbol, descriptor: PropertyDescriptor) => {
      Core._listeners.push([target, descriptor.value, ...events.map(v => v.toUpperCase())]);
      return descriptor;
    }
  }


  // event: [id, callback]
  private _eventListeners: listeners = {};
  private _modules: Module[] = [];
  private _perms: boolean = process.env.PERMS?.toLowerCase() === "true";
  private _db: pg.Client | null = null;

  // utils
  public readonly api = api;
  public readonly client = new Client(this);
  private readonly _dbStorage = new DBStorage(this);

  constructor() {
    super(process.env.TOKEN!);

    this.log(`Core`, `Permissions: ${this._perms ? "Enabled" : "Disabled"}`);
    
    // init database
    if (process.env.DATABASE_URL) {
      this._db = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
      this._db.connect();
      this._dbStorage.loadDB();
    } else this.log("Core", "No database url provided; database functionality will be disabled.");
  
    // init modules
    this.once("open", this.setup.bind(this));
  }

  private async setup(): Promise<void> {
    // setup client dispatch receiver
    this.on("dispatch", this.client.dispatch.bind(this.client));

    // setup dispatch reciever 
    if (this._perms) await this.loadModule("permissions/index");
    else this.on("dispatch", this.dispatch.bind(this));
    
    // load modules
    await this.loadModules("modules");

    this._modules.forEach(v => v.ready?.(this));
  }

  // handle an incoming message
  private async dispatch(payload: any, event: string): Promise<void> {
    this._eventListeners[event]?.forEach(([_, callback]) => callback(payload, event));
  }

  // load all modules
  protected async loadModules(dir: string): Promise<void> {
    const path = `./build/${dir}`;
    if (!fs.existsSync(path)) throw new Error(`Failed to load modules: '${path}' does not exist.`);

    const files = fs.readdirSync(path, { withFileTypes: true });
    const targets: string[] = files.filter(v => !v.isDirectory() && v.name.endsWith(".js")).map(v => `${dir}/${v.name}`);
    files.filter(v => v.isDirectory()).forEach(v => fs.existsSync(`${path}/${v.name}/index.js`) && targets.push(`${dir}/${v.name}/index.js`));
    
    await Promise.all(targets.map(file => this.loadModule(file)));
  }

  // load a module
  protected async loadModule(file: string): Promise<Module | void> {
    const filename = file + (file.endsWith(".js") ? "" : ".js");
    if (!fs.existsSync(`./build/${filename}`)) throw new Error(`Failed to load module: '${file}' does not exist.`);

    const module = (await import(`../${filename}`)).default;
    if (!this.isClass(module)) return;

    // initialize module
    const instance: Module = new module(this);
    
    // validate module
    if (instance.ignore === true) return;
    if (!/^[a-zA-Z_]{1,16}$/.test(instance.id)) throw new Error(`Failed to load module: '${instance.id}' is not a valid id.`);
    if (this.idList().includes(instance.id)) throw new Error(`Failed to load module: '${instance.id}' is already loaded.`);

    // check required environment variables
    if (instance.env) {
      if (!(instance.env instanceof Array)) throw new Error(`Failed to load module: '${instance.id}' env is not an array.`);
      instance.env.forEach(v => process.env[v] === undefined && err(`Warning: '${instance.id}' requires env variable '${v}'`));
    }

    // add context to module
    instance.ctx = this;

    // execute ready method
    instance.load?.(this);

    // register listeners
    const listeners = Core._listeners.filter(([object]) => object.isPrototypeOf(instance));
    listeners.forEach(([_, callback, ...events]) => events.forEach(v => {
      if (!this._eventListeners[v]) this._eventListeners[v] = [];
      this._eventListeners[v].push([instance.id, callback.bind(instance)]);
    }));

    // remove used listeners from static list
    Core._listeners = Core._listeners.filter(([object]) => !object.isPrototypeOf(instance));

    this._modules.push(instance);
    this.log("Core", `Successfully loaded module '${instance.id}' with ${listeners.length} listeners.`);

    return instance;
  }

  // check if object is a class constructor
  private isClass(v: any): boolean {
    return Boolean(v && typeof v === "function" && v.prototype && !Object.getOwnPropertyDescriptor(v, 'prototype')?.writable);
  }

  // get storage instance
  public get storage(): DBStorage | null {
    if (process.env.DATABASE_URL === undefined) return null;
    return this._dbStorage;
  }

  // send a request to the database
  public async dbQuery(query: string, ...args: any[]): Promise<pg.QueryResult<any> | null> {
    if (!this._db) return null;
    return this._db.query(query.replaceAll(/\$\d+/g, (v) => args[+v.slice(1) - 1] ?? "NULL"));
  }

  public getModule(id: string): Module | null {
    return this._modules.find(v => v.id === id) ?? null;
  }

  public listenerList(): listeners {
    return this._eventListeners;
  }

  public getSelfId(): string {
    return Buffer.from(this.token.split(".")[0], "base64").toString();
  }

  // get a list of all module ids
  public idList(): string[] {
    return this._modules.map(v => v.id);
  }
}

type Module = _Module & Object;
interface _Module {
  id: string;
  ctx: Core;
  env?: string[];
  ignore?: boolean;

  constructor?: (ctx: Core) => Module;
  ready?: (ctx: Core) => (Promise<void> | void);
  load?: (ctx: Core) => (Promise<void> | void);
}