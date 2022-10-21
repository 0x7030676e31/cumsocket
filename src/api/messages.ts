import Api from "./request";
import { messages } from "./types";

export async function send(channel: string, payload: messages.SendPayload): Promise<messages.Message> {
  return await Api.fetch(`channels/${channel}/messages`, {
    path: { channels: channel },
    endpoint: "messages",
    body: payload,
    nonce: true,
  });
}

export async function edit(channel: string, message: string, payload: messages.SendPayload): Promise<messages.Message> {
  return await Api.fetch(`channels/${channel}/messages/`, {
    method: "PATCH",
    path: { channels: channel, messages: message },
    endpoint: "messages",
    body: payload,
  });
}

export async function remove(channel: string, message: string): Promise<any> {
  return await Api.fetch(`channels/${channel}/messages/`, {
    method: "DELETE",
    path: { channels: channel, messages: message },
    endpoint: "messages",
  });
}

export async function get(channel: string, query: messages.GetQuery): Promise<messages.Message[]> {
  return await Api.fetch(`channels/${channel}/messages`, {
    method: "GET",
    path: { channels: channel },
    endpoint: "messages",
    query,
  });
}
