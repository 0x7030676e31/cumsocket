import * as types from "../api/types";

export default class Client {
  // private _user!: user;
  
  public async dispatch(payload: any, event: string): Promise<void> {
    // switch (event) {
    //   case "READY":
    //     this._user = payload.user;
    //     break;
    // }
  }

  // public get user(): user {
  //   return structuredClone(this._user);
  // }
}

type user = any;
// interface user {

// }
