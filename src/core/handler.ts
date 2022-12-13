import DispatchPayload, * as events from "./mapping.js";
import { EventEmitter } from "events";
import op2 from "../op2.json" assert { type: "json" };
import WebSocket from "ws";

// Payload structure recieved from the gateway
type payload = { op: number, d?: any, s?: number, t?: string };
class Handler extends EventEmitter {
  protected readonly url = "wss://gateway.discord.gg/?encoding=json&v=10";
  protected readonly token: string;

  // Websocket connection
  private _ws!: WebSocket;
  // Interval object for heartbeats
  private _hbInterval!: NodeJS.Timer;
  // Sequence number
  private _seq: number = 0;
  // Session ID (used for resuming)
  private _sessionId: string = "";
  // Resume URL (used for resuming)
  private _resumeUrl: string = "";

  // Codes that should cause the client to close the connection
  private readonly _badCodes: number[] = [ 4004, 4010, 4011, 4013, 4014 ];

  constructor(token: string) {
    super();
    this.log("Gateway", "Starting up...");
    this.token = token;
    this.connect();
  }

  // Handle the websocket on open event
  private async onOpen(re: boolean): Promise<void> {
    this.emit("open", re);
    this.log("Gateway", "Connection established.");
    
    // Sent authentication payload
    this._ws.send(this.getInitPayload(re));
  }

  // Handle an incoming message payload
  private async onMessage(data: any): Promise<any> {
    const { op, d, t }: payload = JSON.parse(data);
    
    switch (op) {
      case OpCodes.DISPATCH:
        this._seq++;
        this.emit("dispatch", d, t!);
        
        if (t === "READY") {
          this._sessionId = d.session_id;
          this._resumeUrl = d.resume_gateway_url;
          this.emit("ready", d);
          return;
        }
        
        if (t === "RESUMED") {
          this.emit("resume", d);
          this.log("Gateway", "Session resumed successfully.");
        }
        break;

      // Client should send a heartbeat rn
      case 1:
        this.heartbeat();
        break;

      // Client have to reconnect
      case 7:
        this.log("Gateway", "Server is requesting a reconnect.");
        this.connect(true);
        break;

      // Session has been invalidated and client should eventaully reconnect
      case OpCodes.INVALID_SESSION:
        this.log("Gateway", "Session invalidated.");
        this.connect(d === true);
        break;

      // "Hello" message
      case OpCodes.HELLO:
        this.log("Gateway", "Discord is saying hello!");
        this._hbInterval = setInterval(this.heartbeat.bind(this), d.heartbeat_interval);
        break;

      // Heartbeat ack message
      case OpCodes.HEARTBEAT_ACK:
        this.emit("ack", this._seq);
        break;
    }
  }

  // Send a heartbeat payload
  private async heartbeat(): Promise<void> {
    this.emit("heartbeat", this._seq);
    this._ws?.send(JSON.stringify({ op: OpCodes.HEARTBEAT, d: this._seq }));
  }

  // Handle the websocket closing event
  private async onClose(code: number): Promise<void> {
    this.emit("close", code);
    if (this._badCodes.includes(code)) {
      this.log("Gateway", `Gateway closed with code ${code}!`);
      process.exit(1);
    }

    this.log("Gateway", `Gateway closed with code ${code}! Reconnecting...`);
    this.connect();
  }

  // Generate an init payload for creating/resuming a session
  private getInitPayload(re: boolean = false): string {
    if (re) return JSON.stringify({
      op: OpCodes.RESUME,
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

  // (Re) Connect to the gateway
  private async connect(re: boolean = false): Promise<void> {
    if (!re) this._seq = 0;
    this.prepare();

    // Create a new websocket connection
    const ws = this._ws = new WebSocket(re ? this._resumeUrl : this.url);
    this.log("Gateway", re ? "Attempting to reconnect..." : "Connecting...");

    // Add event listeners
    ws.once("open", this.onOpen.bind(this, re));
    ws.once("close", this.onClose.bind(this));
    ws.on("message", this.onMessage.bind(this));
  }

  // Remove all listeners and clear the heartbeat interval - do things before reconnecting
  private prepare(): void {
    clearInterval(this._hbInterval);
    this._ws?.removeAllListeners();
    this._ws?.close();
  }


  // Disconnect from the gateway and eventaully exit the process
  public async disconnect(reconnect: boolean = false): Promise<void> {
    this.log("Gateway", "Disconnecting...");
    this._ws.close(1000);
    if (reconnect) this.connect();
    else process.exit(0);
  }


  // Update the client's presence (op 3)
  public async presenceUpdate(presence: Presence): Promise<void> {
    this._ws.send(JSON.stringify({ op: OpCodes.PRESENCE_UPDATE, d: presence }));
  }

  // Update user voice settings (op 4)
  public async voiceStateUpdate(payload: VoiceState): Promise<void> {
    this._ws.send(JSON.stringify({ op: 4, d: payload }));
  }

  // Confirm that user opened direct message channel, required to not get banned (op 13, undocumented)
  public async dmConfirmation(id: string): Promise<void> {
    this._ws.send(JSON.stringify({ op: OpCodes.DM_CONFIRMATION, d: { channel_id: id } }));
  }

  // Used in the log method to display uptime
  public readonly initDate: number = Date.now();

  // Log a message to the console displaying the uptime
  public log(header: string, msg: string): void {
    // Calculate uptime
    let uptime = (Date.now() - this.initDate) / 1000;
    
    const hours: number = Math.floor(uptime / 3600);
    uptime -= hours * 3600;

    const minutes: number = Math.floor(uptime / 60);
    uptime -= minutes * 60;

    const seconds: number = uptime;
    const time = `${hours ? `${hours}h ` : ""}${minutes ? `${minutes}m ` : ""}${seconds.toFixed(3)}s`;

    // Colors used in formatting
    const reset = "\x1b[0m";
    const yellow = "\x1b[38;2;189;183;107m"
    const blue = "\x1b[38;2;65;105;225m";
    const green = "\x1b[38;2;50;205;50m";

    if (process.env.DISABLE_FORMATTING === "true") console.log(`(${time}) [${header}] ${msg}`);
    else console.log(`(${yellow}${time}${reset}) [${blue}${header}${reset}] ${green}${msg}${reset}`);
  }
}

enum OpCodes {
  DISPATCH = 0,
  HEARTBEAT = 1,
  IDENTIFY = 2,
  PRESENCE_UPDATE = 3,
  VOICE_STATE_UPDATE = 4,
  RESUME = 6,
  RECONNECT = 7,
  REQUEST_GUILD_MEMBERS = 8,
  INVALID_SESSION = 9,
  HELLO = 10,
  HEARTBEAT_ACK = 11,
  // UNKNOWN = 12,
  DM_CONFIRMATION = 13,
}

interface Presence {
  status: "online" | "dnd" | "idle" | "invisible";
  since: number;
  activities: (Activity0 | Activity4)[];
  afk: boolean;
}

interface Activity4 {
  type: 4;
  name: "Custom Status";
  state: string;
  emoji: string | null;
}

interface Activity0 {
  type: 0;
  application_id: string;
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  details?: string;
  name?: string;
  state?: string;
  timestamps?: { start: number } | { end: number }; 
  buttons?: [ string?, string? ];
  metadata?: { button_urls?: [ string?, string? ] };
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
