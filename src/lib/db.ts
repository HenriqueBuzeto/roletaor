import { neon } from "@neondatabase/serverless";

export const getDb = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(databaseUrl);
};

export async function initDb() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS wheel_prizes (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      probability NUMERIC(5, 2) DEFAULT NULL,
      color VARCHAR(32) DEFAULT NULL,
      created_at BIGINT NOT NULL
    );
  `;
}
