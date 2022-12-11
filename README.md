# Cumsocket v2
Cumsocket is a "simple" Discord module based selfbot written in TypeScript that has features such as permissions management, Discord api, and more. Also worth mentioning is fact that selfbots are against Discord's ToS and can get you banned, even if you don't do anything harmful. If you really want to use selfbots, please don't do it on your main account.


# Features
- Websocket handling
- Rich permissions management
- Discord API wrapper
- Module flexibility
- Database support
- Almost undetectable
- Rate limit handling
- Client like data handling (only prototype for now)

# Installation
1. Clone the repository `git clone https://github.com/0x7030676e31/cumsocket`
2. Install dependencies `npm install` (see [nerdy stuff](#Dependencies) for more info)
3. Provide env vars in `.env` file (see [.env.examples](.env.example))
4. Run via `npm run start`!

# Module structure
```typescript
// Import core and types
import Core, { types } from "../core/index.js";

export default class ExampleModule {
  // reference to Core instance, set by Core on load
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

  private mention!: string;

  public async load(ctx: Core): Promise<void> {
    // How bot's mention looks like
    this.mention = `<@${ctx.getSelfId()}>`;
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
Note that all modules are loaded from `modules` directory.

# Default modules
- `egg` - Reacting to message containing eggs, and soon to images too! (Why? Idk)
- `pong` - Simple ping pong module
- `chatgpt` - Chatbot using GPT-3, responds to messages that start with mention
- `bridge` - Used for copying attachments from multiple channels to one specified channel using webhooks
- `math` - Simple math module that can evaluate simple math expressions
- `permissions` - Permissions management module, used for managing permissions for other modules
- `presence` - Animated rich presence module, used to disaply rich presence on bot's profile

# Dependencies
- [chatgpt 2.0.5](https://github.com/transitive-bullshit/chatgpt-api)
- [decimal.js 10.4.2](https://github.com/MikeMcl/decimal.js)
- [dotenv 16.0.3](https://github.com/motdotla/dotenv)
- [node-fetch 3.3.0](https://github.com/node-fetch/node-fetch)
- [pg 8.8.0](https://github.com/brianc/node-postgres)
- [ws 8.9.0](https://github.com/websockets/ws)
- [zeromq 6.0.0-beta.16](https://github.com/zeromq/zeromq.js)
- [typescript 4.8.4](https://github.com/Microsoft/TypeScript)
- [node 19.x](https://github.com/nodejs/node)

# Future plans
My goal was to create something like environment for module based selfbot. Over time maybe I will add more modules and features like client like data manager. I'll maintain this project as long as I can but discord likes to change api in a rather strange way. As long as I can, I'll try to keep this project up to date.


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