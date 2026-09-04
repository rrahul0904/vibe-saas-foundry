import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task, TaskPriority, TaskStatus } from "./entities";

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private readonly repo:Repository<Task>) {}

  list(userId:string, q:Record<string,string>) {
    const qb=this.repo.createQueryBuilder("task").where("task.user_id = :userId",{userId});
    if (q.search) qb.andWhere("LOWER(task.title) LIKE :search", { search:`%${q.search.toLowerCase()}%` });
    if (q.status && Object.values(TaskStatus).includes(q.status as TaskStatus)) qb.andWhere("task.status = :status",{status:q.status});
    if (q.priority && Object.values(TaskPriority).includes(q.priority as TaskPriority)) qb.andWhere("task.priority = :priority",{priority:q.priority});
    const allowed:Record<string,string>={created:"task.created_at",due:"task.due_date",priority:"task.priority",title:"task.title"};
    qb.orderBy(allowed[q.sort] || "task.created_at", q.order === "asc" ? "ASC" : "DESC", "NULLS LAST");
    return qb.getMany();
  }

  async create(userId:string, dto:any) {
    return this.repo.save(this.repo.create({ userId, title:dto.title.trim(), description:dto.description || null, priority:dto.priority || TaskPriority.MEDIUM, status:TaskStatus.PENDING, dueDate:dto.dueDate ? new Date(dto.dueDate) : null }));
  }
  async update(userId:string,id:string,dto:any) {
    const task=await this.repo.findOneBy({id,userId});
    if(!task) throw new NotFoundException("Task not found");
    if(dto.title !== undefined) task.title=dto.title.trim();
    if(dto.description !== undefined) task.description=dto.description || null;
    if(dto.priority !== undefined) task.priority=dto.priority;
    if(dto.status !== undefined) task.status=dto.status;
    if(dto.dueDate !== undefined) task.dueDate=dto.dueDate ? new Date(dto.dueDate) : null;
    return this.repo.save(task);
  }
  async remove(userId:string,id:string) {
    const result=await this.repo.delete({id,userId});
    if(!result.affected) throw new NotFoundException("Task not found");
    return {ok:true};
  }
}
