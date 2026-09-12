import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { gmail_v1, google } from 'googleapis';
import { AppConfig } from '../../../../config/app.config';
import { EmailProvider, RawEmailMessage } from './email-provider.interface';

/**
 * Reads Gmail via OAuth 2.0 (offline refresh token, no stored password). Only the
 * refresh token is persisted, and only in an env var — see .env.example for how to
 * obtain one with `npm run gmail:authorize`.
 */
@Injectable()
export class GmailApiEmailProvider implements EmailProvider {
  private readonly logger = new Logger(GmailApiEmailProvider.name);
  private gmailClient: gmail_v1.Gmail | null = null;

  constructor(private readonly configService: ConfigService) {}

  private get config(): AppConfig['bankVerification']['gmail'] {
    return this.configService.getOrThrow<AppConfig>('app').bankVerification.gmail;
  }

  private getClient(): gmail_v1.Gmail {
    if (this.gmailClient) return this.gmailClient;
    const { clientId, clientSecret, refreshToken, redirectUri } = this.config;
    const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    auth.setCredentials({ refresh_token: refreshToken });
    this.gmailClient = google.gmail({ version: 'v1', auth });
    return this.gmailClient;
  }

  async listMessagesSince(since: Date): Promise<RawEmailMessage[]> {
    const gmail = this.getClient();
    const afterSeconds = Math.floor(since.getTime() / 1000);
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: `after:${afterSeconds}`,
    });

    const messageIds = listResponse.data.messages ?? [];
    const messages: RawEmailMessage[] = [];
    for (const { id } of messageIds) {
      if (!id) continue;
      try {
        const message = await this.fetchMessage(gmail, id);
        if (message) messages.push(message);
      } catch (error) {
        this.logger.error(
          `Failed to fetch Gmail message ${id}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
    return messages;
  }

  private async fetchMessage(gmail: gmail_v1.Gmail, id: string): Promise<RawEmailMessage | null> {
    const response = await gmail.users.messages.get({ userId: 'me', id, format: 'full' });
    const payload = response.data.payload;
    if (!payload) return null;

    const headers = payload.headers ?? [];
    const fromHeader = headerValue(headers, 'From') ?? '';
    const subject = headerValue(headers, 'Subject') ?? '';
    const authenticationResults = headerValue(headers, 'Authentication-Results');
    const dateHeader = headerValue(headers, 'Date');

    return {
      id,
      fromAddress: extractEmailAddress(fromHeader),
      fromHeader,
      subject,
      receivedAt: dateHeader
        ? new Date(dateHeader)
        : new Date(Number(response.data.internalDate ?? Date.now())),
      bodyText: extractBodyText(payload),
      authenticationResults: authenticationResults ?? undefined,
    };
  }
}

function headerValue(
  headers: gmail_v1.Schema$MessagePartHeader[],
  name: string,
): string | undefined {
  return headers.find((header) => header.name?.toLowerCase() === name.toLowerCase())?.value ?? undefined;
}

function extractEmailAddress(fromHeader: string): string {
  const match = fromHeader.match(/<([^>]+)>/);
  return (match ? match[1] : fromHeader).trim().toLowerCase();
}

function extractBodyText(payload: gmail_v1.Schema$MessagePart): string {
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }
  for (const part of payload.parts ?? []) {
    const text = extractBodyText(part);
    if (text) return text;
  }
  if (payload.mimeType === 'text/html' && payload.body?.data) {
    return decodeBase64Url(payload.body.data).replace(/<[^>]+>/g, ' ');
  }
  return '';
}

function decodeBase64Url(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8');
}
