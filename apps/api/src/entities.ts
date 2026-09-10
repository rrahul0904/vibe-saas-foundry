import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum UserRole { MEMBER="member", OPERATOR="operator" }

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Index({ unique: true }) @Column() email!: string;
  @Column({ name: "password_hash" }) passwordHash!: string;
  @Column({ type:"enum", enum:UserRole, enumName:"user_role_enum", default:UserRole.MEMBER }) role!: UserRole;
  @Column({ name: "email_verified_at", type: "timestamptz", nullable: true }) emailVerifiedAt!: Date | null;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
}

@Entity("sessions")
export class Session {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @ManyToOne(() => User, { onDelete: "CASCADE" }) @JoinColumn({ name: "user_id" }) user!: User;
  @Column({ name: "user_id", type: "uuid" }) userId!: string;
  @Index({ unique: true }) @Column({ name: "token_hash" }) tokenHash!: string;
  @Column({ name: "expires_at", type: "timestamptz" }) expiresAt!: Date;
  @Column({ name: "revoked_at", type: "timestamptz", nullable: true }) revokedAt!: Date | null;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
}

@Entity("email_verification_tokens")
export class EmailVerificationToken {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @ManyToOne(() => User, { onDelete: "CASCADE" }) @JoinColumn({ name: "user_id" }) user!: User;
  @Column({ name: "user_id", type: "uuid" }) userId!: string;
  @Index({ unique: true }) @Column({ name: "token_hash" }) tokenHash!: string;
  @Column({ name: "expires_at", type: "timestamptz" }) expiresAt!: Date;
  @Column({ name: "used_at", type: "timestamptz", nullable: true }) usedAt!: Date | null;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
}

@Entity("password_reset_tokens")
export class PasswordResetToken {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @ManyToOne(() => User, { onDelete: "CASCADE" }) @JoinColumn({ name: "user_id" }) user!: User;
  @Column({ name: "user_id", type: "uuid" }) userId!: string;
  @Index({ unique: true }) @Column({ name: "token_hash" }) tokenHash!: string;
  @Column({ name: "expires_at", type: "timestamptz" }) expiresAt!: Date;
  @Column({ name: "used_at", type: "timestamptz", nullable: true }) usedAt!: Date | null;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
}

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ name:"actor_user_id", type:"uuid", nullable:true }) actorUserId!: string | null;
  @Column({ length:120 }) action!: string;
  @Column({ type:"jsonb", default:() => "'{}'::jsonb" }) metadata!: Record<string, unknown>;
  @CreateDateColumn({ name:"created_at", type:"timestamptz" }) createdAt!: Date;
}

export enum TaskStatus { PENDING="pending", IN_PROGRESS="in_progress", DONE="done" }
export enum TaskPriority { LOW="low", MEDIUM="medium", HIGH="high" }

@Entity("tasks")
export class Task {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @ManyToOne(() => User, { onDelete: "CASCADE" }) @JoinColumn({ name: "user_id" }) user!: User;
  @Column({ name: "user_id", type: "uuid" }) userId!: string;
  @Column({ length: 240 }) title!: string;
  @Column({ type: "text", nullable: true }) description!: string | null;
  @Column({ type: "enum", enum: TaskStatus, default: TaskStatus.PENDING }) status!: TaskStatus;
  @Column({ type: "enum", enum: TaskPriority, default: TaskPriority.MEDIUM }) priority!: TaskPriority;
  @Column({ name: "due_date", type: "timestamptz", nullable: true }) dueDate!: Date | null;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
}
