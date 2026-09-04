import { Controller, Get } from "@nestjs/common";
import { Public } from "./public";
@Controller("health")
export class HealthController { @Public() @Get() health(){ return {ok:true,service:"foundry-api",time:new Date().toISOString()}; } }
