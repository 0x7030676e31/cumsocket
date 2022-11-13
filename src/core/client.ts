import Core, { types as apiTypes } from ".";
import api from "../api";

export default class Client {
  public readonly ctx: Core;

  private _users: BaseUser[] = [];
  private _dms: DmChannel[] = [];

  constructor(ctx: Core) {
    this.ctx = ctx;
  }

  // TODO: add more methods
  public async dispatch(payload: any, event: string): Promise<any> {
    switch (event.toLowerCase().replaceAll("_", " ")) {
      case "ready": {
        this._users = payload.users;
        this._dms = payload.private_channels;
        break;
      }

      case "presence update": {
        if (payload.guild_id) break; // temp
        Object.assign(this._users[payload.user.id], payload.user);
        break;
      }

      case "channel recipient add": {
        const group = this._dms.find((c) => c.type === 3 && c.id === payload.channel_id);
        group!.recipient_ids.push(payload.user_id);
        break;
      }

      case "channel recipient remove": {
        const group = this._dms.find((c) => c.type === 3 && c.id === payload.channel_id);
        group!.recipient_ids = group!.recipient_ids.filter((id) => id !== payload.user_id);
        break;
      }
    }
  }

  public async getUserById(id: string): Promise<BaseUser> {
    const user = this._users.find((u) => u.id === id);
    if (user) return user;

    return this.fetchUser(id);
  }

  public async getPrivateChannelByUser(user: string): Promise<DmChannel> {
    const channel = this._dms.find((c) => c.recipient_ids.includes(user));
    if (channel) return channel;
    
    return this.openDm(user);
  }

  public async getDmByUser(user: string): Promise<Dm> {
    const channel = this._dms.find((c) => c.type === 1 && c.recipient_ids.includes(user));
    if (channel) return structuredClone(channel) as Dm;

    return this.openDm(user);
  }

  public async getGroupsByUser(user: string): Promise<Group[]> {
    return structuredClone(this._dms.filter((c) => c.type === 3 && c.recipient_ids.includes(user))) as Group[];
  }

  private async fetchUser(id: string): Promise<BaseUser> {
    const user = (await api.users.get(id)).user;

    const baseUser = { username: user.username, public_flags: user.public_flags, id: user.id, discriminator: user.discriminator, bot: user.bot ?? false, avatar_decoration: user.avatar_decoration, avatar: user.avatar }
    
    this._users.push(baseUser);
    return baseUser;
  }

  private async openDm(user: string): Promise<Dm> {
    const channel = await api.users.getChannel(user);
    this.ctx.dmConfirmation(channel.id);

    const dm = { type: 1, recipient_ids: [ channel.recipients[0].id ], last_message_id: channel.last_message_id, id: channel.id, flags: channel.flags } as Dm;

    this._dms.push(dm);
    return structuredClone(dm);
  }
}

type DmChannel = Dm | Group;

interface Dm {
  type: 1;
  recipient_ids: [ string ];
  last_message_id: string | null;
  id: string;
  flags: number;
}

interface Group {
  type: 3;
  recipient_ids: string[];
  onwer_id: string;
  name: string | null;
  last_message_id: string | null;
  id: string;
  icon: string | null;
  flags: number;
}

interface BaseUser {
  username: string;
  public_flags: number;
  id: string;
  discriminator: string;
  bot: boolean;
  avatar_decoration: string | null;
  avatar: string | null;
}