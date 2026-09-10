import { Body, Controller, Post, Req } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { IsEmail, IsString, MinLength } from "class-validator";
import { AuthenticatedRequest } from "./auth.guard";
import { AuthService } from "./auth.service";
import { Public } from "./public";

class CredentialsDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
}
class EmailDto { @IsEmail() email!: string; }
class VerifyDto { @IsString() token!: string; }
class ResetPasswordDto {
  @IsString() token!: string;
  @IsString() @MinLength(8) password!: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public() @Throttle({ default: { limit: 5, ttl: 60_000 } }) @Post("register")
  register(@Body() dto: CredentialsDto) { return this.auth.register(dto.email, dto.password); }

  @Public() @Throttle({ default: { limit: 5, ttl: 60_000 } }) @Post("resend-verification")
  resendVerification(@Body() dto: EmailDto) { return this.auth.resendVerification(dto.email); }

  @Public() @Throttle({ default: { limit: 10, ttl: 60_000 } }) @Post("verify-email")
  verify(@Body() dto: VerifyDto) { return this.auth.verifyEmail(dto.token); }

  @Public() @Throttle({ default: { limit: 5, ttl: 60_000 } }) @Post("login")
  login(@Body() dto: CredentialsDto) { return this.auth.login(dto.email, dto.password); }

  @Public() @Throttle({ default: { limit: 5, ttl: 60_000 } }) @Post("request-password-reset")
  requestPasswordReset(@Body() dto: EmailDto) { return this.auth.requestPasswordReset(dto.email); }

  @Public() @Throttle({ default: { limit: 5, ttl: 60_000 } }) @Post("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto) { return this.auth.resetPassword(dto.token, dto.password); }

  @Post("logout") logout(@Req() req: AuthenticatedRequest) { return this.auth.logout(req.session.id, req.user.id); }
  @Post("logout-all") logoutAll(@Req() req: AuthenticatedRequest) { return this.auth.logoutAll(req.user.id); }
}
