import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { createHash } from "crypto";
import { Repository } from "typeorm";
import { Session, User } from "./entities";
import { IS_PUBLIC_KEY } from "./public";

export interface AuthenticatedRequest { user: User; session: Session; headers: Record<string, string | undefined>; }

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()])) return true;
    const req = ctx.switchToHttp().getRequest<any>();
    const header = String(req.headers.authorization || "");
    if (!header.startsWith("Bearer ")) throw new UnauthorizedException("Missing session token");
    const raw = header.slice(7);
    const tokenHash = createHash("sha256").update(raw).digest("hex");
    const session = await this.sessions.findOne({ where: { tokenHash } });
    if (!session || session.revokedAt || session.expiresAt <= new Date()) throw new UnauthorizedException("Session expired or revoked");
    const user = await this.users.findOneBy({ id: session.userId });
    if (!user) throw new UnauthorizedException("User not found");
    req.user = user;
    req.session = session;
    return true;
  }
}
