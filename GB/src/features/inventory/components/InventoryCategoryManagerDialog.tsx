import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { Plus } from 'lucide-react';
import { useSnackbar } from 'notistack';
import StatusChip from '../../../components/common/StatusChip';
import { useInventoryItemCategories } from '../../../modules/inventory-item-categories/hooks/use-inventory-item-categories';
import { useCreateInventoryItemCategory } from '../../../modules/inventory-item-categories/hooks/use-create-inventory-item-category';
import { useSetInventoryItemCategoryStatus } from '../../../modules/inventory-item-categories/hooks/use-set-inventory-item-category-status';
import { normalizeApiError } from '../../../lib/api/api-error';

interface InventoryCategoryManagerDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function InventoryCategoryManagerDialog({
  open,
  onClose,
}: InventoryCategoryManagerDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data } = useInventoryItemCategories({ limit: 100 });
  const categories = data?.data ?? [];
  const createCategory = useCreateInventoryItemCategory();
  const setStatus = useSetInventoryItemCategoryStatus();

  function handleCreate() {
    if (!name.trim()) return;
    createCategory.mutate(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          enqueueSnackbar('Categoría creada correctamente', { variant: 'success' });
          setName('');
          setDescription('');
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  }

  function handleToggle(id: string, isActive: boolean) {
    setStatus.mutate(
      { id, isActive: !isActive },
      {
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Categorías de inventario</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Agrupa insumos de cocina, mobiliario, vajilla u otros artículos del local.
        </Typography>

        <Stack spacing={1} sx={{ mb: 2, maxHeight: 260, overflowY: 'auto' }}>
          {categories.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No hay categorías todavía.
            </Typography>
          ) : (
            categories.map((category) => (
              <Box
                key={category.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {category.name}
                  </Typography>
                  {category.description && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {category.description}
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
                  <StatusChip
                    label={category.isActive ? 'Activa' : 'Inactiva'}
                    tone={category.isActive ? 'success' : 'neutral'}
                  />
                  <Button size="small" onClick={() => handleToggle(category.id, category.isActive)}>
                    {category.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                </Stack>
              </Box>
            ))
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Nueva categoría
          </Typography>
          <TextField
            size="small"
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            size="small"
            label="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
          <Button
            variant="outlined"
            startIcon={<Plus size={16} />}
            onClick={handleCreate}
            loading={createCategory.isPending}
            disabled={!name.trim()}
            sx={{ alignSelf: 'flex-start' }}
          >
            Agregar categoría
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
