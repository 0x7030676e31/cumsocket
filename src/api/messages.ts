import Api from "./request";
import { messages } from "./types";

export async function send(channel: string, payload: messages.SendPayload) {
  return await Api.fetch(`channels/${channel}/messages`, {
    path: { channels: channel },
    endpoint: "messages",
    body: payload,
    // nonce: true,
  });
}