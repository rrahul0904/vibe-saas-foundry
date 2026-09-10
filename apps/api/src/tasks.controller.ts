import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { IsEnum, IsISO8601, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { AuthenticatedRequest } from "./auth.guard";
import { TaskPriority, TaskStatus } from "./entities";
import { TasksService } from "./tasks.service";

class CreateTaskDto{@IsString()@MinLength(1)@MaxLength(240)title!:string;@IsOptional()@IsString()description?:string;@IsOptional()@IsEnum(TaskPriority)priority?:TaskPriority;@IsOptional()@IsISO8601()dueDate?:string}
class UpdateTaskDto{@IsOptional()@IsString()@MinLength(1)@MaxLength(240)title?:string;@IsOptional()@IsString()description?:string;@IsOptional()@IsEnum(TaskPriority)priority?:TaskPriority;@IsOptional()@IsEnum(TaskStatus)status?:TaskStatus;@IsOptional()@IsISO8601()dueDate?:string}

@Controller("tasks")
export class TasksController{
  constructor(private readonly tasks:TasksService){}
  @Get()list(@Req()req:AuthenticatedRequest,@Headers("x-organization-id")organizationId:string,@Query()q:Record<string,string>){return this.tasks.list(req.user.id,organizationId,q)}
  @Post()create(@Req()req:AuthenticatedRequest,@Headers("x-organization-id")organizationId:string,@Body()dto:CreateTaskDto){return this.tasks.create(req.user.id,organizationId,dto)}
  @Patch(":id")update(@Req()req:AuthenticatedRequest,@Headers("x-organization-id")organizationId:string,@Param("id")id:string,@Body()dto:UpdateTaskDto){return this.tasks.update(req.user.id,organizationId,id,dto)}
  @Delete(":id")remove(@Req()req:AuthenticatedRequest,@Headers("x-organization-id")organizationId:string,@Param("id")id:string){return this.tasks.remove(req.user.id,organizationId,id)}
}
