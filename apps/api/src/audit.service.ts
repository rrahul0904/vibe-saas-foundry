import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditLog } from "./entities";

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLog) private readonly logs: Repository<AuditLog>) {}

  record(action: string, actorUserId: string | null, metadata: Record<string, unknown> = {}) {
    return this.logs.save(this.logs.create({ action, actorUserId, metadata }));
  }
}
