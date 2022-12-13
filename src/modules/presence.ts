import Core, { env } from "../core/index.js";

// Basic rich presence module for displaying infomations in the bot's status

export default class Presence {
  public readonly ctx!: Core;
  public readonly id: string = "presence";
  public readonly env: string[] = ["presence_refresh_rate"];

  // How often to update presence (in miliseconds)
  private refreshRate!: number;
  // Current state of the presence (what to display)
  private state: number = -1;
  // Time when the bot started
  private start!: number;


  public async ready(): Promise<void> {
    // Set up env and save start time
    this.start = Date.now();
    this.refreshRate = +process.env.presence_refresh_rate!;
    
    // Set the interval
    this.update();
    setInterval(this.update.bind(this), this.refreshRate);
  }


  private async update(): Promise<void> {
    this.state++;
    
    let content: string;
    switch (this.state) {
      case 0:
        content = `${this.ctx.idList().length} Modules Loaded`;
        break;

      case 1:
        content = `Joined ${this.ctx.client.getGuilds().length} Guilds`;
        break;

      case 2:
        content = `Listening to ${this.ctx.client.getChannels().length} Channels`;
        break;

      case 3:
        content = `Egged ${this.ctx.storage!.get("egg_count")} Times`;
        this.state = -1;
        break;
    }


    // Update bot presence
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