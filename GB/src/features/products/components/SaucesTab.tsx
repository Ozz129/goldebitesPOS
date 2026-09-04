import { useSnackbar } from 'notistack';
import { useSauces } from '../../../modules/sauces/hooks/use-sauces';
import { useCreateSauce } from '../../../modules/sauces/hooks/use-create-sauce';
import { useUpdateSauce } from '../../../modules/sauces/hooks/use-update-sauce';
import { useSetSauceStatus } from '../../../modules/sauces/hooks/use-set-sauce-status';
import { normalizeApiError } from '../../../lib/api/api-error';
import SimpleCatalogManager from './SimpleCatalogManager';

export default function SaucesTab() {
  const { enqueueSnackbar } = useSnackbar();
  const { data, isLoading, isError, refetch } = useSauces({ limit: 100 });
  const createSauce = useCreateSauce();
  const updateSauce = useUpdateSauce();
  const setSauceStatus = useSetSauceStatus();

  return (
    <SimpleCatalogManager
      entityLabel="salsa"
      entityLabelPlural="salsas"
      gender="f"
      items={data?.data ?? []}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
      creating={createSauce.isPending}
      updating={updateSauce.isPending}
      onCreate={(values, onSuccess) =>
        createSauce.mutate(values, {
          onSuccess,
          onError: (error) =>
            enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
        })
      }
      onUpdate={(id, values, onSuccess) =>
        updateSauce.mutate(
          { id, payload: values },
          {
            onSuccess,
            onError: (error) =>
              enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
          },
        )
      }
      onToggleStatus={(sauce) =>
        setSauceStatus.mutate(
          { id: sauce.id, isActive: !sauce.isActive },
          {
            onSuccess: (updated) =>
              enqueueSnackbar(updated.isActive ? 'Salsa activada' : 'Salsa desactivada', {
                variant: 'success',
              }),
            onError: (error) =>
              enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
          },
        )
      }
    />
  );
}
