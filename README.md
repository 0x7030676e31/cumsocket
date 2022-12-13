# Cumsocket v2
Cumsocket is a "simple" Discord module based selfbot written in TypeScript that has features such as permissions management, Discord api, and more. Also worth mentioning is fact that selfbots are against Discord's ToS and can get you banned, even if you don't do anything harmful. If you really want to use selfbots, please don't do it on your main account. Enjoy my trashy code!

## ChatGPT - December 12, 2022
OpenAI changed how user is authenticated and added additional Cloudflare protection. Because of that, I had to disable ChatGPT module for now. There are temporary fixes, but they are not very reliable and it would be difficult to maintain ChatGPT module. When ChatGPT-Api will come with a fix, I will re-enable ChatGPT module.

<!-- - [Example of usage](#Example-of-usage)  -->
# Table of contents
- [Features](#Features)
- [Installation](#Installation)
- [Default modules](#Default-modules)
- [Module structure](#Module-structure)
- [Worth mentioning](#Worth-mentioning)
- [Dependencies](#Dependencies)
- [Future plans](#Future-plans)

# Features
- Websocket handling
- Rich permissions management
- Discord API wrapper
- Module flexibility
- Database support
- Almost undetectable
- Rate limit handling
- Client like data handling (only prototype for now)

<!-- # Example of usage (TODO) -->

# Installation
1. Clone the repository `git clone https://github.com/0x7030676e31/cumsocket`
2. Install dependencies `npm install` (see [nerdy stuff](#Dependencies) for more info)
3. Provide env vars in `.env` file (see [.env.examples](.env.example))
4. Run via `npm run start`!

# Default modules
- `egg` - Reacting to message containing eggs, and soon to images too! (Why? Idk)
- `pong` - Simple ping pong module
<!-- - `chatgpt` - Chatbot using GPT-3, responds to messages that start with mention (temporarlily disabled because of cloudflare auth issues) -->
- `bridge` - Used for copying attachments from multiple channels to one specified channel using webhooks
- `math` - Simple math module that can evaluate simple math expressions
- `permissions` - Permissions management module, used for managing permissions for other modules
- `presence` - Animated rich presence module, used to disaply rich presence on bot's profile

# Latest changes
- Added a lot of new comments
- Removed `chatgpt` module due to authentification issues (temporarily)
- Extended Storage class


# Module structure
## Note that all modules are loaded from `modules` directory.
```typescript
// Import core and types
import Core, { types } from "../core/index.js";

export default class ExampleModule {
  // Reference to Core instance, set by Core on load
  public readonly ctx!: Core;

  // Id is a unique identifier for the module which is mainly used for permissions management
  public readonly id: string = "example";

  // List of env vars that are required for the module to work
  public readonly env: string[] = ["EXAMPLE"];

  // If set to true, module won't be loaded, default set to false
  public readonly ignore: boolean = false;

  // Called when module is loaded
  public async load(ctx: Core): Promise<void> {
    ctx.log("example", "Module loaded!");
  }

  // Called when everything is ready - all modules are loaded, websocket connection is established, etc.
  public async ready(ctx: Core): Promise<void> {
    ctx.log("example", "Bot is ready!");
  }

  // Called on every "MESSAGE_CREATE" event
  @Core.listen("MESSAGE_CREATE")
  public async onMessageCreate(msg: types.MESSAGE_CREATE): Promise<void> {
    ctx.log("example", "Message created!");
  }
}
```

## Basic Ping Pong Module
```typescript
import Core, { types } from "../core/index.js";

// Used to calculate timestamp from snowflake
const EPOCH = 1420070400000n;

export default class Pong {
  public readonly id: string = "pong";
  public readonly ctx!: Core;

  // How bot's mention looks like
  private mention!: string;

  public async load(ctx: Core): Promise<void> {
    this.mention = `<@${ctx.getIdFromToken()}>`;
  }

  @Core.listen("MESSAGE_CREATE")
  public async onMessageCreate(msg: types.MESSAGE_CREATE): Promise<void> {
    // Check if message is mention
    if (msg.content !== this.mention) return;

    // Respond to message, if failed - return
    const reply = await this.ctx.api.messages.respond(msg.channel_id, msg.id, "🏓 Ping!").assume();
    if (reply === null) return;

    // Calculate ping
    const timestamp1 = (BigInt(msg.id) >> 22n) + EPOCH;
    const timestamp2 = (BigInt(reply.id) >> 22n) + EPOCH;
    const diff = timestamp2 - timestamp1;

    // Edit message to show ping
    this.ctx.api.messages.edit(msg.channel_id, reply.id, {
      content: `🏓 Pong! ${diff}ms`,
      allowed_mentions: { parse: ["everyone", "roles", "users"], replied_user: false },
    });
  }
}
```

# Worth mentioning
- [Selfbottign Article](https://support.discord.com/hc/en-us/articles/115002192352-Automated-user-accounts-self-bots-)
- API wrapper is based on [discord official docs](https://discord.com/developers/docs/intro) and private experiments with discord API so it may be not 100% accurate
- Bot is active 24/7, hosted on [Heroku](https://www.heroku.com/) and uses [Heroku Postgres](https://www.heroku.com/postgres) for database
- Bot is automatically deployed on every push to `main` branch
- Bot doesn't make anything harmful to anyone, it's just a fun project (ok maybe copying attachments may be considered as potential safety harm, but it's listening only to specific channels where the main content is mostly memes and other stuff that doesn't require any privacy)

# Dependencies
- [chatgpt 2.1.1](https://github.com/transitive-bullshit/chatgpt-api) (Temporarily disabled due to authentification issues)
- [decimal.js 10.4.3](https://github.com/MikeMcl/decimal.js)
- [dotenv 16.0.3](https://github.com/motdotla/dotenv)
- [node-fetch 3.3.0](https://github.com/node-fetch/node-fetch)
- [pg 8.8.0](https://github.com/brianc/node-postgres)
- [ws 8.10.0](https://github.com/websockets/ws)
<!-- - [zeromq 6.0.0-beta.16](https://github.com/zeromq/zeromq.js) -->

### Requirements
- [typescript 4.9.4](https://github.com/Microsoft/TypeScript)
- [node 19.x](https://github.com/nodejs/node)

# Future plans
My goal was to create something like environment for module based selfbot. Over time maybe I will add more modules and features like client like data manager. I'll maintain this project as long as I can but discord likes to change api in a rather strange way. As long as I can, I'll try to keep this project up to date and alive.


<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>

###### I really have to add something here to make it look like I'm doing something seriously