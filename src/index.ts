import Core from "./core/core";
import { config } from "dotenv";
config();

if (!process.env.TOKEN) throw new Error("No token provided");
new Core(process.env.TOKEN!);
