import type { ReactNode } from 'react';
import { usePermissions } from '../hooks/use-permissions';

interface HasFeatureProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/** Renders `children` only if the current business has this feature (module or sub-feature) enabled. */
export function HasFeature({ feature, children, fallback = null }: HasFeatureProps) {
  const { hasFeature } = usePermissions();
  return hasFeature(feature) ? <>{children}</> : <>{fallback}</>;
}
