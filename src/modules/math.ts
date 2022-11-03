import Core from "../core/core";
import api from "../api";
import * as types from "../api/types";

export default class Math {
  public readonly ctx!: Core;
  public readonly id = "math";
  public readonly env = ["math_precision", "math_display_precision"];

  public readonly ignore = true;

  @Core.listen("MESSAGE_CREATE")
  public async onMessageCreate(msg: types.messages.Message): Promise<void> {
    // TODO
  }
}