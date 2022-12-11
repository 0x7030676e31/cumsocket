import Core from "../core/index.js";

// basic rich presence module
export default class Presence {
  public readonly ctx!: Core;
  public readonly id: string = "presence";
  public readonly env: string[] = ["presence_refresh_rate"];

  private refreshRate!: number;
  private state: number = -1;
  private start!: number;

  public async ready(ctx: Core): Promise<void> {
    this.start = Date.now();
    this.refreshRate = +process.env.presence_refresh_rate!;
    this.update();
    setInterval(this.update.bind(this), this.refreshRate);
  }

  private async update(): Promise<void> {
    this.state++;
    
    let content: string;
    switch (this.state) {
      case 0:
        content = `Modules loaded: ${this.ctx.idList().length}`;
        break;

      case 1:
        content = `Guilds joined: ${this.ctx.client.getGuilds().length}`;
        break;

      case 2:
        content = `Total channels: ${this.ctx.client.getChannels().length}`;
        break;

      case 3:
        content = `Egged ${this.ctx.storage!.get("egg_count")} times`;
        break;

      case 4:
        content = `${this.ctx.storage!.get("gpt_answered")} questions answered`;
        this.state = -1;
        break;
    }


    this.ctx.presenceUpdate({ status: "online", since: 0, afk: false, activities: [{
      application_id: "1050857456437305514",
      assets: {
        large_image: "1050870312998273054",
        large_text: "Congrats for checking this out I guess",
        small_image: "1050858918496174141",
      },
      details: "Made by 0x7030676e31",
      name: "Cumsocket v2",
      state: content!,
      timestamps: { start: this.start },
      buttons: [ "Check repository", "Eggs" ],
      metadata: { button_urls: [ "https://github.com/0x7030676e31/cumsocket", "https://cdn.britannica.com/94/151894-050-F72A5317/Brown-eggs.jpg" ] },
      type: 0,
    }] });
  }
}