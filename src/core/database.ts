import { Client, QueryResult } from "pg";

export default class DataBase {
  private readonly _client!: Client;

  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("Cannot connect to database: DATABASE_URL is not set");

    this._client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
    this._client.connect();
  }

  public async query(query: string): Promise<QueryResult<any>> {
    return await this._client.query(query);
  }
}