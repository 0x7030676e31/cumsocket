# Cumsocket v2
Cumsocket is a "simple" Discord module based selfbot written in TypeScript that has features such as permissions management, Discord api, and more. Also worth mentioning is fact that selfbots are against Discord's ToS and can get you banned, this selfbot is not doing anything harmful to Discord's servers, but it's still against the ToS. I'm not recommending using selfbots but sometimes it's just fun to have one.


# Features
- Websocket handling
- Rich permissions management
- Discord API wrapper
- Module flexibility
- Database support
- Almost undetectable
- Rate limit handling
- Client like data handling (soon)

# Installation
1. Clone the repository `git clone https://github.com/0x7030676e31/cumsocket`
2. Install dependencies `npm install`
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
  public async onMessageCreate(data: types.MessageCreate): Promise<void> {
    ctx.log("example", "Message created!");
  }
}
```
Note that all modules are loaded from `modules` directory.

# Default modules
- `egg` - Csed as "ping" command, reacting to message containing eggs
- `chatgpt` - Chatbot using GPT-3, responds to messages that start with mention
- `bridge` - Used for copying attachments from multiple channels to one specified channel using webhooks
- `math` - Simple math module that can evaluate simple math expressions
- `permissions` - Permissions management module, used for managing permissions for other modules

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