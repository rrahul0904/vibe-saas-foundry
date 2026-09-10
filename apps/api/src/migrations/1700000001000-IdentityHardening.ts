import { MigrationInterface, QueryRunner } from "typeorm";

export class IdentityHardening1700000001000 implements MigrationInterface {
  name = "IdentityHardening1700000001000";

  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TYPE "user_role_enum" AS ENUM ('member','operator')`);
    await q.query(`ALTER TABLE "users" ADD "role" "user_role_enum" NOT NULL DEFAULT 'member'`);
    await q.query(`CREATE TABLE "password_reset_tokens" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "user_id" uuid NOT NULL, "token_hash" varchar NOT NULL, "expires_at" TIMESTAMPTZ NOT NULL, "used_at" TIMESTAMPTZ, "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(), CONSTRAINT "UQ_password_reset_token" UNIQUE ("token_hash"), CONSTRAINT "PK_password_reset" PRIMARY KEY ("id"), CONSTRAINT "FK_password_reset_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE)`);
    await q.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "actor_user_id" uuid, "action" varchar(120) NOT NULL, "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb, "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(), CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id"))`);
    await q.query(`CREATE INDEX "IDX_audit_logs_actor" ON "audit_logs" ("actor_user_id")`);
    await q.query(`CREATE INDEX "IDX_audit_logs_created" ON "audit_logs" ("created_at")`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX "IDX_audit_logs_created"`);
    await q.query(`DROP INDEX "IDX_audit_logs_actor"`);
    await q.query(`DROP TABLE "audit_logs"`);
    await q.query(`DROP TABLE "password_reset_tokens"`);
    await q.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    await q.query(`DROP TYPE "user_role_enum"`);
  }
}
