export interface Embed {
  title?: string;
  type?: Type;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: Footer;
  image?: Image;
  thumbnail?: Image;
  video?: Partial<Image>;
  provider?: Provider;
  author?: Author;
  fields?: Field[];
}

export type Type = "rich" | "image" | "video" | "gifv" | "article" | "link";

export interface Footer {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface Image {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface Provider {
  name?: string;
  url?: string;
}

export interface Author {
  name: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface Field {
  name: string;
  value: string;
  inline?: boolean;
}