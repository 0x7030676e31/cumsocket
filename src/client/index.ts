import Core, { types as wsTypes } from "../core/index.js";
import * as types from "./types.js";

export default class Client {
  private readonly ctx: Core;
  
  private self!: types.Self;
  private guilds!: types.Guild[];
  private channels!: types.Channel[];

  constructor(ctx: Core) {
    this.ctx = ctx;
  }

  public async dispatch(payload: wsTypes.default, event: string): Promise<void> {
    switch (event) {
      case "READY":
        let data = payload as wsTypes.READY;
        
        this.self = data.user;
        
        // TEMP
        this.guilds = data.guilds as any;
        this.channels = data.guilds.map(v => v.channels).flat() as any;
        break;
    }
  }

  public getSelf(): types.Self {
    return structuredClone(this.self);
  }

  public getGuilds(): types.Guild[] {
    return structuredClone(this.guilds);
  }

  public getChannels(): types.Channel[] {
    return structuredClone(this.channels);
  }
}