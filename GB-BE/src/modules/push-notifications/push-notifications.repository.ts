import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface NativePushTokenRow {
  id: string;
  token: string;
}

export interface PushSubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

@Injectable()
export class PushNotificationsRepository {
  constructor(private readonly db: DatabaseService) {}

  /** Saves the device's subscription for this user (a device moves to the last user who subscribed on it). */
  async upsert(data: {
    userId: string;
    businessId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent: string | null;
  }): Promise<void> {
    await this.db.query(
      `INSERT INTO push_subscriptions (user_id, business_id, endpoint, p256dh, auth, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (endpoint) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         business_id = EXCLUDED.business_id,
         p256dh = EXCLUDED.p256dh,
         auth = EXCLUDED.auth,
         user_agent = EXCLUDED.user_agent`,
      [
        data.userId,
        data.businessId,
        data.endpoint,
        data.p256dh,
        data.auth,
        data.userAgent,
      ],
    );
  }

  async remove(userId: string, endpoint: string): Promise<void> {
    await this.db.query(
      `DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2`,
      [userId, endpoint],
    );
  }

  async removeById(id: string): Promise<void> {
    await this.db.query(`DELETE FROM push_subscriptions WHERE id = $1`, [id]);
  }

  async findForUser(userId: string): Promise<PushSubscriptionRow[]> {
    const result = await this.db.query<PushSubscriptionRow>(
      `SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1`,
      [userId],
    );
    return result.rows;
  }

  async touch(id: string): Promise<void> {
    await this.db.query(
      `UPDATE push_subscriptions SET last_used_at = now() WHERE id = $1`,
      [id],
    );
  }

  /**
   * The users of a branch whose role has `permission` and that have a device
   * to notify (a phone app or a browser subscribed): the staff to ring.
   */
  async findStaffToNotify(
    businessId: string,
    branchId: string,
    permission: string,
  ): Promise<string[]> {
    const result = await this.db.query<{ id: string }>(
      `SELECT u.id FROM users u
       WHERE u.business_id = $1 AND u.branch_id = $2
         AND u.deleted_at IS NULL AND u.status = 'ACTIVE'
         AND EXISTS (
           SELECT 1 FROM role_permissions rp
           JOIN permissions p ON p.id = rp.permission_id
           WHERE rp.role_id = u.role_id AND p.code = $3
         )
         AND (
           EXISTS (SELECT 1 FROM push_native_tokens t WHERE t.user_id = u.id)
           OR EXISTS (SELECT 1 FROM push_subscriptions s WHERE s.user_id = u.id)
         )`,
      [businessId, branchId, permission],
    );
    return result.rows.map((row) => row.id);
  }

  // ---- The installed phone apps (Firebase Cloud Messaging) ----

  /** Saves the phone's token for this user (a phone moves to the last user who signed in on it). */
  async upsertNativeToken(data: {
    userId: string;
    businessId: string;
    token: string;
    platform: 'android' | 'ios';
  }): Promise<void> {
    await this.db.query(
      `INSERT INTO push_native_tokens (user_id, business_id, token, platform)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (token) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         business_id = EXCLUDED.business_id,
         platform = EXCLUDED.platform`,
      [data.userId, data.businessId, data.token, data.platform],
    );
  }

  async removeNativeToken(userId: string, token: string): Promise<void> {
    await this.db.query(
      `DELETE FROM push_native_tokens WHERE user_id = $1 AND token = $2`,
      [userId, token],
    );
  }

  async removeNativeTokenById(id: string): Promise<void> {
    await this.db.query(`DELETE FROM push_native_tokens WHERE id = $1`, [id]);
  }

  async findNativeTokensForUser(userId: string): Promise<NativePushTokenRow[]> {
    const result = await this.db.query<NativePushTokenRow>(
      `SELECT id, token FROM push_native_tokens WHERE user_id = $1`,
      [userId],
    );
    return result.rows;
  }

  async touchNativeToken(id: string): Promise<void> {
    await this.db.query(
      `UPDATE push_native_tokens SET last_used_at = now() WHERE id = $1`,
      [id],
    );
  }
}
