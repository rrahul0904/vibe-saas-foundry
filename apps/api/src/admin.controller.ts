import { Controller, Get } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditLog, Session, Task, User, UserRole } from "./entities";
import { Roles } from "./roles";

@Roles(UserRole.OPERATOR)
@Controller("admin")
export class AdminController {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
    @InjectRepository(AuditLog) private readonly audits: Repository<AuditLog>,
  ) {}

  @Get("metrics") async metrics() {
    const [users, tasks, sessions, auditEvents] = await Promise.all([this.users.count(), this.tasks.count(), this.sessions.count(), this.audits.count()]);
    return { users, tasks, sessions, auditEvents };
  }

  @Get("users") async recent() {
    const users = await this.users.find({ order: { createdAt: "DESC" }, take: 50 });
    return users.map(u => ({ id: u.id, email: u.email, role: u.role, verified: Boolean(u.emailVerifiedAt), createdAt: u.createdAt }));
  }

  @Get("audit") async audit() {
    return this.audits.find({ order: { createdAt: "DESC" }, take: 100 });
  }
}
