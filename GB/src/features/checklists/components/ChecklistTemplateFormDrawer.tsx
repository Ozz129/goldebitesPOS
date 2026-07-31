import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Plus, Trash2 } from 'lucide-react';
import FormDrawer from '../../../components/common/FormDrawer';
import { CHECKLIST_TYPE_LABELS } from '../../../modules/checklists/checklist-status';
import { checklistTemplateSchema, type ChecklistTemplateFormValues } from '../schemas/checklistTemplateSchema';
import type { ChecklistTemplateWithItems } from '../../../modules/checklists/types/checklist.types';

interface ChecklistTemplateFormDrawerProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: ChecklistTemplateFormValues, items: string[]) => void;
  initialTemplate?: ChecklistTemplateWithItems | null;
}

const emptyValues: ChecklistTemplateFormValues = { type: 'OPENING', name: '' };

export default function ChecklistTemplateFormDrawer({
  open,
  loading,
  onClose,
  onSubmit,
  initialTemplate,
}: ChecklistTemplateFormDrawerProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChecklistTemplateFormValues>({
    resolver: zodResolver(checklistTemplateSchema),
    defaultValues: emptyValues,
  });

  const [items, setItems] = useState<string[]>(['']);
  const [initializedKey, setInitializedKey] = useState<string | null>(null);
  const currentKey = initialTemplate?.id ?? 'new';

  if (open && initializedKey !== currentKey) {
    setInitializedKey(currentKey);
    reset(initialTemplate ? { type: initialTemplate.type, name: initialTemplate.name } : emptyValues);
    setItems(
      initialTemplate && initialTemplate.items.length > 0
        ? initialTemplate.items.map((item) => item.label)
        : [''],
    );
  } else if (!open && initializedKey !== null) {
    setInitializedKey(null);
  }

  const updateItem = (index: number, label: string) => {
    setItems((prev) => prev.map((value, i) => (i === index ? label : value)));
  };

  const addItem = () => setItems((prev) => [...prev, '']);

  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const validItems = items.map((label) => label.trim()).filter(Boolean);

  const submit = handleSubmit((values) => onSubmit(values, validItems));

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      onSubmit={submit}
      title={initialTemplate ? 'Editar plantilla' : 'Nueva plantilla'}
      submitLabel={initialTemplate ? 'Guardar cambios' : 'Crear plantilla'}
      loading={loading}
      submitDisabled={validItems.length === 0}
      width={480}
    >
      <Stack spacing={2.5}>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <TextField {...field} select label="Tipo" fullWidth>
              {Object.entries(CHECKLIST_TYPE_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nombre"
              fullWidth
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
            />
          )}
        />

        <Stack spacing={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Ítems a verificar
          </Typography>
          {items.map((label, index) => (
            <Stack key={index} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <TextField
                size="small"
                fullWidth
                value={label}
                placeholder={`Ítem ${index + 1}`}
                onChange={(e) => updateItem(index, e.target.value)}
              />
              <IconButton
                size="small"
                aria-label="Eliminar ítem"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
              >
                <Trash2 size={16} />
              </IconButton>
            </Stack>
          ))}
          <Button size="small" startIcon={<Plus size={16} />} onClick={addItem} sx={{ alignSelf: 'flex-start' }}>
            Agregar ítem
          </Button>
          {validItems.length === 0 && (
            <Typography variant="caption" color="error">
              Agrega al menos un ítem
            </Typography>
          )}
        </Stack>
      </Stack>
    </FormDrawer>
  );
}
