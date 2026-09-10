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
import { AuditLog, EmailVerificationToken, PasswordResetToken, Session, Task, User } from "./entities";
import { HealthController } from "./health.controller";
import { RolesGuard } from "./roles.guard";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { UsersController } from "./users.controller";

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DATABASE_URL || "postgres://foundry:foundry@localhost:5432/foundry",
      entities: [User, Session, EmailVerificationToken, PasswordResetToken, AuditLog, Task],
      synchronize: process.env.DB_SYNCHRONIZE === "true" || process.env.NODE_ENV !== "production",
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
    }),
    TypeOrmModule.forFeature([User, Session, EmailVerificationToken, PasswordResetToken, AuditLog, Task]),
  ],
  controllers: [HealthController, AuthController, TasksController, UsersController, AdminController],
  providers: [
    AuthService,
    TasksService,
    EmailService,
    AuditService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: SessionAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
