import Core from "../core/core";
import api from "../api";
import * as types from "../api/types";

export default class Egg {
  public readonly ctx!: Core;
  public readonly id = "egg";

  @Core.listen("MESSAGE_CREATE")
  public async onMessageCreate(msg: types.messages.Message): Promise<any> {
    if (!msg.content.toLowerCase().includes("egg")) return;
  
    const { channel_id: channel, id: message } = msg;
    api.messages.react(channel, message, "🥚");
  }

} 