import { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useSnackbar } from 'notistack';
import DataTable from '../../../components/common/DataTable';
import StatusChip from '../../../components/common/StatusChip';
import ErrorState from '../../../components/common/ErrorState';
import { Can } from '../../../modules/auth/components/can';
import type { CatalogFormValues } from '../schemas/catalogSchema';
import CatalogFormDrawer from './CatalogFormDrawer';

export interface CatalogItem {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
}

interface SimpleCatalogManagerProps<T extends CatalogItem> {
  entityLabel: string;
  entityLabelPlural: string;
  /** Grammatical gender of entityLabel, so generated Spanish phrases agree (salsa=f, acompañante/categoría... categoría is f too, but acompañante is m). */
  gender: 'f' | 'm';
  items: T[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  creating: boolean;
  updating: boolean;
  onCreate: (values: CatalogFormValues, onSuccess: () => void) => void;
  onUpdate: (id: string, values: CatalogFormValues, onSuccess: () => void) => void;
  onToggleStatus: (item: T) => void;
}

export default function SimpleCatalogManager<T extends CatalogItem>({
  entityLabel,
  entityLabelPlural,
  gender,
  items,
  isLoading,
  isError,
  onRetry,
  creating,
  updating,
  onCreate,
  onUpdate,
  onToggleStatus,
}: SimpleCatalogManagerProps<T>) {
  const { enqueueSnackbar } = useSnackbar();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  const newArticle = gender === 'f' ? 'Nueva' : 'Nuevo';
  const suffix = gender === 'f' ? 'a' : 'o';

  const handleSubmit = (values: CatalogFormValues) => {
    const onSuccess = () => {
      enqueueSnackbar(
        editingItem
          ? `${capitalize(entityLabel)} actualizad${suffix} correctamente`
          : `${capitalize(entityLabel)} cread${suffix} correctamente`,
        { variant: 'success' },
      );
      setFormOpen(false);
    };

    if (editingItem) {
      onUpdate(editingItem.id, values, onSuccess);
    } else {
      onCreate(values, onSuccess);
    }
  };

  const columns: ColumnDef<T, unknown>[] = [
    { accessorKey: 'name', header: 'Nombre' },
    {
      id: 'description',
      header: 'Descripción',
      cell: ({ row }) => row.original.description ?? '—',
    },
    { accessorKey: 'displayOrder', header: 'Orden' },
    {
      id: 'status',
      header: 'Estado',
      cell: ({ row }) => (
        <StatusChip
          label={row.original.isActive ? 'Activo' : 'Inactivo'}
          tone={row.original.isActive ? 'success' : 'neutral'}
        />
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Can permission="products.update">
          <Button
            size="small"
            color={row.original.isActive ? 'error' : 'success'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(row.original);
            }}
          >
            {row.original.isActive ? 'Desactivar' : 'Activar'}
          </Button>
        </Can>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <Can permission="products.create">
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => {
              setEditingItem(null);
              setFormOpen(true);
            }}
          >
            {newArticle} {entityLabel}
          </Button>
        </Can>
      </Stack>

      {isError ? (
        <ErrorState onRetry={onRetry} />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          isLoading={isLoading}
          onRowClick={(row) => {
            setEditingItem(row);
            setFormOpen(true);
          }}
          emptyTitle={`No hay ${entityLabelPlural} registradas`}
          pageSize={10}
        />
      )}

      <CatalogFormDrawer
        open={formOpen}
        initialItem={editingItem}
        entityLabel={entityLabel}
        gender={gender}
        submitting={creating || updating}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </Stack>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
