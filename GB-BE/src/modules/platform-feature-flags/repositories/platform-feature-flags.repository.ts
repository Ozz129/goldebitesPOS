import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import {
  DisabledPlatformFeatureFlagRow,
  IPlatformFeatureFlagsRepository,
} from './platform-feature-flags.repository.interface';

@Injectable()
export class PlatformFeatureFlagsRepository implements IPlatformFeatureFlagsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findDisabledKeys(): Promise<string[]> {
    const result = await this.db.query<DisabledPlatformFeatureFlagRow>(
      `SELECT feature_key FROM platform_feature_flags WHERE enabled = false`,
    );
    return result.rows.map((row) => row.feature_key);
  }

  async setEnabled(featureKey: string, enabled: boolean): Promise<void> {
    await this.db.query(
      `INSERT INTO platform_feature_flags (feature_key, enabled)
       VALUES ($1, $2)
       ON CONFLICT (feature_key) DO UPDATE SET enabled = $2, updated_at = now()`,
      [featureKey, enabled],
    );
  }
}
