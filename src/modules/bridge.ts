import Core from "../core/core";
import api from "../api";
import * as types from "../api/types";

export default class Bridge {
  public readonly ctx!: Core;
  public readonly id = "egg";
  public readonly env = ["bridge_from", "bridge_webhook"];

  private _from: string[] = [];

  public async init(ctx: Core): Promise<void> {
    this._from = process.env.bridge_from!.split(/\s*,\s*/);
  }

  @Core.listen("MESSAGE_CREATE")
  public async onMessageCreate(msg: types.messages.Message): Promise<void> {
    if (!this._from.includes(msg.channel_id) || msg.author.bot) return;
  
  
  }
}