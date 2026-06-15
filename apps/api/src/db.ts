import pg from "pg";

const { Pool } = pg;

export const databaseUrl = process.env.DATABASE_URL?.trim() || "";
export const hasDatabase = Boolean(databaseUrl);

export const pool = hasDatabase
  ? new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    })
  : ({
      query: async () => {
        throw new Error("DATABASE_URL is not configured");
      },
      connect: async () => {
        throw new Error("DATABASE_URL is not configured");
      },
      end: async () => undefined
    } as unknown as pg.Pool);

export function requirePool() {
  if (!hasDatabase) {
    throw new Error("DATABASE_URL is not configured");
  }
  return pool;
}
