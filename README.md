### With dedication to @defun noreturn, thanks to you I am where I am

# Cumsocket
Cumsocket is a "simple" Discord module based selfbot written in TypeScript that has features such as permissions management, Discord api, and more. It's currently in development and is not ready for deployment. Also worth mentioning is fact that selfbots are against Discord's ToS and can get you banned, this selfbot is not doing anything harmful to Discord's servers, but it's still against the ToS. I'm not recommending using selfbots but sometimes it's just fun to have one.

# Features
- Websocket handling
- Discord api
- Rich permissions management
- Module flexibility
- Database support
- Almost undetectable
- Rate limit handling

# Usage
If you really want to use this bot, follow these steps:
- Clone the repository
- (Optional) remove README.md, Procfile, .gitignore and docs folder - they are not necessary
- Install dependencies with `npm install`
- Create .env file with `TOKEN` and `DATABASE_URL` variables and provide env variables required by the modules
- Run the bot with `npm start`
- Enjoy!

# Custom modules
To create your own module:
- Create .ts file inside modules directory
- Create class with public properties `id` as `string`, `ctx` as `Core`
- Optionally you can add `env` as `string[]`, `ignore` as `boolean` and `async init` method with `(ctx: Core)` as parameter
- To register listener, use decorator `Core.listen("EVENT_NAME")` with `(data: any)` as parameter

## Example module
```ts
import { Core } from "../core";

// Class have to be exported
export default class MyModule {
  public readonly ctx!: Core;
  public readonly id = "myModule";

  // Those are env variables required by the module, program will throw error if they are not provided
  public readonly env = ["MY_ENV_VARIABLE"];

  // To ignore module, set ignore to true
  // public readonly ignore = true;

  // This method will be called when module is loaded
  public async init(ctx: Core) {
    ctx.log("MyModule", "Module loaded!");
  }

  // On MESSAGE_CREATE event
  @Core.listen("MESSAGE_CREATE")
  public onMessageCreate(data: any) {
    // Do something
  }
}
```

# Default modules
- `reminder` - send reminder to user after specified time. [See more](docs/reminders.md)
- `permissions` - permissions management system. [See more](docs/permissions.md)
- `bridge` - copy attachments from one channel to another.
- `math` - basic math calculator. [See more](docs/math.md)
- `egg` - egg of course.


## Still TODO:
- Grow the api
- Clean up the code
- Presence management (maybe)
- Client like events management system
- Create a better README.md
- And more!



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

