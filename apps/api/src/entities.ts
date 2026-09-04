import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Index({ unique: true }) @Column() email!: string;
  @Column({ name: "password_hash" }) passwordHash!: string;
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
