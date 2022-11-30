import { Response, ResponseBody } from "./response";
import { Request, RequestData } from "./request";
import fetch from "node-fetch";

const sleep = async (ms: number) => new Promise((res) => setTimeout(res, ms));

type pending = { resolve: (valuez: Awaited<ResponseBody<any>>) => void, request: RequestData };
type rateLimit = { code: number, global: boolean, message: string, retry_after: number };
class _Network {
  private globalCooldown: boolean = false;
  private globalQueue: string[] = [];
  private queue: { [key: string]: pending[] } = {};
  private workingBuckets: string[] = [];

  // push a request to the queue
  public push<T>(request: Request): Response<T> {
    return new Response<T>(new Promise(resolve => {
      // build the request and push it to the queue
      const req = request.build();
      if (!this.queue[req.bucket]) this.queue[req.bucket] = [];
      this.queue[req.bucket].push({resolve, request: req });
    
      // schedule the request
      if (this.globalCooldown && !this.globalQueue.includes(req.bucket)) this.globalQueue.push(req.bucket);
      else if (!this.workingBuckets.includes(req.bucket)) this.fetch(req.bucket);
    }) as ResponseBody<T>);
  }

  // resolve all buckets in the global queue
  private async resolveGlobal(): Promise<void> {
    this.globalCooldown = false;
    // schedule all buckets in the global queue
    for (const bucket of this.globalQueue) {
      this.fetch(bucket);
      await sleep(50);
      if (this.globalCooldown) return;
    }

    // clear the global queue
    this.globalQueue = [];
  }

  // fetch from a bucket
  private async fetch(bucket: string): Promise<void> {
    if (!this.workingBuckets.includes(bucket)) this.workingBuckets.push(bucket);
    const next = this.queue[bucket][0];
    const data = next.request;

    // send the request
    const request = await fetch(data.url, {
      method: data.method,
      headers: data.headers,
      body: data.body,
    });

    const { status } = request;
    
    // handle rate limit
    if (status === 429) {
      const response = await request.json() as rateLimit;

      // bucket rate limit
      if (!response.global) {
        setTimeout(this.fetch.bind(this, bucket), response.retry_after * 1000);
        return;
      }
      
      // global rate limit
      this.workingBuckets.splice(this.workingBuckets.indexOf(bucket), 1);
      this.globalCooldown = true;
      setTimeout(this.resolveGlobal.bind(this), response.retry_after * 1000);      
      return;
    }

    // remove the request from the queue
    this.queue[bucket].shift();

    // schedule next request
    if (this.queue[bucket].length) setTimeout(this.fetch.bind(this, bucket), 50);
    else this.workingBuckets.splice(this.workingBuckets.indexOf(bucket), 1);

    // resolve the request
    next.resolve(request.ok ? { ok: true, data: status === 204 ? undefined : await request.json() } : { ok: false, ...(await request.json()) });
  }
}

export const Network = new _Network();