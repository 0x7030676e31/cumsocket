import { Author } from "./users";
import { Embed } from "./embeds";

export interface Message {
  id: string;
  type: number;
  guild_id?: string;
  channel_id: string;
  content: string;
  author: Author;
  attachments: Attachment[];
  embeds: Embed[];
  mentions: Author[];
  mention_roles: string[];
  pinned: boolean;
  mention_everyone: boolean;
  tts: boolean;
  timestamp: string;
  edited_timestamp: string | null;
  flags: number;
  nonce?: string | null;
  components: Component[];
  referenced_message?: Message | null;
}

export interface Attachment {

}

export interface Component {

}

export interface SendPayload {
  content?: string;
  tts?: boolean;
  sticker_ids?: string[];
  message_reference?: MessageReference;
  allowed_mentions?: AllowedMentions;
}

export interface MessageReference {
  message_id?: string;
  channel_id?: string;
  guild_id?: string;
  fail_if_not_exists?: boolean;
}

export interface AllowedMentions {
  parse: ("roles" | "users" | "everyone")[];
  roles?: string[];
  users?: string[];
  replied_user?: boolean;
}

export interface GetQuery {
  around?: string;
  before?: string;
  after?: string;
  limit?: number;
}

export interface ReactionQuery {
  location?: "Message",
  burst?: boolean;
}
