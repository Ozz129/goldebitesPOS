import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import DetailDrawer from '../../../shared/components/common/DetailDrawer';
import LoadingSkeleton from '../../../shared/components/common/LoadingSkeleton';
import { useBusinessFeatures } from '../../../modules/businesses/hooks/use-business-features';
import { useSetBusinessFeature } from '../../../modules/businesses/hooks/use-set-business-feature';
import type { BusinessRef } from '../../../modules/businesses/types/platform-admin.types';

interface BusinessFeaturesDrawerProps {
  business: BusinessRef | null;
  onClose: () => void;
}

export default function BusinessFeaturesDrawer({ business, onClose }: BusinessFeaturesDrawerProps) {
  const { data: features, isLoading } = useBusinessFeatures(business?.id ?? null);
  const setFeature = useSetBusinessFeature(business?.id ?? '');

  if (!business) return null;

  return (
    <>
      <DetailDrawer
        open={Boolean(business)}
        onClose={onClose}
        title={business.name}
        subtitle="Módulos de esta empresa"
        width={420}
      >
        {isLoading || !features ? (
          <LoadingSkeleton variant="page" />
        ) : (
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Desmarca un módulo para quitarle el acceso a esta empresa. El cambio aplica en su próximo inicio de
              sesión (o al refrescar el token).
            </Typography>
            {features.map((feature) => (
              <div key={feature.key}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={feature.enabled}
                      onChange={(e) => setFeature.mutate({ featureKey: feature.key, enabled: e.target.checked })}
                    />
                  }
                  label={feature.label}
                />
                {feature.subFeatures?.map((sub) => (
                  <FormControlLabel
                    key={sub.key}
                    sx={{ ml: 3, display: 'flex' }}
                    control={
                      <Checkbox
                        checked={sub.enabled}
                        disabled={!feature.enabled}
                        onChange={(e) => setFeature.mutate({ featureKey: sub.key, enabled: e.target.checked })}
                      />
                    }
                    label={
                      <Typography variant="body2" color={feature.enabled ? 'text.primary' : 'text.disabled'}>
                        {sub.label}
                      </Typography>
                    }
                  />
                ))}
              </div>
            ))}

          </Stack>
        )}
      </DetailDrawer>

    </>
  );
}
