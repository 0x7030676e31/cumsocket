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
  // [Module class, Callback, Events to listen to]
  private static _listeners: [Object, (data: any, events: string) => Promise<void> | void, ...string[]][] = [];
  
  // (Decorator) Register a listener using @Core.listen("event1", "event2", ...)
  public static listen(...events: string[]) {
    return (target: Object, _: string | symbol, descriptor: PropertyDescriptor) => {
      Core._listeners.push([target, descriptor.value, ...events.map(v => v.toUpperCase())]);
      return descriptor;
    }
  }


  // Event: [Id, Callback]
  private _eventListeners: listeners = {};
  // List of loaded modules
  private _modules: Module[] = [];
  
  // Include permissions module
  private _perms: boolean = process.env.PERMS?.toLowerCase() === "true";
  // Postgres database
  private _db: pg.Client | null = null;

  // Components
  public readonly api = api;
  public readonly client = new Client(this);
  private readonly _dbStorage = new DBStorage(this);

  constructor() {
    // Intialize websocket client
    super(process.env.TOKEN!);

    this.log(`Core`, `Permissions: ${this._perms ? "Enabled" : "Disabled"}`);
    
    // Initialize database if url is provided
    if (process.env.DATABASE_URL) {
      this._db = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
      this._db.connect();
    } else this.log("Core", "No database url provided; database functionality will be disabled.");
  
    // Setup client when ready
    this.once("open", this.setup.bind(this));
  }

  private async setup(): Promise<void> {
    // Setup dispatch reciever for client
    this.on("dispatch", this.client.dispatch.bind(this.client));

    // Load storage from database
    if (process.env.DATABASE_URL) await this._dbStorage.loadDB();

    // Setup main dispatch reciever 
    if (this._perms) await this.loadModule("permissions/index");
    else this.on("dispatch", this.dispatch.bind(this));
    
    // Load all modules
    await this.loadModules("modules");

    // Execute ready method for all modules
    this._modules.forEach(v => v.ready?.(this));
  }

  // Handle incoming dispatches when permissions are disabled
  private async dispatch(payload: any, event: string): Promise<void> {
    this._eventListeners[event]?.forEach(([_, callback]) => callback(payload, event));
  }

  // Load all modules in a directory
  protected async loadModules(dir: string): Promise<void> {
    // Check if directory exists
    const path = `./build/${dir}`;
    if (!fs.existsSync(path)) throw new Error(`Failed to load modules: '${path}' does not exist.`);

    // Get all files in directory
    const files = fs.readdirSync(path, { withFileTypes: true });
    const targets: string[] = files.filter(v => !v.isDirectory() && v.name.endsWith(".js")).map(v => `${dir}/${v.name}`);
    files.filter(v => v.isDirectory()).forEach(v => fs.existsSync(`${path}/${v.name}/index.js`) && targets.push(`${dir}/${v.name}/index.js`));
    
    // Load all modules
    await Promise.all(targets.map(file => this.loadModule(file)));
  }

  // Load a module
  protected async loadModule(file: string): Promise<Module | void> {
    // Check if module exists
    const filename = file + (file.endsWith(".js") ? "" : ".js");
    if (!fs.existsSync(`./build/${filename}`)) throw new Error(`Failed to load module: '${file}' does not exist.`);

    // Import module
    const module = (await import(`../${filename}`)).default;
    if (!this.isClass(module)) return;

    // Initialize module
    const instance: Module = new module(this);
    
    // Validate module
    if (instance.ignore === true) return;
    if (!/^[a-zA-Z_]{1,16}$/.test(instance.id)) throw new Error(`Failed to load module: '${instance.id}' is not a valid id.`);
    if (this.idList().includes(instance.id)) throw new Error(`Failed to load module: '${instance.id}' is already loaded.`);

    // Check required env variables
    if (instance.env) {
      if (!(instance.env instanceof Array)) throw new Error(`Failed to load module: '${instance.id}' env is not an array.`);
      instance.env.forEach(v => process.env[v] === undefined && err(`Warning: '${instance.id}' requires env variable '${v}'`));
    }

    // Apply context
    instance.ctx = this;

    // Execute load method
    instance.load?.(this);

    // Register listeners for module
    const listeners = Core._listeners.filter(([object]) => object.isPrototypeOf(instance));
    listeners.forEach(([_, callback, ...events]) => events.forEach(v => {
      if (!this._eventListeners[v]) this._eventListeners[v] = [];
      this._eventListeners[v].push([instance.id, callback.bind(instance)]);
    }));

    // Remove used listeners from static list of listeners
    Core._listeners = Core._listeners.filter(([object]) => !object.isPrototypeOf(instance));

    // Add module to list of loaded modules
    this._modules.push(instance);
    this.log("Core", `Successfully loaded module '${instance.id}' with ${listeners.length} listeners.`);

    // Return module instance
    return instance;
  }

  // Check if object is a class constructor, used to validate modules
  private isClass(v: any): boolean {
    return Boolean(v && typeof v === "function" && v.prototype && !Object.getOwnPropertyDescriptor(v, 'prototype')?.writable);
  }



  // Get storage instance
  public get storage(): DBStorage | null {
    if (process.env.DATABASE_URL === undefined) return null;
    return this._dbStorage;
  }

  // Send a formatted request to the database
  public async dbQuery(query: string, ...args: any[]): Promise<pg.QueryResult<any> | null> {
    if (!this._db) return null;
    return this._db.query(query.replaceAll(/\$\d+/g, (v) => args[+v.slice(1) - 1] ?? "NULL"));
  }

  // Get a module by given id
  public getModule(id: string): Module | null {
    return this._modules.find(v => v.id === id) ?? null;
  }

  // Get a list of all loaded listeners
  public getListeners(): listeners {
    return this._eventListeners;
  }

  // Get a list of ids of all loaded modules 
  public idList(): string[] {
    return this._modules.map(v => v.id);
  }

  // Get the id of the bot using the token
  public getIdFromToken(): string {
    return Buffer.from(this.token.split(".")[0], "base64").toString();
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