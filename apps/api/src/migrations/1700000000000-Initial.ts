import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1700000000000 implements MigrationInterface {
  name = "Initial1700000000000";
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TYPE "task_status_enum" AS ENUM ('pending','in_progress','done')`);
    await q.query(`CREATE TYPE "task_priority_enum" AS ENUM ('low','medium','high')`);
    await q.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "email" varchar NOT NULL, "password_hash" varchar NOT NULL, "email_verified_at" TIMESTAMPTZ, "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(), CONSTRAINT "UQ_users_email" UNIQUE ("email"), CONSTRAINT "PK_users" PRIMARY KEY ("id"))`);
    await q.query(`CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "user_id" uuid NOT NULL, "token_hash" varchar NOT NULL, "expires_at" TIMESTAMPTZ NOT NULL, "revoked_at" TIMESTAMPTZ, "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(), CONSTRAINT "UQ_sessions_token" UNIQUE ("token_hash"), CONSTRAINT "PK_sessions" PRIMARY KEY ("id"), CONSTRAINT "FK_sessions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE)`);
    await q.query(`CREATE TABLE "email_verification_tokens" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "user_id" uuid NOT NULL, "token_hash" varchar NOT NULL, "expires_at" TIMESTAMPTZ NOT NULL, "used_at" TIMESTAMPTZ, "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(), CONSTRAINT "UQ_verify_token" UNIQUE ("token_hash"), CONSTRAINT "PK_verify" PRIMARY KEY ("id"), CONSTRAINT "FK_verify_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE)`);
    await q.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "user_id" uuid NOT NULL, "title" varchar(240) NOT NULL, "description" text, "status" "task_status_enum" NOT NULL DEFAULT 'pending', "priority" "task_priority_enum" NOT NULL DEFAULT 'medium', "due_date" TIMESTAMPTZ, "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(), CONSTRAINT "PK_tasks" PRIMARY KEY ("id"), CONSTRAINT "FK_tasks_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE)`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE "tasks"`); await q.query(`DROP TABLE "email_verification_tokens"`); await q.query(`DROP TABLE "sessions"`); await q.query(`DROP TABLE "users"`); await q.query(`DROP TYPE "task_priority_enum"`); await q.query(`DROP TYPE "task_status_enum"`);
  }
}
