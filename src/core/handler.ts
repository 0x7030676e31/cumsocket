import DispatchPayload, * as events from "./mapping";
import { EventEmitter } from "events";
import op2 from "../op2.json";
import WebSocket from "ws";

type payload = { op: number, d?: any, s?: number, t?: string };
class Handler extends EventEmitter {
  protected readonly url = "wss://gateway.discord.gg/?encoding=json&v=10";
  protected readonly token: string;

  private _ws!: WebSocket;
  private _hbInterval!: NodeJS.Timer;
  private _seq: number = 0;
  private _sessionId: string = "";

  // codes that should cause the client to exit
  private readonly _badCodes: number[] = [ 4004 ];
  
  // used in the log method
  public readonly initDate: number = Date.now();

  constructor(token: string) {
    super();
    this.log("Gateway", "Starting up...");
    this.token = token;
    this.connect();
  }

  // handle the websocket opening event
  private async onOpen(re: boolean): Promise<void> {
    this.emit("open", re);
    this.log("Gateway", "Connection established.");
    
    this._ws.send(this.getInitPayload(re));
  }

  // handle an incoming message payload
  private async onMessage(data: any): Promise<any> {
    const { op, d, t }: payload = JSON.parse(data);
    switch (op) {
      // classic dispatch
      case 0:
        this._seq++;
        this.emit("dispatch", d, t!);
        if (t === "READY") return this._sessionId = d.session_id && this.emit("ready", d);
        if (t === "RESUMED") return this.emit("resume", d) && this.log("Gateway", "Session resumed successfully.");
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

      // heartbeat ack
      case 11:
        this.emit("ack", this._seq);
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
    this.emit("close", code);
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

    const payload = structuredClone(op2);
    payload.d.token = this.token;
    return JSON.stringify(payload);
  }

  // connect to the gateway
  private async connect(re: boolean = false): Promise<void> {
    if (!re) this._seq = 0;
    this.prepare();

    const ws = this._ws = new WebSocket(this.url);

    this.log("Gateway", re ? "Attempting to reconnect..." : "Connecting...");

    ws.once("open", this.onOpen.bind(this, re));
    ws.once("close", this.onClose.bind(this));
    ws.on("message", this.onMessage.bind(this));
  }

  // remove all listeners and clear the heartbeat interval
  private prepare(): void {
    clearInterval(this._hbInterval);
    this._ws?.removeAllListeners();
    this._ws?.close();
  }

  // disconnect from the gateway and exit
  public async disconnect(): Promise<void> {
    this.log("Gateway", "Disconnecting...");
    this._ws.close(1000);
    process.exit(0);
  }

  // update user voice settings
  public async voiceStateUpdate(payload: VoiceState): Promise<void> {
    this._ws.send(JSON.stringify({ op: 4, d: payload }));
  }

  // confirm that user opened direct message channel
  public async dmConfirmation(id: string): Promise<void> {
    this._ws.send(JSON.stringify({ op: 13, d: { channel_id: id } }));
  }

  // log a message to the console
  public log(header: string, msg: string): void {
    let uptime = (Date.now() - this.initDate) / 1000;
    
    const hours: number = Math.floor(uptime / 3600);
    uptime -= hours * 3600;

    const minutes: number = Math.floor(uptime / 60);
    uptime -= minutes * 60;

    const seconds: number = uptime;
    const time = `${hours ? `${hours}h ` : ""}${minutes ? `${minutes}m ` : ""}${seconds.toFixed(3)}s`;

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

type Hello = { heartbeat_interval: number };
type AsyncOr = Promise<void> | void;
interface Events {
  open: (reconnecting: boolean) => AsyncOr;
  close: (code: number) => AsyncOr;
  ready: (data: events.READY) => AsyncOr;
  dispatch: (data: DispatchPayload, event: string) => AsyncOr;
  heartbeat: (seq: number) => AsyncOr;
  ack: (seq: number) => AsyncOr;
  hello: (data: Hello) => AsyncOr;
  resume: (seq: number) => AsyncOr;
}

declare interface Handler {
  addListener<U extends keyof Events>(event: U, listener: Events[U]): this;
  on<U extends keyof Events>(event: U, listener: Events[U]): this;
  once<U extends keyof Events>(event: U, listener: Events[U]): this;
  removeListener<U extends keyof Events>(event: U, listener: Events[U]): this;
  off<U extends keyof Events>(event: U, listener: Events[U]): this;
  removeAllListeners<U extends keyof Events>(event?: U): this;
  listeners<U extends keyof Events>(event: U): Events[U][];
  rawListeners<U extends keyof Events>(event: U): Events[U][];
  emit<U extends keyof Events>(event: U, ...args: Parameters<Events[U]>): boolean;
  listenerCount<U extends keyof Events>(event: U): number;
  prependListener<U extends keyof Events>(event: U, listener: Events[U]): this;
  prependOnceListener<U extends keyof Events>(event: U, listener: Events[U]): this;
}

export default Handler;
