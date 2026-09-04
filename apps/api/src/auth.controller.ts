import { Body, Controller, Post, Req } from "@nestjs/common";
import { IsEmail, IsString, MinLength } from "class-validator";
import { AuthenticatedRequest } from "./auth.guard";
import { AuthService } from "./auth.service";
import { Public } from "./public";

class CredentialsDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
}
class VerifyDto { @IsString() token!: string; }

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public() @Post("register") register(@Body() dto: CredentialsDto) { return this.auth.register(dto.email, dto.password); }
  @Public() @Post("verify-email") verify(@Body() dto: VerifyDto) { return this.auth.verifyEmail(dto.token); }
  @Public() @Post("login") login(@Body() dto: CredentialsDto) { return this.auth.login(dto.email, dto.password); }
  @Post("logout") logout(@Req() req: AuthenticatedRequest) { return this.auth.logout(req.session.id); }
  @Post("logout-all") logoutAll(@Req() req: AuthenticatedRequest) { return this.auth.logoutAll(req.user.id); }
}
