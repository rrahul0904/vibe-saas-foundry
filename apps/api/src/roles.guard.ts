import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthenticatedRequest } from "./auth.guard";
import { UserRole } from "./entities";
import { ROLES_KEY } from "./roles";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(ctx: ExecutionContext) {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!required?.length) return true;
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req.user || !required.includes(req.user.role)) throw new ForbiddenException("Insufficient role");
    return true;
  }
}
