import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: true,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendTicketPurchaseNotification(userId: string, username: string, points: number): Promise<void> {
    try {
      const adminEmails = this.configService.get<string>('ADMIN_EMAILS')?.split(',') || [];
      const operationEmails = this.configService.get<string>('OPERATION_EMAILS')?.split(',') || [];
      
      const recipients = [...new Set([...adminEmails, ...operationEmails])];
      
      if (recipients.length === 0) {
        this.logger.warn('No recipient emails configured for ticket purchase notifications');
        return;
      }

      const mailOptions = {
        from: this.configService.get<string>('SMTP_FROM_EMAIL'),
        to: recipients.join(', '),
        subject: 'New Ticket Purchase Notification',
        html: `
          <h2>New Ticket Purchase</h2>
          <p>A user has purchased a ticket:</p>
          <ul>
            <li><strong>User ID:</strong> ${userId}</li>
            <li><strong>Username:</strong> ${username}</li>
            <li><strong>Points Spent:</strong> ${points}</li>
            <li><strong>Purchase Time:</strong> ${new Date().toLocaleString()}</li>
          </ul>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Ticket purchase notification sent for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to send ticket purchase notification: ${error.message}`, error.stack);
      throw error;
    }
  }
} 