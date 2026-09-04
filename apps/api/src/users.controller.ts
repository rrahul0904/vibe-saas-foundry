import { Controller, Delete, Req } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthenticatedRequest } from "./auth.guard";
import { User } from "./entities";

@Controller("users")
export class UsersController {
  constructor(@InjectRepository(User) private readonly users:Repository<User>) {}
  @Delete("me") async remove(@Req() req:AuthenticatedRequest) {
    await this.users.delete(req.user.id);
    return {ok:true};
  }
}
