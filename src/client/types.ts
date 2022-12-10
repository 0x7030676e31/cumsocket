// TODO

export interface Self {
  verified: boolean;
  username: string;
  purchased_flags: number;
  premium_type: number;
  premium: boolean;
  phone: null | string;
  nsfw_allowed: boolean;
  mobile: boolean;
  mfa_enabled: boolean;
  id: string;
  flags: number;
  email: string;
  discriminator: string;
  desktop: boolean;
  bio: string;
  banner_color: null | string;
  banner: null | string;
  avatar_decoration: null | string;
  avatar: null | string;
  accent_color: null | number;
  public_flags?: number;
}

export interface Guild {
  name: string;
  id: string;
}

export interface Channel {
  
}