import Api from "./request";
import { users } from "./types";

export async function get(user: string, query: { with_mutual_guilds: boolean } = { with_mutual_guilds: true }): Promise<users.User> {
  return await Api.fetch(`/users`, {
    method: "GET",
    path: { users: user },
    endpoint: "profile",
    query,
  });
}

export async function getChannel(user: string): Promise<users.UserChannel> {
  return await Api.fetch(`users/@me/channels`, {
    path: { users: "@me" },
    endpoint: "channels",
    body: { recipients: [ user ] },
  });
}