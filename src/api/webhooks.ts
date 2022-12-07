import { Network, Request, Response } from "./net";
import { webhooks, messages } from "./types";

export function create(channel_id: string, webhook: webhooks.CreatePayload): Response<webhooks.Webhook> {
  return Network.push(new Request(`channels/${channel_id}/webhooks`)
    .useDefaultHeaders()
    .addBody(webhook)
  );
}

export function getUnderChannel(channel_id: string): Response<webhooks.Webhook[]> {
  return Network.push(new Request(`channels/${channel_id}/webhooks`)
    .setMethod("GET")
    .useDefaultHeaders()
  );
}

export function getUnderGuild(guild_id: string): Response<webhooks.Webhook[]> {
  return Network.push(new Request(`guilds/${guild_id}/webhooks`)
    .setMethod("GET")
    .useDefaultHeaders()
  );
}

export function get(webhook_id: string): Response<webhooks.Webhook> {
  return Network.push(new Request(`webhooks/${webhook_id}`)
    .setMethod("GET")
    .useDefaultHeaders()
  );
}

export function getWithToken(webhook_id: string, webhook_token: string): Response<webhooks.Webhook> {
  return Network.push(new Request(`webhooks/${webhook_id}/${webhook_token}`)
    .setMethod("GET")
    .addHeaders({ "Content-Type": "application/json" })
  );
}

export function edit(webhook_id: string, webhook: webhooks.ModifyPayload): Response<webhooks.Webhook> {
  return Network.push(new Request(`webhooks/${webhook_id}`)
    .setMethod("PATCH")
    .useDefaultHeaders()
    .addBody(webhook)
  );
}

export function remove(webhook_id: string): Response<null> {
  return Network.push(new Request(`webhooks/${webhook_id}`)
    .setMethod("DELETE")
    .useDefaultHeaders()
  );
}

export function removeWithToken(webhook_id: string, webhook_token: string): Response<null> {
  return Network.push(new Request(`webhooks/${webhook_id}/${webhook_token}`)
    .setMethod("DELETE")
    .addHeaders({ "Content-Type": "application/json" })
  );
}

export function execute(webhook_id: string, webhook_token: string, payload: webhooks.ExecutePayload, query?: webhooks.MsgExecuteQuery): Response<messages.Message> {
  return Network.push(new Request(`webhooks/${webhook_id}/${webhook_token}`)
    .addQuery(query)
    .addBody(payload)
    .addHeaders({ "Content-Type": "application/json" })
  );
}

export function getMessage(webhook_id: string, webhook_token: string, message_id: string, query?: webhooks.MsgQuery): Response<messages.Message> {
  return Network.push(new Request(`webhooks/${webhook_id}`, `webhooks/${webhook_id}/${webhook_token}/messages/${message_id}`)
    .setMethod("GET")
    .addQuery(query)
    .addHeaders({ "Content-Type": "application/json" })
  );
}

export function editMessage(webhook_id: string, webhook_token: string, message_id: string, payload: webhooks.EditPayload, query?: webhooks.MsgQuery): Response<messages.Message> {
  return Network.push(new Request(`webhooks/${webhook_id}`, `webhooks/${webhook_id}/${webhook_token}/messages/${message_id}`)
    .setMethod("PATCH")
    .addQuery(query)
    .addBody(payload)
    .addHeaders({ "Content-Type": "application/json" })
  );
}

export function deleteMessage(webhook_id: string, webhook_token: string, message_id: string, query?: webhooks.MsgQuery): Response<null> {
  return Network.push(new Request(`webhooks/${webhook_id}`, `webhooks/${webhook_id}/${webhook_token}/messages/${message_id}`)
    .setMethod("DELETE")
    .addQuery(query)
    .addHeaders({ "Content-Type": "application/json" })
  );
}
