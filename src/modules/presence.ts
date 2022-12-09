import Core from "../core/index.js";

// basic rich presence module
export default class Presence {
  public readonly ctx!: Core;
  public readonly id: string = "presence";

  public async ready(ctx: Core): Promise<void> {
    ctx.presenceUpdate({ status: "online", since: 0, afk: false, activities: [{
      application_id: "1050857456437305514",
      assets: {
        large_image: "1050870312998273054",
        large_text: "Congrats for checking this out I guess",
        small_image: "1050858918496174141",
      },
      details: "Made by 0x7030676e31",
      name: "Cumsocket v2",
      state: `Modules loaded: ${ctx.idList().length}`,
      timestamps: { start: Date.now() },
      buttons: [ "Check repository", "Eggs" ],
      metadata: { button_urls: [ "https://github.com/0x7030676e31/cumsocket", "https://cdn.britannica.com/94/151894-050-F72A5317/Brown-eggs.jpg" ] },
      type: 0,
    }] });
  }
}