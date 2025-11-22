import { sql } from "drizzle-orm";
import { sqliteTable, text, uniqueIndex, integer, numeric } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer().primaryKey({ autoIncrement: true }),
  user: text().notNull(),
  metadataPieceCID: text(),
  tgLastLangCode: text(),
  walletAddress: text(),
  created: integer().notNull().default(sql`(UNIXEPOCH() * 1000)`),
  updated: integer().$onUpdate(() => sql`(UNIXEPOCH() * 1000)`),
  deleted: integer(),
}, (table) => ({
  userIdx: uniqueIndex("users_user_idx").on(table.user),
}));