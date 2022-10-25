import Api from "./request";
import { messages, users } from "./types";

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

export async function typingIndicator(channel: string): Promise<any> {
  return await Api.fetch(`channels/${channel}/typing`, {
    path: { channels: channel },
    endpoint: "typing",
  });
}

export async function react(channel: string, message: string, emoji: string, query: messages.ReactionQuery = { location: "Message", burst: false }): Promise<void> {
  return await Api.fetch(`channels/${channel}/reactions`, {
    method: "PUT",
    path: { channels: channel, messages: message, reactions: emoji },
    endpoint: "@me",
    query,
  });
}

export async function reactionsGet(channe: string, message: string, emoji: string, query: { limit: number } = { limit: 100 }): Promise<users.Author[]> {
  return await Api.fetch(`channels/${channe}/reactions`, {
    method: "GET",
    path: { channels: channe, messages: message, reactions: emoji },
    query,
  });
}

export async function reactionDelete(channel: string, message: string, reaction: string, user: string = "@me", query: { location: "Message" } = { location: "Message" }): Promise<void> {
  return await Api.fetch(`channels/${channel}/reactions`, {
    method: "DELETE",
    path: { channels: channel, messages: message, reactions: reaction },
    endpoint: user,
    query,
  });
}

export async function reactionDeleteAll(channel: string, message: string): Promise<void> {
  return await Api.fetch(`channels/${channel}/reactions`, {
    method: "DELETE",
    path: { channels: channel, messages: message },
    endpoint: "reactions",
  });
}

export async function reactionDeleteEmoji(channel: string, message: string, reaction: string): Promise<void> {
  return await Api.fetch(`channels/${channel}/reactions`, {
    method: "DELETE",
    path: { channels: channel, messages: message, reactions: reaction },
  });
}