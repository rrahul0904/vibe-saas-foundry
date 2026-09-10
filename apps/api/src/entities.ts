import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum UserRole { MEMBER="member", OPERATOR="operator" }
export enum MembershipRole { OWNER="owner", ADMIN="admin", MEMBER="member" }

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

@Entity("organizations")
export class Organization {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Index({ unique:true }) @Column({ length:100 }) slug!: string;
  @Column({ length:160 }) name!: string;
  @CreateDateColumn({ name:"created_at", type:"timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name:"updated_at", type:"timestamptz" }) updatedAt!: Date;
}

@Entity("memberships")
@Index(["organizationId", "userId"], { unique:true })
export class Membership {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @ManyToOne(() => Organization, { onDelete:"CASCADE" }) @JoinColumn({ name:"organization_id" }) organization!: Organization;
  @Column({ name:"organization_id", type:"uuid" }) organizationId!: string;
  @ManyToOne(() => User, { onDelete:"CASCADE" }) @JoinColumn({ name:"user_id" }) user!: User;
  @Column({ name:"user_id", type:"uuid" }) userId!: string;
  @Column({ type:"enum", enum:MembershipRole, enumName:"membership_role_enum", default:MembershipRole.MEMBER }) role!: MembershipRole;
  @CreateDateColumn({ name:"created_at", type:"timestamptz" }) createdAt!: Date;
}

@Entity("organization_invitations")
export class OrganizationInvitation {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @ManyToOne(() => Organization, { onDelete:"CASCADE" }) @JoinColumn({ name:"organization_id" }) organization!: Organization;
  @Column({ name:"organization_id", type:"uuid" }) organizationId!: string;
  @Column() email!: string;
  @Column({ type:"enum", enum:MembershipRole, enumName:"membership_role_enum" }) role!: MembershipRole;
  @Index({ unique:true }) @Column({ name:"token_hash" }) tokenHash!: string;
  @Column({ name:"invited_by_user_id", type:"uuid", nullable:true }) invitedByUserId!: string | null;
  @Column({ name:"expires_at", type:"timestamptz" }) expiresAt!: Date;
  @Column({ name:"accepted_at", type:"timestamptz", nullable:true }) acceptedAt!: Date | null;
  @CreateDateColumn({ name:"created_at", type:"timestamptz" }) createdAt!: Date;
}

@Entity("organization_entitlements")
export class OrganizationEntitlement {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Index({ unique:true }) @Column({ name:"organization_id", type:"uuid" }) organizationId!: string;
  @Column({ name:"plan_code", length:40, default:"free" }) planCode!: string;
  @Column({ name:"max_members", type:"int", default:3 }) maxMembers!: number;
  @Column({ type:"jsonb", default:() => "'{}'::jsonb" }) features!: Record<string, boolean>;
  @CreateDateColumn({ name:"created_at", type:"timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name:"updated_at", type:"timestamptz" }) updatedAt!: Date;
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
  @ManyToOne(() => Organization, { onDelete:"CASCADE" }) @JoinColumn({ name:"organization_id" }) organization!: Organization;
  @Column({ name:"organization_id", type:"uuid" }) organizationId!: string;
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
