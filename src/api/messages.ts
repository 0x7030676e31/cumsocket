import { Network, Request, Response } from "./net/index.js";
import { messages, users } from "./types/index.js";

export function send(channel_id: string, payload: messages.SendPayload): Response<messages.Message> {
  return Network.push(new Request(`channels/${channel_id}/messages`)
    .useDefaultHeaders()
    .addNonce()
    .addBody(payload)
  );
}

export function respond(channel_id: string, message_id: string, content: string, ping: boolean = false): Response<messages.Message> {
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

export function edit(channel_id: string, messsage_id: string, payload: messages.SendPayload): Response<messages.Message> {
  return Network.push(new Request(`channels/${channel_id}/messages`, `channels/${channel_id}/messages/${messsage_id}`)
    .setMethod("PATCH")
    .useDefaultHeaders()
    .addBody(payload)
  );
}

export function remove(channel_id: string, message_id: string): Response<undefined> {
  return Network.push(new Request(`channels/${channel_id}/messages`, `channels/${channel_id}/messages/${message_id}`)
    .setMethod("DELETE")
    .useDefaultHeaders()
  );
}

export function get(channel_id: string, query: messages.GetQuery): Response<messages.Message[]> {
  return Network.push(new Request(`channels/${channel_id}/messages`)
    .setMethod("GET")
    .useDefaultHeaders()
    .addQuery(query)
  );
}

export function typingIndicator(channel_id: string): Response<null> {
  return Network.push(new Request(`channels/${channel_id}/typing`)
    .useDefaultHeaders()
  );
}

export function reactionAdd(channel_id: string, message_id: string, reaction: string, query: messages.ReactionQuery = { location: "Message", burst: false }): Response<null> {
  return Network.push(new Request(`channels/${channel_id}/reactions`, `channels/${channel_id}/messages/${message_id}/reactions/${reaction}/@me`)
    .setMethod("PUT")
    .useDefaultHeaders()
    .addQuery(query)
  );
}

export function reactionsGet(channel_id: string, message_id: string, reaction: string, query: { limit: number } = { limit: 100 }): Response<users.Author[]> {
  return Network.push(new Request(`channels/${channel_id}/reactions`, `channels/${channel_id}/messages/${message_id}/reactions/${reaction}`)
    .setMethod("GET")
    .useDefaultHeaders()
    .addQuery(query)
  );
}

export function reactionDelete(channel_id: string, message_id: string, reaction: string, user_id: string = "@me", query: { location: "Message" } = { location: "Message" }): Response<null> {
  return Network.push(new Request(`channels/${channel_id}/reactions`, `channels/${channel_id}/messages/${message_id}/reactions/${reaction}/${user_id}`)
    .setMethod("DELETE")
    .useDefaultHeaders()
    .addQuery(query)
  );
}

export function reactionDeleteEmoji(channel_id: string, message_id: string, reaction: string): Response<null> {
  return Network.push(new Request(`channels/${channel_id}/reactions`, `channels/${channel_id}/messages/${message_id}/reactions/${reaction}`)
    .setMethod("DELETE")
    .useDefaultHeaders()
  );
}

export function reactionDeleteAll(channel_id: string, message_id: string): Response<null> {
  return Network.push(new Request(`channels/${channel_id}/reactions`, `channels/${channel_id}/messages/${message_id}/reactions`)
    .setMethod("DELETE")
    .useDefaultHeaders()
  );
}
