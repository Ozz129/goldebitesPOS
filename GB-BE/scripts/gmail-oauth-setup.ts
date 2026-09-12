/**
 * One-time local helper to obtain a Gmail OAuth 2.0 refresh token for bank-transfer
 * verification. Run with `npm run gmail:authorize`. Requires GMAIL_OAUTH_CLIENT_ID and
 * GMAIL_OAUTH_CLIENT_SECRET already set (from Google Cloud Console — see
 * GB-BE/docs/bank-verification.md). Prints a refresh token to paste into
 * GMAIL_OAUTH_REFRESH_TOKEN — nothing is written to disk or logged anywhere else.
 */
import 'dotenv/config';
import { createServer } from 'node:http';
import { URL } from 'node:url';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

async function run(): Promise<void> {
  const clientId = process.env.GMAIL_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GMAIL_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_OAUTH_REDIRECT_URI ?? 'http://localhost:3000/oauth2callback';

  if (!clientId || !clientSecret) {
    console.error('Set GMAIL_OAUTH_CLIENT_ID and GMAIL_OAUTH_CLIENT_SECRET in your .env first.');
    process.exit(1);
  }

  const redirectUrl = new URL(redirectUri);
  const port = Number(redirectUrl.port || 80);

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });

  console.log('\n1. Open this URL and sign in with the Gmail account that receives the Bancolombia alerts:\n');
  console.log(authUrl);
  console.log(`\n2. Waiting for the redirect back to ${redirectUri} ...\n`);

  const code = await new Promise<string>((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? '', redirectUri);
      const authCode = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.end(`Authorization failed: ${error}. You can close this tab.`);
        server.close();
        reject(new Error(error));
        return;
      }
      if (authCode) {
        res.end('Authorization received — you can close this tab and return to the terminal.');
        server.close();
        resolve(authCode);
      }
    });
    server.listen(port);
  });

  const { tokens } = await oauth2Client.getToken(code);
  if (!tokens.refresh_token) {
    console.error(
      '\nNo refresh token was returned. This usually means the account already granted consent before — ' +
        'revoke access at https://myaccount.google.com/permissions and run this again.',
    );
    process.exit(1);
  }

  console.log('\nSuccess. Add this to your .env:\n');
  console.log(`GMAIL_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`);
  console.log();
}

run().catch((error) => {
  console.error('Gmail authorization failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
