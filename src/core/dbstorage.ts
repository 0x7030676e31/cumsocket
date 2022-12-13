import Core from "./index.js";

export default class DBStorage {
  private ctx!: Core;
  private local: Map<string, string> = new Map();
  
  constructor(ctx: Core) {
    this.ctx = ctx;
  }

  // Load database entries into local cache
  public async loadDB(): Promise<void> {
    await this.ctx.dbQuery("CREATE TABLE IF NOT EXISTS storage (key TEXT PRIMARY KEY, value TEXT);");
    const res = (await this.ctx.dbQuery("SELECT * FROM storage;"))!.rows as [{ key: string, value: string }];
    res.forEach(v => this.local.set(v.key, v.value));
    this.ctx.log("DBStorage", `Loaded ${res.length} entries from the database.`);
  }

  // Get a value from the local cache
  public get(key: string): string | null {
    return this.local.get(key) ?? null;
  }

  // Set a value in the local cache and database
  public async set(key: string, value: string): Promise<void> {
    // Update database
    if (this.local.has(key)) this.ctx.dbQuery("UPDATE storage SET value = '$1' WHERE key = '$2';", value, key);
    else this.ctx.dbQuery("INSERT INTO storage (key, value) VALUES ('$1', '$2');", key, value);

    // Update local cache
    this.local.set(key, value);
  }

  // Set a value in the local cache and database if it doesn't exist
  public async setIfNotExists(key: string, value: string): Promise<void> {
    if (!this.local.has(key)) await this.set(key, value);
  }

  // Set a value in the local cache and database if it's different
  public async setIfDiff(key: string, value: string): Promise<void> {
    if (this.local.get(key) !== value) await this.set(key, value);
  }

  // Check if a key exists in the local cache
  public has(key: string): boolean {
    return this.local.has(key);
  }

  // Delete a key from the local cache and database
  public async delete(key: string): Promise<void> {
    // Update database
    this.ctx.dbQuery("DELETE FROM storage WHERE key = '$1';", key);

    // Update local cache
    this.local.delete(key);
  }


  // Numeric operations

  // Add a value to a numeric value
  public async numericIncr(key: string, value: number = 1): Promise<number> {
    const raw = this.local.get(key);
    if (raw === undefined || Number.isNaN(raw)) throw new Error(`Storage Error: Cannot increment non-numeric value '${key}'`);
    const num = Number(raw) + value;
    await this.set(key, num.toString());
    return num;
  }

  // Subtract a value from a numeric value
  public async numericDecr(key: string, value: number = 1): Promise<number> {
    const raw = this.local.get(key);
    if (raw === undefined || Number.isNaN(raw)) throw new Error(`Storage Error: Cannot decrement non-numeric value '${key}'`);
    const num = Number(raw) - value;
    await this.set(key, num.toString());
    return num;
  }

  // Get a numeric value
  public numericGet(key: string): number {
    const raw = this.local.get(key);
    if (raw === undefined || Number.isNaN(raw)) throw new Error(`Storage Error: Cannot get non-numeric value '${key}'`);
    return Number(raw);
  }

  // Set a numeric value
  public async numericSet(key: string, value: number): Promise<void> {
    await this.set(key, value.toString());
  }


  // Boolean operations

  // Set a boolean value to true
  public async booleanSetTrue(key: string): Promise<void> {
    await this.set(key, "true");
  }

  // Set a boolean value to false
  public async booleanSetFalse(key: string): Promise<void> {
    await this.set(key, "false");
  }

  // Toggle a boolean value
  public async booleanToggle(key: string): Promise<boolean> {
    const raw = this.local.get(key)?.toLowerCase();
    if (raw === undefined || !/^(true|false)$/.test(raw)) throw new Error(`Storage Error: Cannot toggle non-boolean value '${key}'`);
    const bool = raw === "true" ? false : true;
    await this.set(key, bool.toString());
    return bool;
  }

  // Set a boolean value
  public async booleanSet(key: string, value: boolean): Promise<void> {
    await this.set(key, value.toString());
  }

  // Get a boolean value
  public booleanGet(key: string): boolean {
    const raw = this.local.get(key)?.toLowerCase();
    if (raw === undefined || !/^(true|false)$/.test(raw)) throw new Error(`Storage Error: Cannot get non-boolean value '${key}'`);
    return raw === "true" ? true : false;
  }

  // Check if a boolean value is true
  public booleanIsTrue(key: string): boolean {
    const raw = this.local.get(key)?.toLowerCase();
    if (raw === undefined || !/^(true|false)$/.test(raw)) throw new Error(`Storage Error: Cannot check non-boolean value '${key}'`);
    return raw === "true" ? true : false;
  }


  // String operations

  // Append a string to a string value
  public async stringAppend(key: string, value: string): Promise<string> {
    const raw = this.local.get(key);
    if (raw === undefined) throw new Error(`Storage Error: Cannot append to non-string value '${key}'`);
    const str = raw + value;
    await this.set(key, str);
    return str;
  }

  // Prepend a string to a string value
  public async stringPrepend(key: string, value: string): Promise<string> {
    const raw = this.local.get(key);
    if (raw === undefined) throw new Error(`Storage Error: Cannot prepend to non-string value '${key}'`);
    const str = value + raw;
    await this.set(key, str);
    return str;
  }
}