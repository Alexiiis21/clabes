import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  clabe: text("clabe").notNull(),
  bank: text("bank"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
