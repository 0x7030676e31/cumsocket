import Handler from "./handler";
import fs from "fs";

export default class Core extends Handler {
  // [Module class, callback, events to listen to]
  private static _listeners: [Object, (data: any, events: string) => Promise<void> | void, ...string[]][] = [];
  private _eventListeners: { [key: string]: ((data: any, events: string) => Promise<void> | void)[] } = {};

  constructor(token: string) {
    super(token);
    this.on("dispatch", this.dispatch.bind(this));
    this.loadModules("modules");
  }

  public static listen(...events: string[]) {
    return (target: Object, _: string | symbol, descriptor: PropertyDescriptor) => {
      Core._listeners.push([target, descriptor.value, ...events.map(v => v.toLowerCase())]);
      return descriptor;
    }
  }

  // handle an incoming message payload
  private async dispatch(data: any, event: string): Promise<void> {
    this._eventListeners[event.toLowerCase()]?.forEach(v => v(data, event));
  }

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
      .map<Module>(v => Object.assign(new v(this), { ctx: this }))
      .filter(v => {
        // check if the module has a correct id and if all env variables are set
        if (v.ignore === true) return false;
        if (!v.id && typeof v.id !== "string") throw new Error(`Module ${v.constructor.name} does not have a valid id`);
        v.env?.forEach(v => {
          if (!process.env[v]) throw new Error(`Module ${v.constructor.name} requires environment variable ${v}`);
        });
        return true;
      });

    // load listeners and bind them to the modules
    Core._listeners.forEach(([target, callback, ...events]) => {
      const ctx = modules.find(v => v.isPrototypeOf(target));
      events.forEach(v => {
        if (!this._eventListeners[v]) this._eventListeners[v] = [];
        if (ctx) this._eventListeners[v].push(callback.bind(ctx));
        else this._eventListeners[v].push(callback);
      });
    });
  }
}

interface Module {
  ctx: Core;
  id: string;
  env?: string[];
  ignore?: boolean;
}
