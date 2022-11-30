import op2 from "../../op2.json";

export type Method = "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
export interface RequestData {
  bucket: string;
  url: string;
  method: Method;
  body?: string;
  headers?: { [key: string]: string };
}

export class Request {
  private _url: string;
  private _bucket: string;
  private _method: Method = "POST";
  private _query: { [key: string]: string } = {};
  private _body?: { [key: string]: string | any };
  private _headers?: { [key: string]: string };

  private readonly _properties = Buffer.from(JSON.stringify(op2.d.properties)).toString("base64");

  constructor(bucket: string, url?: string) {
    this._url = "https://discord.com/api/v9/" + (url ?? bucket);
    this._bucket = bucket;
  }

  public setMethod(method: Method): this {
    this._method = method;
    return this;
  }

  public addQuery(query?: { [key: string]: any }): this {
    if (!query) return this;
    
    if (!this._query) this._query = {};
    Object.assign(this._query, query);
    return this;
  }

  public addBody(body?: { [key: string]: string | any }): this {
    if (!body) return this;
    
    if (!this._body) this._body = {};
    Object.assign(this._body, body);
    return this;
  }

  public addNonce(): this {
    this.addBody({ nonce: ((BigInt(new Date().getTime()) - 1420070400000n) << 22n).toString() });
    return this;
  }

  public useDefaultHeaders(without?: string[]): this {
    if (!this._headers) this._headers = {};
    without = without ?? [];
    Object.assign(this._headers, Object.fromEntries(Object.entries({
      "Alt-used": "discord.com",
      "Authorization": process.env.TOKEN,
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Content-Type": "application/json",
      "Cookie": "", // TODO
      "Host": "discord.com",
      "Origin": "https://discord.com",
      "Pragma": "no-cache",
      // "Referer": "", TODO
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "TE": "trailers",
      "User-Agent": op2.d.properties.browser_user_agent,
      "X-Debug-Options": "bugReporterEnabled",
      "X-Discord-Locale": "en-US",
      "X-Discord-Properties": this._properties,
    }).filter(([key]) => !without!.includes(key))));
    return this;
  }

  public addHeaders(headers?: { [key: string]: string }): this {
    if (!headers) return this;
    
    if (!this._headers) this._headers = {};
    Object.assign(this._headers, headers);
    return this;
  }

  public build() {
    if (Object.keys(this._query).length) var query = "?" + Object.entries(this._query).map(([key, value]) => `${key}=${value}`).join("&");
    const url = encodeURI(this._url + (query! ?? ""));
    const body = this._body ? JSON.stringify(this._body) : undefined;

    return { bucket: this._bucket, url, method: this._method, body, headers: this._headers };
  }
}