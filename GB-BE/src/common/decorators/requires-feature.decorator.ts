import { SetMetadata } from '@nestjs/common';

export const REQUIRES_FEATURE_KEY = 'requiresFeature';

/**
 * Restricts a route to businesses that have this module enabled (see
 * business_features table / BusinessFeaturesService). Independent from
 * @Permissions() — a user can have full permissions on a module their
 * business simply doesn't have turned on.
 */
export const RequiresFeature = (featureKey: string) =>
  SetMetadata(REQUIRES_FEATURE_KEY, featureKey);
