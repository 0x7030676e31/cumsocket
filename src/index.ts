import { config } from "dotenv";
import Core from "./core";

config();
if (!process.env.TOKEN) throw new Error("Cannot find 'TOKEN' in .env file.");

new Core();