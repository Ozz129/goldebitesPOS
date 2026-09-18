export interface DisabledPlatformFeatureFlagRow {
  feature_key: string;
}

export interface IPlatformFeatureFlagsRepository {
  findDisabledKeys(): Promise<string[]>;
  setEnabled(featureKey: string, enabled: boolean): Promise<void>;
}

export const PLATFORM_FEATURE_FLAGS_REPOSITORY = Symbol(
  'PLATFORM_FEATURE_FLAGS_REPOSITORY',
);
