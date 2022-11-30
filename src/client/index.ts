import Core from "../core";

export default class Client {
  private readonly ctx: Core;
  
  constructor(ctx: Core) {
    this.ctx = ctx;
  }

  public async dispatch(payload: any, event: string): Promise<void> {
    
  }
}