import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly baseUrl = process.env.PUBLIC_WEB_URL || "http://localhost:5173";

  async sendVerification(email: string, token: string) {
    return this.send(email, "Verify your Vibe SaaS Foundry account", `Verify your account: ${this.baseUrl}/?verify=${encodeURIComponent(token)}`);
  }

  async sendPasswordReset(email: string, token: string) {
    return this.send(email, "Reset your Vibe SaaS Foundry password", `Reset your password: ${this.baseUrl}/?reset=${encodeURIComponent(token)}`);
  }

  async sendInvitation(email: string, organizationName: string, token: string) {
    return this.send(email, `Join ${organizationName} on Vibe SaaS Foundry`, `Accept your workspace invitation: ${this.baseUrl}/?invite=${encodeURIComponent(token)}`);
  }

  private async send(to: string, subject: string, text: string) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      if (process.env.NODE_ENV === "production") throw new ServiceUnavailableException("Transactional email is not configured");
      this.logger.log(`[development email] to=${to} subject=${subject} ${text}`);
      return;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM || "Foundry <onboarding@resend.dev>", to: [to], subject, text }),
    });
    if (!response.ok) throw new ServiceUnavailableException("Transactional email provider rejected the request");
  }
}
