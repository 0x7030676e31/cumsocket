import fetch from "node-fetch";
import init from "../op2.json";

class Api {
  private _buckets: { [key: string]: [number, ...[Payload, (value: unknown) => void, (reason?: any) => void][]] } = {};

  private readonly _api = "https://discord.com/api/v10";
  private readonly _super_properties = Buffer.from(JSON.stringify(init.d.properties)).toString("base64");
  private readonly _headers = {
    "Accept-language": "en-US",
    "Authorization": "",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Content-Type": "application/json",
    "Cookie": "",
    "Origin": "https://discord.com",
    "Pragma": "no-cache",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent": init.d.properties.browser_user_agent,
    "X-Debug-Options": "bugReporterEnabled",
    "X-Discord-Locale": "en-US",
    "X-Super-Properties": this._super_properties,
  }

  // generate new header
  private getHeader() {
    return Object.assign(structuredClone(this._headers), { Authorization: process.env.token! });
  }

  // generate nonce (for message confirmation)
  private getNonce(): string {  
    return ((new Date().getTime() - 1420070400000) << 22).toString();
  }

  private async exec(bucket: string) {
    const entry = this._buckets[bucket][1];

    this._buckets[bucket].splice(1, 1);
    if (this._buckets[bucket].length > 1) await this.exec(bucket);
  }

  public async fetch(bucket: string, payload: Payload): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this._buckets[bucket]) this._buckets[bucket] = [0];
      this._buckets[bucket].push([payload, resolve, reject]);
      if (this._buckets[bucket][0] === 0 && this._buckets[bucket].length === 2) this.exec(bucket);
    });
  }
}

export default new Api();

interface Payload {
  path: { [key: string]: string };
  endpoint?: string;
  query?: { [key: string]: string };
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: { [key: string]: any } | any;
  headers?: { [key: string]: any } | any;
  nonce?: boolean;

  noBody?: boolean;
  noDefaultHeaders?: boolean;
}
