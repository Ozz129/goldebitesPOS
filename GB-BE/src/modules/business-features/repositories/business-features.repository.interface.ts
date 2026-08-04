export interface DisabledFeatureRow {
  feature_key: string;
}

export interface IBusinessFeaturesRepository {
  findDisabledKeys(businessId: string): Promise<string[]>;
  setEnabled(
    businessId: string,
    featureKey: string,
    enabled: boolean,
  ): Promise<void>;
}

export const BUSINESS_FEATURES_REPOSITORY = Symbol(
  'BUSINESS_FEATURES_REPOSITORY',
);
