import pg from "pg";

export default class DataBase {
  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("Cannot connect to database: DATABASE_URL is not set");
  }
}