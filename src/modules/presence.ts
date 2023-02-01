import Core from "../core/index.js";
import fetch from "node-fetch";

// Basic rich presence module for displaying infomations in the bot's status

export default class Presence {
  public readonly ctx!: Core;
  public readonly id: string = "presence";
  public readonly env: string[] = ["presence_refresh_rate"];

  // Repository to get commits from
  private readonly repo: string = "0x7030676e31/cumsocket";
  // How many commits repository has
  private commits: number = 0;
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
    
    // Fetch commits
    this.fetchCommits();

    // Set the interval
    this.update();
    setInterval(this.update.bind(this), this.refreshRate);
  }

  private async fetchCommits(): Promise<void> {
    this.ctx.log("Presence", "Fetching commits...");
    const fetchingMs = Date.now();
    
    // Fetch contributors
    const request = await fetch(`https://api.github.com/repos/${this.repo}/contributors`, {
      headers: { Accept: "application/vnd.github+json" },
    });

    // Calculate commits
    const contributors = await request.json() as { contributions: number }[];
    this.commits = contributors.reduce((a, b) => a + b.contributions, 0);

    this.ctx.log("Presence", `Fetched ${this.commits} commits through ${contributors.length} contributors. Took ${Date.now() - fetchingMs}ms`);
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
        break;

      case 4:
        content = `Answered ${this.ctx.storage?.get("gpt_responses")} questions`
        break;
        
      // https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number
      case 5:
        content = `${this.commits}${["st","nd","rd"][((this.commits + 90) % 100 - 10) % 10 - 1] || "th"} Cumsocket Build`;
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
      buttons: [ "Check repository" ],
      metadata: { button_urls: [ `https://github.com/${this.repo}` ] },
      type: 0,
    }] });
  }
}