import { Controller, Get, Headers, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Public } from "./public";
import { Session, Task, User } from "./entities";

@Controller("admin")
export class AdminController {
  constructor(
    @InjectRepository(User) private readonly users:Repository<User>,
    @InjectRepository(Task) private readonly tasks:Repository<Task>,
    @InjectRepository(Session) private readonly sessions:Repository<Session>,
  ) {}
  private assertKey(key?:string){ if(!process.env.ADMIN_API_KEY || key !== process.env.ADMIN_API_KEY) throw new UnauthorizedException("Invalid admin key"); }
  @Public() @Get("metrics") async metrics(@Headers("x-admin-key") key?:string){
    this.assertKey(key);
    const [users,tasks,sessions]=await Promise.all([this.users.count(),this.tasks.count(),this.sessions.count()]);
    return {users,tasks,sessions};
  }
  @Public() @Get("users") async recent(@Headers("x-admin-key") key?:string){
    this.assertKey(key);
    const users=await this.users.find({order:{createdAt:"DESC"},take:20});
    return users.map(u=>({id:u.id,email:u.email,verified:Boolean(u.emailVerifiedAt),createdAt:u.createdAt}));
  }
}
