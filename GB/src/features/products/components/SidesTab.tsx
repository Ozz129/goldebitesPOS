import { useSnackbar } from 'notistack';
import { useSides } from '../../../modules/sides/hooks/use-sides';
import { useCreateSide } from '../../../modules/sides/hooks/use-create-side';
import { useUpdateSide } from '../../../modules/sides/hooks/use-update-side';
import { useSetSideStatus } from '../../../modules/sides/hooks/use-set-side-status';
import { normalizeApiError } from '../../../lib/api/api-error';
import SimpleCatalogManager from './SimpleCatalogManager';

export default function SidesTab() {
  const { enqueueSnackbar } = useSnackbar();
  const { data, isLoading, isError, refetch } = useSides({ limit: 100 });
  const createSide = useCreateSide();
  const updateSide = useUpdateSide();
  const setSideStatus = useSetSideStatus();

  return (
    <SimpleCatalogManager
      entityLabel="acompañante"
      entityLabelPlural="acompañantes"
      gender="m"
      items={data?.data ?? []}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
      creating={createSide.isPending}
      updating={updateSide.isPending}
      onCreate={(values, onSuccess) =>
        createSide.mutate(values, {
          onSuccess,
          onError: (error) =>
            enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
        })
      }
      onUpdate={(id, values, onSuccess) =>
        updateSide.mutate(
          { id, payload: values },
          {
            onSuccess,
            onError: (error) =>
              enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
          },
        )
      }
      onToggleStatus={(side) =>
        setSideStatus.mutate(
          { id: side.id, isActive: !side.isActive },
          {
            onSuccess: (updated) =>
              enqueueSnackbar(updated.isActive ? 'Acompañante activado' : 'Acompañante desactivado', {
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
