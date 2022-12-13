import { Author } from "./users.js";
import { Embed } from "./embeds.js";

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
  reactions?: Reaction[];
}

export interface Attachment {
  // id: string;
  // filename: string;
  // description?: string;
  // content_type?: string;
  // size: string;
  // url: string;
  // proxy_url: string;
  // height?: number | null;
  // width?: number | null;
  // empheral?: boolean;
  id: string;
  filename: string;
  uploaded_filename: string;
}

export interface Component {

}

export interface SendPayload {
  content?: string;
  attachments?: Attachment[];
  type?: number;
  channel_id?: string;
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

export interface Reaction {
  emoji: Emoji;
  count: number;
  me: boolean;
  burst_count?: number;
  burst_colors?: string[];
  burst_me?: boolean;
}

interface Emoji {
  id: string | null;
  name: string;
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

export interface AttachmentSlotRequest {
  filename: string;
  file_size: number;
  id?: string;
}

export interface AttachmentSlot {
  id: number,
  upload_filename: string,
  upload_url: string,
}
