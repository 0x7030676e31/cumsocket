export interface User {
  user: {
    id: string;
    username: string;
    avatar: string | null;
    avatar_decoration: string | null;
    discriminator: string;
    public_flags: number;
    flags: number;
    bot?: boolean;
    system?: boolean;
    banner: string | null;
    banner_color: string | null;
    accent_color: number | null;
    bio: string | null;
  };
  connected_accounts: Connection[];
  premium_since: string | null;
  premium_type: number | null;
  premium_guild_since: string | null;
  profile_themes_experiment_bucket: number;
  mutual_guilds?: MutualGuild[];
  user_profile: {
    bio: string | null;
    accent_color: number | null;
    banner?: string | null;
    theme_colors?: [ number, number ] | null;
    popout_animation_particle_type?: null | number; // idk what this is so I guess its number
    emoji?: string | null;
  };
  application?: Application;
}

export interface Connection {
  type: string;
  id: string;
  name: string;
  verified: boolean;
}

export interface MutualGuild {
  id: string;
  nick: string | null;
}

export interface Application {
  // TODO
}

export interface Author {
  id: string;
  username: string;
  avatar: string | null;
  avatar_decoration: string | null;
  discriminator: string;
  public_flags: number;
  bot?: boolean;
}

export interface UserChannel {
  id: string;
  type: number;
  last_message_id: string | null;
  flags: number;
  recipients: Author[];
}