import { Network, Request, Response } from "./net/index.js";
import { messages, users } from "./types/index.js";
import fetch from "node-fetch";
import Core from "../core/index.js";

export default class {
  private readonly ctx: Core;
  private attID: number = 0;

  constructor(ctx: Core) {
    this.ctx = ctx;
  }

  public send(channel_id: string, payload: messages.SendPayload): Response<messages.Message> {
    return Network.push(new Request(`channels/${channel_id}/messages`)
      .useDefaultHeaders()
      .addNonce()
      .addBody(payload)
    );
  }
  
  public respond(channel_id: string, message_id: string, content: string, ping: boolean = false): Response<messages.Message> {
    return Network.push(new Request(`channels/${channel_id}/messages`)
      .useDefaultHeaders()
      .addNonce()
      .addBody({
        content,
        message_reference: { channel_id: channel_id, message_id: message_id },
        allowed_mentions: { parse: ["everyone", "roles", "users"], replied_user: ping },
        tts: false,
      })
    );
  }

  public createAttachment(channel_id: string, files: messages.AttachmentSlotRequest[]): Response<{ attachments: messages.AttachmentSlot[] }> {
    files.forEach((file, idx, self) => file.id === undefined ? self[idx].id = (this.attID++).toString() : null);
    return Network.push(new Request(`channels/${channel_id}/attachments`)
      .useDefaultHeaders()
      .addBody({ files })
    ); 
  }

  public uplaodFiles(channel_id: string, ...files: { filename: string, content: Buffer | string }[]): Response<{ attachments: messages.AttachmentSlot[] }> {
    return new Response(new Promise<any>(async resolve => {
      const attachments = this.createAttachment(channel_id, files.map(v => ({
        filename: v.filename,
        file_size: Buffer.byteLength(v.content),
      })));

      const response = await attachments.get();
      if (!response.ok) return resolve(response);

      const { attachments: slots } = response.data;
      await Promise.all(slots.map((slot, index) => fetch(slot.upload_url, {
        method: "PUT",
        headers: {
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Host": "discord-attachments-uploads-prd.storage.googleapis.com",
          "Origin": "https://discord.com",
          "Pragma": "no-cache",
          "Referer": "discord.com",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "cross-site",
          "TE": "trailers",
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:107.0) Gecko/20100101 Firefox/107.0",
        },
        body: files[index].content,
      })));
    
      resolve({ ok: true, data: { attachments: slots } });
    }));
  }

  public async uploadFilesUrl(files: { content: Buffer | string, url: string }[]): Promise<void> {
    await Promise.all(files.map(v => fetch(v.url, {
      method: "PUT",
      headers: {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Host": "discord-attachments-uploads-prd.storage.googleapis.com",
        "Origin": "https://discord.com",
        "Pragma": "no-cache",
        "Referer": "discord.com",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "TE": "trailers",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:107.0) Gecko/20100101 Firefox/107.0",
      },
      body: v.content,
    })));
  }

  public edit(channel_id: string, messsage_id: string, payload: messages.SendPayload): Response<messages.Message> {
    return Network.push(new Request(`channels/${channel_id}/messages`, `channels/${channel_id}/messages/${messsage_id}`)
      .setMethod("PATCH")
      .useDefaultHeaders()
      .addBody(payload)
    );
  }
  
  public delete(channel_id: string, message_id: string): Response<void> {
    return Network.push(new Request(`channels/${channel_id}/messages`, `channels/${channel_id}/messages/${message_id}`)
      .setMethod("DELETE")
      .useDefaultHeaders()
    );
  }
  
  public get(channel_id: string, query: messages.GetQuery): Response<messages.Message[]> {
    return Network.push(new Request(`channels/${channel_id}/messages`)
      .setMethod("GET")
      .useDefaultHeaders()
      .addQuery(query)
    );
  }
  
  public typingIndicator(channel_id: string): Response<void> {
    return Network.push(new Request(`channels/${channel_id}/typing`)
      .useDefaultHeaders()
    );
  }
  
  public reactionAdd(channel_id: string, message_id: string, reaction: string, query: messages.ReactionQuery = { location: "Message", burst: false }): Response<void> {
    return Network.push(new Request(`channels/${channel_id}/reactions`, `channels/${channel_id}/messages/${message_id}/reactions/${reaction}/@me`)
      .setMethod("PUT")
      .useDefaultHeaders()
      .addQuery(query)
    );
  }
  
  public reactionsGet(channel_id: string, message_id: string, reaction: string, query: { limit: number } = { limit: 100 }): Response<users.Author[]> {
    return Network.push(new Request(`channels/${channel_id}/reactions`, `channels/${channel_id}/messages/${message_id}/reactions/${reaction}`)
      .setMethod("GET")
      .useDefaultHeaders()
      .addQuery(query)
    );
  }
  
  public reactionDelete(channel_id: string, message_id: string, reaction: string, user_id: string = "@me", query: { location: "Message" } = { location: "Message" }): Response<void> {
    return Network.push(new Request(`channels/${channel_id}/reactions`, `channels/${channel_id}/messages/${message_id}/reactions/${reaction}/${user_id}`)
      .setMethod("DELETE")
      .useDefaultHeaders()
      .addQuery(query)
    );
  }
  
  public reactionDeleteEmoji(channel_id: string, message_id: string, reaction: string): Response<void> {
    return Network.push(new Request(`channels/${channel_id}/reactions`, `channels/${channel_id}/messages/${message_id}/reactions/${reaction}`)
      .setMethod("DELETE")
      .useDefaultHeaders()
    );
  }
  
  public reactionDeleteAll(channel_id: string, message_id: string): Response<void> {
    return Network.push(new Request(`channels/${channel_id}/reactions`, `channels/${channel_id}/messages/${message_id}/reactions`)
      .setMethod("DELETE")
      .useDefaultHeaders()
    );
  }
}
