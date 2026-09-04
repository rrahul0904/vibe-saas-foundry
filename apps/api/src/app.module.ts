import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminController } from "./admin.controller";
import { AuthController } from "./auth.controller";
import { SessionAuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { EmailVerificationToken, Session, Task, User } from "./entities";
import { HealthController } from "./health.controller";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { UsersController } from "./users.controller";

@Module({
  imports:[
    TypeOrmModule.forRoot({
      type:"postgres",
      url:process.env.DATABASE_URL || "postgres://foundry:foundry@localhost:5432/foundry",
      entities:[User,Session,EmailVerificationToken,Task],
      synchronize:process.env.DB_SYNCHRONIZE === "true" || process.env.NODE_ENV !== "production",
      ssl:process.env.DATABASE_SSL === "true" ? {rejectUnauthorized:false} : false,
    }),
    TypeOrmModule.forFeature([User,Session,EmailVerificationToken,Task]),
  ],
  controllers:[HealthController,AuthController,TasksController,UsersController,AdminController],
  providers:[AuthService,TasksService,{provide:APP_GUARD,useClass:SessionAuthGuard}],
})
export class AppModule {}
