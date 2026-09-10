import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminController } from "./admin.controller";
import { AuditService } from "./audit.service";
import { AuthController } from "./auth.controller";
import { SessionAuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { EmailService } from "./email.service";
import { AuditLog, EmailVerificationToken, Membership, Organization, OrganizationEntitlement, OrganizationInvitation, PasswordResetToken, Session, Task, User } from "./entities";
import { HealthController } from "./health.controller";
import { InvitationsController, OrganizationsController } from "./organizations.controller";
import { OrganizationsService } from "./organizations.service";
import { RolesGuard } from "./roles.guard";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { UsersController } from "./users.controller";

const entities=[User,Organization,Membership,OrganizationInvitation,OrganizationEntitlement,Session,EmailVerificationToken,PasswordResetToken,AuditLog,Task];

@Module({
  imports:[ThrottlerModule.forRoot([{ttl:60_000,limit:120}]),TypeOrmModule.forRoot({type:"postgres",url:process.env.DATABASE_URL||"postgres://foundry:foundry@localhost:5432/foundry",entities,synchronize:process.env.DB_SYNCHRONIZE==="true"||process.env.NODE_ENV!=="production",ssl:process.env.DATABASE_SSL==="true"?{rejectUnauthorized:false}:false}),TypeOrmModule.forFeature(entities)],
  controllers:[HealthController,AuthController,OrganizationsController,InvitationsController,TasksController,UsersController,AdminController],
  providers:[OrganizationsService,AuthService,TasksService,EmailService,AuditService,{provide:APP_GUARD,useClass:ThrottlerGuard},{provide:APP_GUARD,useClass:SessionAuthGuard},{provide:APP_GUARD,useClass:RolesGuard}],
})
export class AppModule{}
