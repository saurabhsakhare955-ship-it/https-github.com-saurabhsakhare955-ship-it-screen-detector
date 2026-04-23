import nodemailer from 'nodemailer';
import { AppConfig, DetectionEvent } from '../types';

export class EmailNotifier {
  private transporter;

  constructor(private readonly config: AppConfig['email']) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.user && config.pass ? { user: config.user, pass: config.pass } : undefined,
    });
  }

  async notify(event: DetectionEvent): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.from,
      to: this.config.to,
      subject: `[Screen Detector] ${event.kind} detected`,
      text: JSON.stringify(event, null, 2),
    });
  }
}
