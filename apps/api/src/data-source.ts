import "reflect-metadata";
import { DataSource } from "typeorm";
import { EmailVerificationToken, Session, Task, User } from "./entities";

export default new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL || "postgres://foundry:foundry@localhost:5432/foundry",
  entities: [User, Session, EmailVerificationToken, Task],
  migrations: ["src/migrations/*.ts"],
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});
