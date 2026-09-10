import "reflect-metadata";
import { DataSource } from "typeorm";
import { AuditLog, EmailVerificationToken, Membership, Organization, OrganizationEntitlement, OrganizationInvitation, PasswordResetToken, Session, Task, User } from "./entities";

export default new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL || "postgres://foundry:foundry@localhost:5432/foundry",
  entities: [User, Organization, Membership, OrganizationInvitation, OrganizationEntitlement, Session, EmailVerificationToken, PasswordResetToken, AuditLog, Task],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});
