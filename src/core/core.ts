import Handler from "./handler";
import fs from "fs";

export default class Core extends Handler {
  // [Module class, callback, events to listen to]
  private static _listeners: [Object, (data: any, events: string[]) => Promise<void> | void, ...string[]][] = [];

  constructor(token: string) {
    super(token);
    this.on("dispatch", this.dispatch.bind(this));
    this.loadModules("modules");
  }

  public static listen(...events: string[]) {
    return (target: Object, _: string | symbol, descriptor: PropertyDescriptor) => {
      Core._listeners.push([target, descriptor.value, ...events]);
      return descriptor;
    }
  }

  // handle an incoming message payload
  private async dispatch(data: any, event: string): Promise<void> {

  }

  private isClass(v: any): boolean {
    return Boolean(v && typeof v === "function" && v.prototype && !Object.getOwnPropertyDescriptor(v, 'prototype')?.writable);
  }

  private loadModules(dir: string): void {
    if (!fs.existsSync(`build/${dir}`)) throw new Error(`Directory ${dir} does not exist`);

    const modules = 
      fs.readdirSync(`build/${dir}`)
      .filter(v => v.endsWith(".js"))
      .map(v => require(`../${dir}/${v}`).default)
      .filter(v => this.isClass(v) && v.ignore !== true)
      .map(v => new v(this));
  
    // TODO
    Core._listeners.forEach(([target, callback, ...events]) => {
      const ctx = modules.find(v => v instanceof (target as any));
      
    });
  }
}

interface Module {
  ctx: Core;
  id: string;
  ignore?: boolean;
}
