import { AllowedMentions, Component, Attachment } from "./messages.js";
import { Channel } from "./channels.js";
import { Guild } from "./guilds.js";
import { Embed } from "./embeds.js";
import { User } from "./users.js";

export interface Webhook {
  id: string;
  type: 1 | 2 | 3;
  guild_id?: string | null;
  channel_id: string | null;
  user?: User;
  name: string | null;
  avatar: string | null;
  token?: string;
  application_id: string | null;
  source_guild?: Partial<Guild> | null;
  source_channel?: Partial<Channel> | null;
  url?: string;
}


export interface CreatePayload {
  name: string;
  avatar?: string;
}

export interface ModifyPayload {
  name?: string;
  avatar?: string;
  channel_id?: string;
}

export interface ExecutePayload {
  content?: string;
  username?: string;
  avatar_url?: string;
  tts?: boolean;
  embeds?: Embed[];
  allowed_mentions?: AllowedMentions;
  components?: Component[];
  attachments?: Partial<Attachment>[];
  flags?: number;
  thread_name?: string;
}

export interface EditPayload {
  content?: string | null;
  embeds?: Embed[] | null;
  allowed_mentions?: AllowedMentions | null;
  components?: Component[] | null;
  attachments?: Partial<Attachment>[] | null;
}

export interface MsgExecuteQuery {
  wait?: boolean;
  thread_id?: string;
}

export interface MsgQuery {
  thread_id?: string;
}