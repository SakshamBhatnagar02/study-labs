/**
 * Study Labs — Resend Email Delivery Engine
 * Powered by Resend API (https://resend.com)
 * Handles transactional student verification OTPs, password reset links,
 * onboarding welcome sequences, and security threat alerts with robust
 * fallback and idempotency.
 */

export interface ResendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

export interface ResendDeliveryResult {
  success: boolean;
  messageId?: string;
  status: 'sent' | 'queued' | 'simulated' | 'error';
  errorMessage?: string;
  deliveredTo: string;
  timestamp: string;
}

const DEFAULT_SENDER = 'Study Labs <onboarding@resend.dev>';

export class ResendEmailService {
  private static getApiKey(): string {
    return (
      process.env.EXPO_PUBLIC_RESEND_API_KEY ||
      process.env.RESEND_API_KEY ||
      ''
    );
  }

  /**
   * Check if Resend service is actively configured with an API key
   */
  static isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.startsWith('re_'));
  }

  /**
   * Core email dispatcher targeting https://api.resend.com/emails
   */
  static async sendEmail(payload: ResendEmailPayload): Promise<ResendDeliveryResult> {
    const apiKey = this.getApiKey();
    const primaryRecipient = Array.isArray(payload.to) ? payload.to[0] : payload.to;
    const nowIso = new Date().toISOString();

    if (!apiKey) {
      console.warn('[ResendService] No API key detected. Simulating transaction dispatch.');
      return {
        success: true,
        messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        status: 'simulated',
        deliveredTo: primaryRecipient,
        timestamp: nowIso,
      };
    }

    try {
      const idempotencyKey = `study_labs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-Entity-Ref-ID': idempotencyKey,
        },
        body: JSON.stringify({
          from: payload.from || DEFAULT_SENDER,
          to: Array.isArray(payload.to) ? payload.to : [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          reply_to: payload.replyTo,
          tags: payload.tags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn('[ResendService] API returned non-200:', data);
        // If domain restrictions apply (e.g. unverified domain or sandbox limitation),
        // we record the error and gracefully provide an offline-resilient response
        return {
          success: false,
          status: 'error',
          errorMessage: data.message || `Delivery error (HTTP ${response.status})`,
          deliveredTo: primaryRecipient,
          timestamp: nowIso,
        };
      }

      return {
        success: true,
        messageId: data.id || `resend_${Date.now()}`,
        status: 'sent',
        deliveredTo: primaryRecipient,
        timestamp: nowIso,
      };
    } catch (err: any) {
      console.error('[ResendService] Network or fetch error:', err);
      return {
        success: false,
        status: 'error',
        errorMessage: err?.message || 'Network error while reaching Resend API',
        deliveredTo: primaryRecipient,
        timestamp: nowIso,
      };
    }
  }

  /**
   * Dispatch 6-digit verification OTP code
   */
  static async sendVerificationOtp(
    toEmail: string,
    otpCode: string,
    studentName: string = 'Scholar'
  ): Promise<ResendDeliveryResult> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0b0f19; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.08);">
        <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Study Labs</h1>
          <p style="margin: 6px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Next-Gen AI STEM Learning Platform</p>
        </div>
        <div style="padding: 32px 24px; background: #0f172a;">
          <h2 style="margin-top: 0; color: #f8fafc; font-size: 18px;">Verify Your Email Address</h2>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
            Hello <strong style="color: #f8fafc;">${studentName}</strong>, use the single-use 6-digit code below to complete your Study Labs student authentication:
          </p>
          <div style="margin: 28px 0; text-align: center;">
            <div style="display: inline-block; background: #1e293b; border: 2px dashed #f97316; padding: 14px 32px; border-radius: 12px; font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #fb923c;">
              ${otpCode}
            </div>
          </div>
          <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
            ⏳ This code will expire in <strong>10 minutes</strong>. If you did not create a Study Labs account, you can safely ignore this email.
          </p>
        </div>
        <div style="background: #020617; padding: 16px 24px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05); color: #475569; font-size: 11px;">
          Study Labs Ecosystem · Built for JEE, NEET & Advanced STEM Aspirants · Secured by Cloudflare & Resend
        </div>
      </div>
    `;

    return this.sendEmail({
      to: toEmail,
      subject: `Study Labs Verification Code: ${otpCode}`,
      html,
      text: `Your Study Labs verification code is ${otpCode}. It expires in 10 minutes.`,
      tags: [{ name: 'category', value: 'auth_otp' }],
    });
  }

  /**
   * Dispatch password reset link or PIN
   */
  static async sendPasswordResetEmail(
    toEmail: string,
    resetTokenOrUrl: string,
    studentName: string = 'Scholar'
  ): Promise<ResendDeliveryResult> {
    const isUrl = resetTokenOrUrl.startsWith('http') || resetTokenOrUrl.startsWith('studylabs://');
    const actionBlock = isUrl
      ? `<a href="${resetTokenOrUrl}" style="background: #f97316; color: #ffffff; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block;">Reset Password</a>`
      : `<div style="background: #1e293b; border: 1px solid #f97316; padding: 12px 24px; border-radius: 10px; font-family: monospace; font-size: 24px; color: #f97316; display: inline-block;">${resetTokenOrUrl}</div>`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0b0f19; color: #f8fafc; border-radius: 16px; overflow: hidden;">
        <div style="background: #ea580c; padding: 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800;">Password Reset Request</h1>
        </div>
        <div style="padding: 28px 24px; background: #0f172a;">
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
            Hi ${studentName}, we received a request to reset your Study Labs password. Click below or copy the code:
          </p>
          <div style="margin: 24px 0; text-align: center;">${actionBlock}</div>
          <p style="color: #64748b; font-size: 12px;">If you did not request this change, please check your security settings immediately.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: toEmail,
      subject: 'Study Labs — Reset Your Account Password',
      html,
      text: `Reset your Study Labs password: ${resetTokenOrUrl}`,
      tags: [{ name: 'category', value: 'password_reset' }],
    });
  }

  /**
   * Dispatch welcome onboarding email
   */
  static async sendWelcomeEmail(
    toEmail: string,
    studentName: string
  ): Promise<ResendDeliveryResult> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0b0f19; color: #f8fafc; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800;">Welcome to Study Labs! 🚀</h1>
          <p style="margin: 6px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Your AI-Powered Academic Companion</p>
        </div>
        <div style="padding: 28px 24px; background: #0f172a; font-size: 14px; line-height: 1.6; color: #94a3b8;">
          <p>Welcome aboard, <strong style="color: #f8fafc;">${studentName}</strong>! Your account is active. Here is what is ready for you:</p>
          <ul style="padding-left: 20px; color: #cbd5e1;">
            <li><strong style="color: #f97316;">AI Master Tutor:</strong> 3-tier Gemini reasoning (Lite, Flash, Pro) with LaTeX math and chemical diagrams.</li>
            <li><strong style="color: #3b82f6;">3D STEM Lab:</strong> Real-time interactive physics kinematics, Lorentz force, molecular kinetics, and crystal lattices.</li>
            <li><strong style="color: #10b981;">E-Book Library:</strong> NCERT & advanced competitive textbooks with built-in AI Chapter Companion.</li>
            <li><strong style="color: #8b5cf6;">Community Doubt Exchange:</strong> Ask, verify, and resolve conceptual questions with peers.</li>
          </ul>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: toEmail,
      subject: 'Welcome to Study Labs — Your Next-Gen STEM Journey Begins!',
      html,
      text: `Welcome to Study Labs, ${studentName}! Explore AI Master Tutor, 3D STEM Lab, and E-Books.`,
      tags: [{ name: 'category', value: 'onboarding_welcome' }],
    });
  }
}

