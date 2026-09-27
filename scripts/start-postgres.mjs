import EmbeddedPostgres from "embedded-postgres";
import path from "node:path";

const pg = new EmbeddedPostgres({
  databaseDir: path.resolve("data/postgres"),
  user: "postgres",
  password: "postgres",
  port: 5432,
  persistent: true,
});

await pg.initialise();
await pg.start();
try {
  await pg.createDatabase("server_monitor");
} catch (error) {
  if (!String(error).toLowerCase().includes("already exists")) throw error;
}
console.log("SERVER MONITOR PostgreSQL is running on port 5432.");
console.log("Database: server_monitor");
const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1 << 30);
