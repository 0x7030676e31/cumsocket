import Core, { types } from "../core/index.js";
import { ChatGPTAPI } from "chatgpt";

const BAD_WORDS = /(?<![a-zA-Z])(?:cum|semen|cock|pussy|cunt|nigg.r)(?![a-zA-Z])/;
const SCAM_PATTERN = /stea.*co.*\\.ru|http.*stea.*c.*\\..*trad|csgo.*kni[fv]e|cs.?go.*inventory|cs.?go.*cheat|cheat.*cs.?go|cs.?go.*skins|skins.*cs.?go|stea.*com.*partner|скин.*partner|steamcommutiny|di.*\\.gift.*nitro|http.*disc.*gift.*\\.|free.*nitro.*http|http.*free.*nitro.*|nitro.*free.*http|discord.*nitro.*free|free.*discord.*nitro|@everyone.*http|http.*@everyone|discordgivenitro|http.*gift.*nitro|http.*nitro.*gift|http.*n.*gift|бесплат.*нитро.*http|нитро.*бесплат.*http|nitro.*http.*disc.*nitro|http.*click.*nitro|http.*st.*nitro|http.*nitro|stea.*give.*nitro|discord.*nitro.*steam.*get|gift.*nitro.*http|http.*discord.*gift|discord.*nitro.*http|personalize.*your*profile.*http|nitro.*steam.*http|steam.*nitro.*http|nitro.*http.*d|http.*d.*gift|gift.*http.*d.*s|discord.*steam.*http.*d|nitro.*steam.*http|steam.*nitro.*http|dliscord.com|free.*nitro.*http|discord.*nitro.*http|@everyone.*http|http.*@everyone|@everyone.*nitro|nitro.*@everyone|discord.*gi.*nitro/i;

export default class ChatGPT {
  public readonly ctx!: Core;
  public readonly id: string = "chatgpt";
  public readonly env: string[] = [ "chatgpt_token" ];

  private api!: ChatGPTAPI;
  private mention!: string;
  private selfID!: string;

  private converations: { [key: string]: {
    convID: string;
    messID: string;
  } } = {};

  private activeConvos: number = 0;

  public async load(ctx: Core): Promise<void> {
    // Initialize ChatGPT connection
    this.api = new ChatGPTAPI({
      apiKey: process.env.chatgpt_token!,
    });

    // 
    this.mention = `<@${ctx.getIdFromToken()}>`;
    this.selfID = ctx.getIdFromToken();

    // Insert gpt_responses count to the database
    await this.ctx.storage?.setIfNotExists("gpt_responses", "0");
  }

  @Core.listen("MESSAGE_CREATE")
  public async onMessage(msg: types.MESSAGE_CREATE): Promise<void> {
    if (!msg.content.includes(this.mention) || this.selfID === msg.author.id) return;

    const content = msg.content.slice(this.mention.length).trim();
    if (!content) return;

    if (this.activeConvos >= 3) return this.ctx.api.messages.reactionAdd(msg.channel_id, msg.id, "🚎") as any;

    this.activeConvos++;

    const response = await this.ctx.api.messages.respond(msg.channel_id, msg.id, "📨 Waiting for ChatGPT response...", false).get();
    if (!response.ok) {
      this.activeConvos--;
      this.ctx.log("ChatGPT", `There was an error with responding to the message on channel ${msg.channel_id}`);
      return;
      
    }
    const gptResponse = await this.api.sendMessage(content, {
      ...(this.converations[msg.author.id] && {
        conversationId: this.converations[msg.author.id].convID,
        parentMessageId: this.converations[msg.author.id].messID,
      }),
    });


    const isBad = msg.guild_id === "391020510269669376" ? BAD_WORDS.test(gptResponse.text) || SCAM_PATTERN.test(gptResponse.text) : false;
    const tooLong = isBad || gptResponse.text.length > 2000;

    if (tooLong) var files = await this.ctx.api.messages.uplaodFiles(msg.channel_id, {
      filename: "response.txt",
      content: gptResponse.text,
    }).unwrap();

    this.ctx.api.messages.edit(msg.channel_id, response.data.id, {
      ...(!tooLong && { content: isBad ? "Chatgpt response contains some bad words which are unwelcome on this server <:flarogus:888054896769773600>" : gptResponse.text}),
      ...(files! && { attachments: [{
        id: files.attachments[0].id.toString(),
        filename: "response.txt",
        uploaded_filename: files.attachments[0].upload_filename,
      }] }),
      allowed_mentions: { parse: ["everyone", "roles", "users"], replied_user: false },
    });

    this.ctx.storage?.numericIncr("gpt_responses");

    this.converations[msg.author.id] = {
      convID: gptResponse.conversationId!,
      messID: gptResponse.id!,
    }

    this.activeConvos--;
  }
}