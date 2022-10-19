import Core from "./core/core";
import { config } from "dotenv";
config();

if (!process.env.token) throw new Error("No token provided");
new Core(process.env.token!);

