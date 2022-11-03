import Api from "./request";
import { webhooks, messages } from "./types";

export async function create(channel: string, data: webhooks.CreatePayload): Promise<webhooks.Webhook> {
  return await Api.fetch(`channels/${channel}/webhooks`, {
    path: { channels: channel },
    endpoint: "webhooks",
    body: data,
  });
}

export async function getForChannel(channel: string): Promise<webhooks.Webhook[]> {
  return await Api.fetch(`channels/${channel}/webhooks`, {
    method: "GET",
    path: { channels: channel },
    endpoint: "webhooks",
  });
}

export async function getForGuild(guild: string): Promise<webhooks.Webhook[]> {
  return await Api.fetch(`guilds/${guild}/webhooks`, {
    method: "GET",
    path: { guilds: guild },
    endpoint: "webhooks",
  });
}

export async function get(id: string): Promise<webhooks.Webhook> {
  return await Api.fetch(`webhooks/${id}`, {
    method: "GET",
    path: { webhooks: id },
  });
}

export async function getWithToken(id: string, token: string): Promise<webhooks.Webhook> {
  return await Api.fetch(`webhooks/${id}/${token}`, {
    method: "GET",
    path: { webhooks: id },
    endpoint: token,
    noDefaultHeaders: true,
    headers: { "Content-Type": "application/json" },
  });
}

export async function edit(id: string, data: webhooks.ModifyPayload): Promise<webhooks.Webhook> {
  return await Api.fetch(`webhooks/${id}`, {
    method: "PATCH",
    path: { webhooks: id },
    body: data,
  });
}

export async function editWithToken(id: string, token: string, data: webhooks.ModifyPayload): Promise<webhooks.Webhook> {
  return await Api.fetch(`webhooks/${id}/${token}`, {
    method: "PATCH",
    path: { webhooks: id },
    endpoint: token,
    noDefaultHeaders: true,
    headers: { "Content-Type": "application/json" },
    body: data,
  });
}

export async function remove(id: string): Promise<void> {
  return await Api.fetch(`webhooks/${id}`, {
    method: "DELETE",
    path: { webhooks: id },
  });
}

export async function removeWithToken(id: string, token: string): Promise<void> {
  return await Api.fetch(`webhooks/${id}/${token}`, {
    method: "DELETE",
    path: { webhooks: id },
    endpoint: token,
    noDefaultHeaders: true,
    headers: { "Content-Type": "application/json" },
  });
}

export async function execute(id: string, token: string, data: webhooks.ExecutePayload, query?: webhooks.MsgExecuteQuery): Promise<messages.Message> {
  return await Api.fetch(`webhooks/${id}/${token}`, {
    path: { webhooks: id },
    endpoint: token,
    noDefaultHeaders: true,
    headers: { "Content-Type": "application/json" },
    body: data,
    ...(query && { query }),
  });
}

export async function getMessage(id: string, token: string, message: string, query?: webhooks.MsgQuery): Promise<messages.Message> {
  return await Api.fetch(`webhooks/${id}/${token}/messages/${message}`, {
    method: "GET",
    path: { webhooks: `${id}/${token}`, messages: message },
    noDefaultHeaders: true,
    headers: { "Content-Type": "application/json" },
    ...(query && { query }),
  });
}

export async function editMessage(id: string, token: string, message: string, data: webhooks.EditPayload, query?: webhooks.MsgQuery): Promise<messages.Message> {
  return await Api.fetch(`webhooks/${id}/${token}/messages/${message}`, {
    method: "PATCH",
    path: { webhooks: `${id}/${token}`, messages: message },
    noDefaultHeaders: true,
    headers: { "Content-Type": "application/json" },
    body: data,
    ...(query && { query }),
  });
}

export async function removeMessage(id: string, token: string, message: string, query?: webhooks.MsgQuery): Promise<void> {
  return await Api.fetch(`webhooks/${id}/${token}/messages/${message}`, {
    method: "DELETE",
    path: { webhooks: `${id}/${token}`, messages: message },
    noDefaultHeaders: true,
    headers: { "Content-Type": "application/json" },
    ...(query && { query }),
  });
}
