import Core from "./core";
import { config } from "dotenv";
config();

if (!process.env.TOKEN) throw new Error("No token provided");
new Core(process.env.TOKEN!);
