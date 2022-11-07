import Api from "./request";
import { users } from "./types";

export async function getChannel(user: string): Promise<users.UserChannel> {
  return await Api.fetch(`users/@me/channels`, {
    path: { users: "@me" },
    endpoint: "channels",
    body: { recipients: [ user ] },
  });
}