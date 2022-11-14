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
