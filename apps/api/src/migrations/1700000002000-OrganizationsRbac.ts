import { MigrationInterface, QueryRunner } from "typeorm";

export class OrganizationsRbac1700000002000 implements MigrationInterface {
  name = "OrganizationsRbac1700000002000";

  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TYPE "membership_role_enum" AS ENUM ('owner','admin','member')`);
    await q.query(`CREATE TABLE "organizations" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "slug" varchar(100) NOT NULL, "name" varchar(160) NOT NULL, "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(), CONSTRAINT "UQ_organizations_slug" UNIQUE ("slug"), CONSTRAINT "PK_organizations" PRIMARY KEY ("id"))`);
    await q.query(`CREATE TABLE "memberships" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "organization_id" uuid NOT NULL, "user_id" uuid NOT NULL, "role" "membership_role_enum" NOT NULL DEFAULT 'member', "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(), CONSTRAINT "UQ_membership_org_user" UNIQUE ("organization_id","user_id"), CONSTRAINT "PK_memberships" PRIMARY KEY ("id"), CONSTRAINT "FK_membership_org" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE, CONSTRAINT "FK_membership_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE)`);
    await q.query(`CREATE TABLE "organization_invitations" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "organization_id" uuid NOT NULL, "email" varchar NOT NULL, "role" "membership_role_enum" NOT NULL, "token_hash" varchar NOT NULL, "invited_by_user_id" uuid, "expires_at" TIMESTAMPTZ NOT NULL, "accepted_at" TIMESTAMPTZ, "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(), CONSTRAINT "UQ_org_invitation_token" UNIQUE ("token_hash"), CONSTRAINT "PK_org_invitations" PRIMARY KEY ("id"), CONSTRAINT "FK_invitation_org" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE, CONSTRAINT "FK_invitation_actor" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL)`);
    await q.query(`CREATE TABLE "organization_entitlements" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "organization_id" uuid NOT NULL, "plan_code" varchar(40) NOT NULL DEFAULT 'free', "max_members" int NOT NULL DEFAULT 3, "features" jsonb NOT NULL DEFAULT '{"audit":false,"apiKeys":false}'::jsonb, "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(), CONSTRAINT "UQ_entitlement_org" UNIQUE ("organization_id"), CONSTRAINT "PK_org_entitlements" PRIMARY KEY ("id"), CONSTRAINT "FK_entitlement_org" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE)`);

    await q.query(`INSERT INTO "organizations" ("id","slug","name") SELECT "id", 'personal-' || replace("id"::text,'-',''), split_part("email",'@',1) || '''s Workspace' FROM "users" ON CONFLICT DO NOTHING`);
    await q.query(`INSERT INTO "memberships" ("organization_id","user_id","role") SELECT "id","id",'owner'::"membership_role_enum" FROM "users" ON CONFLICT DO NOTHING`);
    await q.query(`INSERT INTO "organization_entitlements" ("organization_id","plan_code","max_members","features") SELECT "id",'free',3,'{"audit":false,"apiKeys":false}'::jsonb FROM "users" ON CONFLICT DO NOTHING`);

    await q.query(`ALTER TABLE "tasks" ADD "organization_id" uuid`);
    await q.query(`UPDATE "tasks" SET "organization_id" = "user_id" WHERE "organization_id" IS NULL`);
    await q.query(`ALTER TABLE "tasks" ALTER COLUMN "organization_id" SET NOT NULL`);
    await q.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_org" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE`);
    await q.query(`CREATE INDEX "IDX_tasks_org" ON "tasks" ("organization_id")`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX "IDX_tasks_org"`);
    await q.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_org"`);
    await q.query(`ALTER TABLE "tasks" DROP COLUMN "organization_id"`);
    await q.query(`DROP TABLE "organization_entitlements"`);
    await q.query(`DROP TABLE "organization_invitations"`);
    await q.query(`DROP TABLE "memberships"`);
    await q.query(`DROP TABLE "organizations"`);
    await q.query(`DROP TYPE "membership_role_enum"`);
  }
}
