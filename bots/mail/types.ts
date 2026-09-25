export type { EmailRecipient } from '../types';

export interface MailConfig {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  recipients: import('../types').EmailRecipient[];
}
