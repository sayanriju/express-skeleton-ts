import Email from 'email-templates';
import { Attachment } from 'nodemailer/lib/mailer';
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_FROM_ADDRESS,
  SMTP_AUTH_USER,
  SMTP_AUTH_PASSWORD,
  SMTP_SECURE,
} = process.env;

export interface MailOptsInterface {
  to: string;
  subject: string;
  locals?: Record<string, unknown>;
  attachments?: Attachment[];
  from?: string;
  replyTo?: string;
  send?: boolean;
}

export const sendMail = (
  template: string,
  { to, subject, locals, attachments, from, replyTo, send }: MailOptsInterface,
): Promise<Email> =>
  new Email({
    message: {
      from: from || SMTP_FROM_ADDRESS,
      replyTo: replyTo || from || SMTP_FROM_ADDRESS,
    },
    send: send || true, // set to false for dry-runs
    transport: {
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === 'yes', // use SSL
      auth: {
        user: SMTP_AUTH_USER,
        pass: SMTP_AUTH_PASSWORD,
      },
    },
    views: {
      options: {
        extension: 'ejs',
      },
    },
  }).send({
    template,
    message: {
      to,
      subject,
      attachments,
    },
    locals,
  });
