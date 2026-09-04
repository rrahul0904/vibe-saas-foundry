import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { compare, hash } from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { IsNull, Repository } from "typeorm";
import { EmailVerificationToken, Session, User } from "./entities";

const hashToken = (value: string) => createHash("sha256").update(value).digest("hex");
const safeUser = (u: User) => ({ id:u.id, email:u.email, emailVerifiedAt:u.emailVerifiedAt?.toISOString() ?? null, createdAt:u.createdAt.toISOString() });

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
    @InjectRepository(EmailVerificationToken) private readonly verificationTokens: Repository<EmailVerificationToken>,
  ) {}

  async register(emailRaw: string, password: string) {
    const email = emailRaw.trim().toLowerCase();
    if (await this.users.findOneBy({ email })) throw new BadRequestException("Account already exists");
    const user = this.users.create({ email, passwordHash: await hash(password, 12), emailVerifiedAt: null });
    await this.users.save(user);
    const raw = randomBytes(32).toString("base64url");
    await this.verificationTokens.save(this.verificationTokens.create({ userId:user.id, tokenHash:hashToken(raw), expiresAt:new Date(Date.now()+24*3600_000), usedAt:null }));
    return { user: safeUser(user), message: "Verification created", ...(process.env.NODE_ENV === "production" ? {} : { verificationToken: raw }) };
  }

  async verifyEmail(raw: string) {
    const record = await this.verificationTokens.findOne({ where: { tokenHash: hashToken(raw), usedAt: IsNull() } });
    if (!record || record.expiresAt <= new Date()) throw new BadRequestException("Verification token is invalid or expired");
    const user = await this.users.findOneByOrFail({ id: record.userId });
    user.emailVerifiedAt = new Date();
    record.usedAt = new Date();
    await Promise.all([this.users.save(user), this.verificationTokens.save(record)]);
    return { ok:true };
  }

  async login(emailRaw: string, password: string) {
    const email = emailRaw.trim().toLowerCase();
    const user = await this.users.findOneBy({ email });
    if (!user || !(await compare(password, user.passwordHash))) throw new UnauthorizedException("Invalid email or password");
    if (!user.emailVerifiedAt) throw new UnauthorizedException("Verify your email before signing in");
    const raw = randomBytes(36).toString("base64url");
    const ttl = Number(process.env.SESSION_TTL_HOURS || 168);
    await this.sessions.save(this.sessions.create({ userId:user.id, tokenHash:hashToken(raw), expiresAt:new Date(Date.now()+ttl*3600_000), revokedAt:null }));
    return { sessionToken:raw, user:safeUser(user) };
  }

  async logout(sessionId: string) {
    await this.sessions.update(sessionId, { revokedAt:new Date() });
    return { ok:true };
  }
  async logoutAll(userId: string) {
    await this.sessions.createQueryBuilder().update().set({ revokedAt:new Date() }).where("user_id = :userId AND revoked_at IS NULL", { userId }).execute();
    return { ok:true };
  }
}
