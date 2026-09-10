import { hashToken, isBootstrapOperator, newOpaqueToken, normalizeEmail } from "./security";

describe("security helpers", () => {
  it("normalizes email deterministically", () => {
    expect(normalizeEmail("  User@Example.COM ")).toBe("user@example.com");
  });

  it("hashes tokens without storing raw credentials", () => {
    expect(hashToken("secret-token")).toHaveLength(64);
    expect(hashToken("secret-token")).not.toContain("secret-token");
  });

  it("generates distinct opaque credentials", () => {
    expect(newOpaqueToken()).not.toEqual(newOpaqueToken());
  });

  it("uses an explicit operator bootstrap allowlist", () => {
    process.env.OPERATOR_EMAILS = "ops@example.com, owner@example.com";
    expect(isBootstrapOperator("OPS@example.com")).toBe(true);
    expect(isBootstrapOperator("user@example.com")).toBe(false);
  });
});
