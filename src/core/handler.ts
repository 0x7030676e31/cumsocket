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

  private readonly _badCodes: number[] = [];

  public readonly initDate: number = Date.now();

  constructor(token: string) {
    super();
    this.log("Gateway", "Starting up...");
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
        this.log("Gateway", "Discord is saying hello!");
        this._hbInterval = setInterval(this.heartbeat.bind(this), d.heartbeat_interval);
        break;
    }
  }

  // send a heartbeat payload
  private async heartbeat(): Promise<void> {
    this.emit("heartbeat", this._seq);
    this._ws?.send(JSON.stringify({ op: 1, d: this._seq }));
  }

  // handle the websocket closing event
  private async onClose(code: number): Promise<void> {
    if (this._badCodes.includes(code)) {
      this.log("Gateway", `Gateway closed with code ${code}!`);
      process.exit(1);
    }

    this.log("Gateway", `Gateway closed with code ${code}! Reconnecting...`);
    this.connect();
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

    ws.once("open", () => { ws.send(this.getInitPayload(re)); this.log("Gateway", "Connection established.")} );
    ws.once("close", this.onClose.bind(this));
    ws.on("message", this.onMessage.bind(this));
  }

  // remove all listeners and clear the heartbeat interval
  private prepare(): void {
    clearInterval(this._hbInterval);
    this._ws?.removeAllListeners();
    this._ws?.close();
  }

  public async disconnect(): Promise<void> {
    this.log("Gateway", "Disconnecting...");
    this._ws.close(1000);
    process.exit(0);
  }

  private async voiceStateUpdate(payload: VoiceState): Promise<void> {
    this._ws.send(JSON.stringify({ op: 4, d: payload }));
  }

  public log(header: string, msg: string): void {
    let uptime = (Date.now() - this.initDate) / 1000;
    
    const hours: number = Math.floor(uptime / 3600);
    uptime -= hours * 3600;

    const minutes: number = Math.floor(uptime / 60);
    uptime -= minutes * 60;

    const seconds: number = uptime;
    const time = `${hours ? `${hours}h ` : ""}${minutes ? `${minutes}m ` : ""}${seconds.toFixed(3)}s`;

    // console.log(`\x1b[35m(${time}) \x1b[34m[${header}] \x1b[36m${msg}\x1b[0m`);
    console.log(`(${time}) [${header}] ${msg}`);
  }
}

interface VoiceState {
  guild_id: string | null;
  channel_id: string | null;
  self_mute: boolean;
  self_deaf: boolean;
  self_video: boolean;
}
