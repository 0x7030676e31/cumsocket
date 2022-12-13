export type ResponseBody<T> = ResponseOK<T> | ResponseErr;

export type ResponseOK<T> = Promise<{ ok: true, data: T }>;
export type ResponseErr = Promise<{ ok: false, code: number, message: string, errors: any }>;

export class Response<T> {
  private pending: ResponseBody<T>;

  constructor(pending: ResponseBody<T>) {
    this.pending = pending;
  }

  // Returns the response data if the response was successful, otherwise throws an error
  public async unwrap(): Promise<T> {
    const res = await this.pending;
    if (res.ok) return res.data;

    console.trace("Fetch unwrapping panicked");
    console.log(`Code: ${res.code}\nMessage: ${res.message}\nErrors: ${JSON.stringify(res.errors, null, 2)}`);
    process.exit(1);
  }

  // Returns the response data if the response was successful, otherwise call and return callback
  public async expect<C>(callback: (error?: { code?: number, message?: string, errors?: any }) => Promise<C> | C): Promise<T | C>;

  // Returns the response data if the response was successful, otherwise return given value
  public async expect<R>(returnValue: R): Promise<T | R>;

  // Returns the response data if the response was successful, otherwise return nothing
  public async expect(): Promise<T | void>;

  public async expect<R>(returnValue?: ((error?: { code?: number, message?: string, errors?: any }) => Promise<R> | R ) | R): Promise<T | R | void> {
    const res = await this.pending;
    if (res.ok) return res.data;

    if (returnValue && typeof returnValue === "function") return await (returnValue as any)({ code: res.code, message: res.message, errors: res.errors });
  }

  // Returns the response data assuming the response was successful, otherwise return null
  public async assume(): Promise<T | null> {
    const res = await this.pending;
    if (res.ok) return res.data;
    return null;
  }

  // Returns raw promise, use this if you want to handle the response yourself
  public get(): ResponseBody<T> {
    return this.pending;
  }

  // Returns the response data assuming the response was successful
  public async ignore(): Promise<T> {
    return (await (this.pending as ResponseOK<T>)).data;
  }

  // Returns boolean indicating if the response was successful
  public async isOk(): Promise<boolean> {
    return (await this.pending).ok;
  }
}