import { createHash, randomBytes } from "crypto";

export const hashToken = (value: string) => createHash("sha256").update(value).digest("hex");
export const newOpaqueToken = (bytes = 32) => randomBytes(bytes).toString("base64url");
export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export function operatorEmails(): Set<string> {
  return new Set((process.env.OPERATOR_EMAILS || "").split(",").map(normalizeEmail).filter(Boolean));
}

export const isBootstrapOperator = (email: string) => operatorEmails().has(normalizeEmail(email));
