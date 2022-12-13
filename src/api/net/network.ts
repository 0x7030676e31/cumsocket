import { Response, ResponseBody } from "./response.js";
import { Request, RequestData } from "./request.js";
import fetch from "node-fetch";


type pending = { resolve: (valuez: Awaited<ResponseBody<any>>) => void, request: RequestData };
type rateLimit = { code: number, global: boolean, message: string, retry_after: number };

// Used to send requests to the Discord API and handle rate limits
class _Network {
  // Global cooldown?
  private globalCooldown: boolean = false;
  // Queue if global cooldown is active
  private globalQueue: string[] = [];
  // Queue of requests for each bucket
  private queue: { [key: string]: pending[] } = {};
  // List of active buckets
  private workingBuckets: string[] = [];

  // Push a request to the queue
  public push<T>(request: Request): Response<T> {
    return new Response<T>(new Promise(resolve => {
      // Build the request and push it to the queue
      const req = request.build();
      if (!this.queue[req.bucket]) this.queue[req.bucket] = [];
      this.queue[req.bucket].push({resolve, request: req });
    
      // Schedule the request
      if (this.globalCooldown && !this.globalQueue.includes(req.bucket)) this.globalQueue.push(req.bucket);
      else if (!this.workingBuckets.includes(req.bucket)) this.fetch(req.bucket);
    }) as ResponseBody<T>);
  }

  // Resolve all buckets in the global queue
  private async resolveGlobal(): Promise<void> {
    this.globalCooldown = false;
    // Schedule all buckets in the global queue
    for (const bucket of this.globalQueue) {
      this.fetch(bucket);
      await new Promise((res) => setTimeout(res, 50));
      if (this.globalCooldown) return;
    }

    // Clear the global queue
    this.globalQueue = [];
  }

  // Fetch from a bucket
  private async fetch(bucket: string): Promise<void> {
    if (!this.workingBuckets.includes(bucket)) this.workingBuckets.push(bucket);
    const next = this.queue[bucket][0];
    const data = next.request;

    // Send the request
    const request = await fetch(data.url, {
      method: data.method,
      headers: data.headers,
      body: data.body,
    });

    const { status } = request;
    
    // Handle rate limit
    if (status === 429) {
      const response = await request.json() as rateLimit;

      // Bucket rate limit
      if (!response.global) {
        setTimeout(this.fetch.bind(this, bucket), response.retry_after * 1000);
        return;
      }
      
      // Global rate limit
      this.workingBuckets.splice(this.workingBuckets.indexOf(bucket), 1);
      this.globalCooldown = true;
      setTimeout(this.resolveGlobal.bind(this), response.retry_after * 1000);      
      return;
    }

    // Remove the request from the queue
    this.queue[bucket].shift();

    // Schedule next request
    if (this.queue[bucket].length) setTimeout(this.fetch.bind(this, bucket), 50);
    else this.workingBuckets.splice(this.workingBuckets.indexOf(bucket), 1);

    // Resolve the request and return the Response object
    next.resolve(request.ok ? { ok: true, data: status === 204 ? undefined : await request.json() } : { ok: false, ...(await request.json() as any) });
  }
}

export const Network = new _Network();