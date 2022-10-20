import Core from "../core/core";
import api from "../api";

export default class test {
  public ctx!: Core;
  public id: string = "test";

  @Core.listen("ready")
  public async ready(data: any, events: string): Promise<void> {

  }
}
