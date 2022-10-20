import WebSocket from "ws";
import { EventEmitter } from "events";

import init from "../op2.json";

type payload = { op: number, d?: any, s?: number, t?: string };
export default class Handler extends EventEmitter {
  protected readonly url = "wss://gateway.discord.gg/?encoding=json&v=10";
  protected readonly token: string;

  private _ws!: WebSocket;
  private _hbInterval!: NodeJS.Timer;
  private _seq: number = 0;
  private _sessionId: string = "";

  constructor(token: string) {
    super();
    this.token = token;
    this.connect();
  }

  // handle an incoming message payload
  private async onMessage(data: any): Promise<void> {
    const { op, d, t }: payload = JSON.parse(data);
    switch (op) {
      // classic dispatch
      case 0:
        this._seq++;
        if (t === "READY") this._sessionId = d?.session_id;
        this.emit("dispatch", d, t!);
        break;
    
      // client should send a heartbeat rn
      case 1:
        this.heartbeat();
        break;

      // client have to reconnect
      case 7:
        this.connect(true);
        break;

      // session has been invalidated and client should eventaully reconnect
      case 9:
        this.connect(d === true);
        break;

      // "Hello" message
      case 10:
        this._hbInterval = setInterval(this.heartbeat.bind(this), d.heartbeat_interval);
        break;
    }
  }

  // send a heartbeat payload
  private async heartbeat(): Promise<void> {
    this.emit("heartbeat", this._seq);
    this._ws?.send(JSON.stringify({ op: 1, d: this._seq }));
  }
  
  private async onClose(code: number): Promise<void> {
    console.log(`Exiting: ${code}`);
    process.exit(code);
  }

  // generate an init payload for creating/resuming a session
  private getInitPayload(re: boolean = false): string {
    if (re) return JSON.stringify({
      op: 6,
      d: {
        token: this.token,
        session_id: this._sessionId,
        seq: this._seq,
      }
    });

    const payload = structuredClone(init);
    payload.d.token = this.token;
    return JSON.stringify(payload);
  }

  // connect to the gateway
  private async connect(re: boolean = false): Promise<void> {
    if (!re) this._seq = 0;
    this.prepare();

    const ws = this._ws = new WebSocket(this.url);

    ws.once("open", () => ws.send(this.getInitPayload(re)));
    ws.once("close", this.onClose.bind(this));
    ws.on("message", this.onMessage.bind(this));
  }

  // remove all listeners and clear the heartbeat interval
  private prepare(): void {
    clearInterval(this._hbInterval);
    this._ws?.removeAllListeners();
    this._ws?.close();
  }
  
  // protected log(msg: string): void {
  //   console.log(`\x1b[35m[${new Date().toUTCString()}] \x1b[36m${msg}\x1b[0m`);
  // }
}
