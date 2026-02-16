import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);
    private readonly fromAddress: string;
    private readonly frontendUrl: string;

    constructor(private configService: ConfigService) {
        this.fromAddress = this.configService.get<string>('SMTP_FROM', 'noreply@cybermax.com');
        this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST', 'localhost'),
            port: this.configService.get<number>('SMTP_PORT', 465),
            secure: this.configService.get<number>('SMTP_PORT', 465) === 465,
            auth: {
                user: this.configService.get<string>('SMTP_USER', ''),
                pass: this.configService.get<string>('SMTP_PASS', ''),
            },
        });

        this.logger.log('📧 Mail service initialized');
    }

    private baseTemplate(content: string): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#06b6d4,#0891b2);padding:32px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">
                                Cybermax DMS
                            </h1>
                            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                                Document Management System
                            </p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding:40px;">
                            ${content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding:24px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                            <p style="margin:0;color:#94a3b8;font-size:12px;">
                                © 2026 PT Cybermax Indonesia. All rights reserved.
                            </p>
                            <p style="margin:4px 0 0;color:#94a3b8;font-size:11px;">
                                Email ini dikirim otomatis, mohon tidak membalas email ini.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    async sendForgotPasswordEmail(email: string, resetToken: string, userName: string): Promise<void> {
        const resetUrl = `${this.frontendUrl}/reset-password?token=${resetToken}`;

        const content = `
            <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:700;">Reset Password</h2>
            <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
                Halo <strong>${userName}</strong>, kami menerima permintaan untuk mereset password akun Anda.
            </p>
            <div style="text-align:center;margin:32px 0;">
                <a href="${resetUrl}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#06b6d4,#0891b2);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;">
                    Reset Password
                </a>
            </div>
            <p style="margin:0 0 8px;color:#64748b;font-size:13px;">
                Atau salin link berikut ke browser Anda:
            </p>
            <p style="margin:0 0 24px;padding:12px 16px;background:#f1f5f9;border-radius:8px;word-break:break-all;font-size:12px;color:#475569;">
                ${resetUrl}
            </p>
            <div style="padding:16px;background:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;">
                <p style="margin:0;color:#92400e;font-size:13px;">
                    ⚠️ Link ini akan kedaluwarsa dalam <strong>1 jam</strong>. Jika Anda tidak meminta reset password, abaikan email ini.
                </p>
            </div>`;

        await this.sendMail(email, '🔒 Reset Password - Cybermax DMS', content);
    }

    async sendWelcomeEmail(email: string, userName: string): Promise<void> {
        const loginUrl = `${this.frontendUrl}/login`;

        const content = `
            <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:700;">Selamat Datang! 🎉</h2>
            <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
                Halo <strong>${userName}</strong>, akun Anda telah berhasil didaftarkan di Cybermax DMS.
            </p>
            <div style="padding:20px;background:#f0fdf4;border-radius:12px;border-left:4px solid #22c55e;margin:0 0 24px;">
                <p style="margin:0 0 8px;color:#166534;font-size:14px;font-weight:700;">✅ Akun Aktif</p>
                <p style="margin:0;color:#166534;font-size:13px;">
                    Anda dapat langsung login dan mulai mengelola dokumen.
                </p>
            </div>
            <div style="text-align:center;margin:32px 0;">
                <a href="${loginUrl}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#06b6d4,#0891b2);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;">
                    Login Sekarang
                </a>
            </div>
            <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
                Jika Anda tidak mendaftar di Cybermax DMS, abaikan email ini.
            </p>`;

        await this.sendMail(email, '🎉 Selamat Datang di Cybermax DMS', content);
    }

    async sendPermissionRequestEmail(
        adminEmail: string,
        requesterName: string,
        documentTitle: string,
        requestType: string,
    ): Promise<void> {
        const dashboardUrl = `${this.frontendUrl}/dashboard/admin/permissions`;

        const content = `
            <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:700;">Permintaan Izin Baru 📋</h2>
            <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
                Ada permintaan izin baru yang memerlukan review Anda.
            </p>
            <div style="padding:20px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin:0 0 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding:8px 0;color:#64748b;font-size:13px;width:120px;">Pemohon</td>
                        <td style="padding:8px 0;color:#1e293b;font-size:13px;font-weight:600;">${requesterName}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 0;color:#64748b;font-size:13px;border-top:1px solid #f1f5f9;">Dokumen</td>
                        <td style="padding:8px 0;color:#1e293b;font-size:13px;font-weight:600;border-top:1px solid #f1f5f9;">${documentTitle}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 0;color:#64748b;font-size:13px;border-top:1px solid #f1f5f9;">Tipe</td>
                        <td style="padding:8px 0;color:#1e293b;font-size:13px;font-weight:600;border-top:1px solid #f1f5f9;">${requestType}</td>
                    </tr>
                </table>
            </div>
            <div style="text-align:center;margin:32px 0;">
                <a href="${dashboardUrl}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#06b6d4,#0891b2);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;">
                    Review Permintaan
                </a>
            </div>`;

        await this.sendMail(adminEmail, '📋 Permintaan Izin Baru - Cybermax DMS', content);
    }

    async sendPermissionStatusEmail(
        userEmail: string,
        userName: string,
        documentTitle: string,
        status: 'APPROVED' | 'REJECTED',
    ): Promise<void> {
        const isApproved = status === 'APPROVED';
        const statusLabel = isApproved ? 'Disetujui ✅' : 'Ditolak ❌';
        const statusColor = isApproved ? '#22c55e' : '#ef4444';
        const bgColor = isApproved ? '#f0fdf4' : '#fef2f2';
        const textColor = isApproved ? '#166534' : '#991b1b';

        const content = `
            <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:700;">Status Permintaan Izin</h2>
            <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
                Halo <strong>${userName}</strong>, permintaan izin Anda telah diproses.
            </p>
            <div style="padding:20px;background:${bgColor};border-radius:12px;border-left:4px solid ${statusColor};margin:0 0 24px;">
                <p style="margin:0 0 8px;color:${textColor};font-size:16px;font-weight:700;">${statusLabel}</p>
                <p style="margin:0;color:${textColor};font-size:13px;">
                    Dokumen: <strong>${documentTitle}</strong>
                </p>
            </div>
            ${isApproved ? `
            <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
                Anda sekarang memiliki akses untuk mengedit dokumen tersebut.
            </p>` : `
            <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
                Silakan hubungi admin jika Anda memiliki pertanyaan.
            </p>`}
            <div style="text-align:center;margin:32px 0;">
                <a href="${this.frontendUrl}/dashboard/documents" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#06b6d4,#0891b2);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;">
                    Lihat Dokumen
                </a>
            </div>`;

        await this.sendMail(userEmail, `${isApproved ? '✅' : '❌'} Permintaan Izin ${statusLabel} - Cybermax DMS`, content);
    }

    private async sendMail(to: string, subject: string, htmlContent: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: this.fromAddress,
                to,
                subject,
                html: this.baseTemplate(htmlContent),
            });
            this.logger.log(`📧 Email sent to ${to}: ${subject}`);
        } catch (error) {
            this.logger.error(`📧 Failed to send email to ${to}: ${error.message}`);
            // Don't throw — email failure shouldn't break the main flow
        }
    }
}
