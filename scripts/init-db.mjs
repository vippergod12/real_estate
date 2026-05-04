import { Pool } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[init-db] Missing DATABASE_URL. Please set it in .env");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });

const schemaPath = resolve(__dirname, "..", "db", "schema.sql");
const raw = readFileSync(schemaPath, "utf8");

console.log("[init-db] Running schema.sql...");

try {
  await pool.query(raw);
  console.log("[init-db] Done. Schema is ready.");
} catch (err) {
  console.error("[init-db] Failed:\n", err);
  process.exit(1);
} finally {
  await pool.end();
}
