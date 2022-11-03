export interface User {
  
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