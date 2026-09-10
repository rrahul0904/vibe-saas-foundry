import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { compare, hash } from "bcryptjs";
import { IsNull, Repository } from "typeorm";
import { AuditService } from "./audit.service";
import { EmailService } from "./email.service";
import { EmailVerificationToken, PasswordResetToken, Session, User, UserRole } from "./entities";
import { hashToken, isBootstrapOperator, newOpaqueToken, normalizeEmail } from "./security";

const safeUser = (u: User) => ({
  id: u.id,
  email: u.email,
  role: u.role,
  emailVerifiedAt: u.emailVerifiedAt?.toISOString() ?? null,
  createdAt: u.createdAt.toISOString(),
});

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
    @InjectRepository(EmailVerificationToken) private readonly verificationTokens: Repository<EmailVerificationToken>,
    @InjectRepository(PasswordResetToken) private readonly resetTokens: Repository<PasswordResetToken>,
    private readonly email: EmailService,
    private readonly audit: AuditService,
  ) {}

  async register(emailRaw: string, password: string) {
    const email = normalizeEmail(emailRaw);
    if (await this.users.findOneBy({ email })) throw new BadRequestException("Account already exists");
    const role = isBootstrapOperator(email) ? UserRole.OPERATOR : UserRole.MEMBER;
    const user = await this.users.save(this.users.create({ email, passwordHash: await hash(password, 12), role, emailVerifiedAt: null }));
    const raw = await this.issueVerification(user);
    await this.audit.record("auth.register", user.id, { role });
    await this.email.sendVerification(email, raw);
    return { user: safeUser(user), message: "Verification sent", ...(process.env.NODE_ENV === "production" ? {} : { verificationToken: raw }) };
  }

  async resendVerification(emailRaw: string) {
    const email = normalizeEmail(emailRaw);
    const user = await this.users.findOneBy({ email });
    if (user && !user.emailVerifiedAt) {
      const raw = await this.issueVerification(user);
      await this.audit.record("auth.verification_resent", user.id);
      await this.email.sendVerification(email, raw);
      return { ok: true, message: "If the account needs verification, a new link was sent", ...(process.env.NODE_ENV === "production" ? {} : { verificationToken: raw }) };
    }
    return { ok: true, message: "If the account needs verification, a new link was sent" };
  }

  async verifyEmail(raw: string) {
    const record = await this.verificationTokens.findOne({ where: { tokenHash: hashToken(raw), usedAt: IsNull() } });
    if (!record || record.expiresAt <= new Date()) throw new BadRequestException("Verification token is invalid or expired");
    const user = await this.users.findOneByOrFail({ id: record.userId });
    user.emailVerifiedAt = new Date();
    record.usedAt = new Date();
    await Promise.all([this.users.save(user), this.verificationTokens.save(record)]);
    await this.audit.record("auth.email_verified", user.id);
    return { ok: true };
  }

  async login(emailRaw: string, password: string) {
    const email = normalizeEmail(emailRaw);
    const user = await this.users.findOneBy({ email });
    if (!user || !(await compare(password, user.passwordHash))) throw new UnauthorizedException("Invalid email or password");
    if (!user.emailVerifiedAt) throw new UnauthorizedException("Verify your email before signing in");

    if (isBootstrapOperator(user.email) && user.role !== UserRole.OPERATOR) {
      user.role = UserRole.OPERATOR;
      await this.users.save(user);
      await this.audit.record("auth.operator_bootstrapped", user.id);
    }

    const raw = newOpaqueToken(36);
    const ttl = Number(process.env.SESSION_TTL_HOURS || 168);
    await this.sessions.save(this.sessions.create({ userId: user.id, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + ttl * 3600_000), revokedAt: null }));
    await this.audit.record("auth.login", user.id);
    return { sessionToken: raw, user: safeUser(user) };
  }

  async requestPasswordReset(emailRaw: string) {
    const email = normalizeEmail(emailRaw);
    const user = await this.users.findOneBy({ email });
    if (user) {
      const raw = newOpaqueToken();
      await this.resetTokens.save(this.resetTokens.create({ userId: user.id, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + 60 * 60_000), usedAt: null }));
      await this.audit.record("auth.password_reset_requested", user.id);
      await this.email.sendPasswordReset(email, raw);
      return { ok: true, message: "If that account exists, a reset link was sent", ...(process.env.NODE_ENV === "production" ? {} : { resetToken: raw }) };
    }
    return { ok: true, message: "If that account exists, a reset link was sent" };
  }

  async resetPassword(raw: string, password: string) {
    const record = await this.resetTokens.findOne({ where: { tokenHash: hashToken(raw), usedAt: IsNull() } });
    if (!record || record.expiresAt <= new Date()) throw new BadRequestException("Reset token is invalid or expired");
    const user = await this.users.findOneByOrFail({ id: record.userId });
    user.passwordHash = await hash(password, 12);
    record.usedAt = new Date();
    await Promise.all([this.users.save(user), this.resetTokens.save(record)]);
    await this.logoutAll(user.id, false);
    await this.audit.record("auth.password_reset_completed", user.id);
    return { ok: true };
  }

  async logout(sessionId: string, userId: string) {
    await this.sessions.update(sessionId, { revokedAt: new Date() });
    await this.audit.record("auth.logout", userId);
    return { ok: true };
  }

  async logoutAll(userId: string, writeAudit = true) {
    await this.sessions.createQueryBuilder().update().set({ revokedAt: new Date() }).where("user_id = :userId AND revoked_at IS NULL", { userId }).execute();
    if (writeAudit) await this.audit.record("auth.logout_all", userId);
    return { ok: true };
  }

  private async issueVerification(user: User) {
    const raw = newOpaqueToken();
    await this.verificationTokens.save(this.verificationTokens.create({ userId: user.id, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + 24 * 3600_000), usedAt: null }));
    return raw;
  }
}
