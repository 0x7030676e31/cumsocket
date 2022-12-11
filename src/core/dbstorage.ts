import Core from "./index.js";

export default class DBStorage {
  private ctx!: Core;
  private local: Map<string, string> = new Map();
  
  constructor(ctx: Core) {
    this.ctx = ctx;
  }

  // load database entries into local cache
  public async loadDB(): Promise<void> {
    await this.ctx.dbQuery("CREATE TABLE IF NOT EXISTS storage (key TEXT PRIMARY KEY, value TEXT);");
    const res = (await this.ctx.dbQuery("SELECT * FROM storage;"))!.rows as [{ key: string, value: string }];
    res.forEach(v => this.local.set(v.key, v.value));
    this.ctx.log("DBStorage", `Loaded ${res.length} entries from the database.`);
  }

  public get(key: string): string | null {
    // get from local cache
    return this.local.get(key) ?? null;
  }

  public async set(key: string, value: string): Promise<void> {
    // update database
    if (this.local.has(key)) this.ctx.dbQuery("UPDATE storage SET value = '$1' WHERE key = '$2';", value, key);
    else this.ctx.dbQuery("INSERT INTO storage (key, value) VALUES ('$1', '$2');", key, value);

    // update local cache
    this.local.set(key, value);
  }

  public async setIfNotExists(key: string, value: string): Promise<void> {
    if (!this.local.has(key)) await this.set(key, value);
  }

  public async setIfDiff(key: string, value: string): Promise<void> {
    if (this.local.get(key) !== value) await this.set(key, value);
  }

  public has(key: string): boolean {
    return this.local.has(key);
  }

  public async delete(key: string): Promise<void> {
    // update database
    this.ctx.dbQuery("DELETE FROM storage WHERE key = '$1';", key);

    // update local cache
    this.local.delete(key);
  }
}