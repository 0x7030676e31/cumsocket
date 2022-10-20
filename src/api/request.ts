import fetch from "node-fetch";
import init from "../op2.json";

class Api {
  private _buckets: { [key: string]: [number, ...[Payload, (value: unknown) => void, (reason?: any) => void][]] } = {};
  private _globalLimit: number = 0;
  private _globalLimitBuckets: string[] = [];

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

  // generate nonce (for message confirmation) TOFIX
  // private getNonce(): string {  
  //   return ((new Date().getTime() - 1420070400000) << 22).toString();
  // }

  // execute the request (all networking stuff)
  private async exec(bucket: string) {
    const entry = this._buckets[bucket][1];
    const payload = entry[0];

    // send request
    const url = `${this._api}${Object.entries(payload.path).map(([key, value]) => `/${key}/${value}`).join("")}${payload.endpoint ? `/${payload.endpoint}` : ""}`;
    const query = payload.query ? `?${Object.entries(payload.query).map(([key, value]) => `${key}=${value}`).join("&")}` : "";

    const body = payload.noBody ? undefined : JSON.stringify(Object.assign(payload.body ?? {}, payload.nonce ? { nonce: /* this.getNonce() */ 0 } : {}));
    const headers = !payload.headers && payload.noDefaultHeaders ? undefined : Object.assign(payload.noDefaultHeaders ? {} : this.getHeader(), payload.headers ?? {});
    
    // fetch data
    const req = await fetch(encodeURI(url + query), {
      method: payload.method ?? "POST",
      body,
      headers,
    });

    // handle ratelimit
    if (req.status === 429) {
      const response = await req.json() as RateLimitResponse;
      if (response.global) {
        this._globalLimitBuckets.push(bucket);
        this._globalLimit = response.retry_after * 1000;
      }

      // wait for ratelimit to end
      setTimeout(this.exec.bind(this, bucket), response.retry_after * 1000);
      console.warn(response.message);
      return;
    }

    if (this._globalLimitBuckets.includes(bucket)) this._globalLimitBuckets.splice(this._globalLimitBuckets.indexOf(bucket), 1);
    this._buckets[bucket].splice(1, 1);
    if (this._buckets[bucket].length > 1) await this.exec(bucket);

    // handle response
    try {
      entry[req.ok ? 1 : 2](await req.json());
    } catch (e) {
      entry[req.ok ? 1 : 2](e);
    }
  }

  // fetch data from discord api (add to bucket queue)
  public async fetch(bucket: string, payload: Payload): Promise<any> {
    // return new promise that resolves when request is done
    return new Promise((resolve, reject) => {
      if (!this._buckets[bucket]) this._buckets[bucket] = [0];
      this._buckets[bucket].push([payload, resolve, reject]);
      if (this._buckets[bucket][0] !== 0 || this._buckets[bucket].length !== 2) return;
      
      // check if global ratelimit is active
      if (this._globalLimit === 0) {
        this.exec(bucket);
        return;
      }

      // wait for global ratelimit to end
      if (this._globalLimitBuckets.includes(bucket)) return;
      this._globalLimitBuckets.push(bucket);
      setTimeout(this.exec.bind(this, bucket), this._globalLimit);
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

interface RateLimitResponse {
  code: number;
  global: boolean;
  message: string;
  retry_after: number;
}
