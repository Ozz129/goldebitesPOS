import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Trash2, Search, Save, Play, Sparkles } from 'lucide-react';
import { useSnackbar } from 'notistack';
import DataTable from '../../../components/common/DataTable';
import StatusChip from '../../../components/common/StatusChip';
import CurrencyField from '../../../components/common/CurrencyField';
import { Can } from '../../../modules/auth/components/can';
import { usePermissions } from '../../../modules/auth/hooks/use-permissions';
import { useAuthStore } from '../../../modules/auth/store/auth.store';
import { useInventoryItemCategories } from '../../../modules/inventory-item-categories/hooks/use-inventory-item-categories';
import { useInventoryQueryTemplates } from '../../../modules/inventory/hooks/use-inventory-query-templates';
import { useRunInventoryQuery } from '../../../modules/inventory/hooks/use-run-inventory-query';
import { useRunInventoryQueryTemplate } from '../../../modules/inventory/hooks/use-run-inventory-query-template';
import { useSaveInventoryQueryTemplate } from '../../../modules/inventory/hooks/use-save-inventory-query-template';
import { useDeleteInventoryQueryTemplate } from '../../../modules/inventory/hooks/use-delete-inventory-query-template';
import { isPaginatedQueryResult } from '../../../modules/inventory/api/inventory-query.api';
import { normalizeApiError } from '../../../lib/api/api-error';
import { formatCOP } from '../../../utils/format';
import {
  INVENTORY_QUERY_FIELD_LABELS,
  INVENTORY_QUERY_FIELD_TYPE,
  INVENTORY_QUERY_INTENT_LABELS,
  INVENTORY_QUERY_OPERATOR_LABELS,
  INVENTORY_QUERY_OPERATORS_BY_TYPE,
} from '../../../modules/inventory/types/inventory-query.types';
import type {
  InventoryQueryCondition,
  InventoryQueryField,
  InventoryQueryIntent,
  InventoryQueryResultItem,
  InventoryQueryTemplate,
} from '../../../modules/inventory/types/inventory-query.types';

const FIELD_OPTIONS = Object.keys(INVENTORY_QUERY_FIELD_LABELS) as InventoryQueryField[];
const INTENT_OPTIONS = Object.keys(INVENTORY_QUERY_INTENT_LABELS) as InventoryQueryIntent[];

type QueryResultState =
  | { intent: 'detail'; items: InventoryQueryResultItem[] }
  | { intent: Exclude<InventoryQueryIntent, 'detail'>; value: number };

function formatAggregateValue(intent: Exclude<InventoryQueryIntent, 'detail'>, value: number): string {
  if (intent === 'totalValue' || intent === 'averageCost') return formatCOP(value);
  if (intent === 'count') return String(Math.round(value));
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 3 }).format(value);
}

function defaultCondition(field: InventoryQueryField = 'name'): InventoryQueryCondition {
  const type = INVENTORY_QUERY_FIELD_TYPE[field];
  return { field, operator: INVENTORY_QUERY_OPERATORS_BY_TYPE[type][0] };
}

const columns: ColumnDef<InventoryQueryResultItem, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Insumo',
    cell: ({ row }) => (
      <Stack>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {row.original.name}
        </Typography>
        {row.original.sku && (
          <Typography variant="caption" color="text.secondary">
            Referencia: {row.original.sku}
          </Typography>
        )}
      </Stack>
    ),
  },
  {
    id: 'category',
    header: 'Categoría',
    cell: ({ row }) =>
      row.original.categoryName ?? (
        <Typography variant="body2" color="text.secondary">
          Sin categoría
        </Typography>
      ),
  },
  {
    id: 'stock',
    header: 'Stock',
    cell: ({ row }) => `${row.original.currentStock} / mín. ${row.original.minimumStock} ${row.original.unit}`,
  },
  {
    accessorKey: 'currentCost',
    header: 'Costo',
    cell: ({ getValue }) => formatCOP(getValue<number>()),
  },
  {
    id: 'status',
    header: 'Estado',
    cell: ({ row }) => (
      <StatusChip label={row.original.isActive ? 'Activo' : 'Inactivo'} tone={row.original.isActive ? 'success' : 'neutral'} />
    ),
  },
];

export default function SpecializedQueriesTab() {
  const { enqueueSnackbar } = useSnackbar();
  const branchId = useAuthStore((s) => s.user?.branchId ?? undefined);
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('inventory.manage');

  const [conditions, setConditions] = useState<InventoryQueryCondition[]>([defaultCondition()]);
  const [intent, setIntent] = useState<InventoryQueryIntent>('detail');
  const [result, setResult] = useState<QueryResultState | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const { data: categoriesData } = useInventoryItemCategories({ limit: 100 });
  const categories = categoriesData?.data ?? [];
  const { data: templates = [] } = useInventoryQueryTemplates();

  const runQuery = useRunInventoryQuery();
  const runTemplate = useRunInventoryQueryTemplate();
  const saveTemplate = useSaveInventoryQueryTemplate();
  const deleteTemplate = useDeleteInventoryQueryTemplate();

  const updateCondition = (index: number, patch: Partial<InventoryQueryCondition>) => {
    setConditions((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const handleFieldChange = (index: number, field: InventoryQueryField) => {
    setConditions((prev) => prev.map((c, i) => (i === index ? defaultCondition(field) : c)));
  };

  const handleSearch = () => {
    runQuery.mutate(
      { conditions, intent, branchId, limit: 100 },
      {
        onSuccess: (response) => {
          if (isPaginatedQueryResult(response)) {
            setResult({ intent: 'detail', items: response.data });
          } else {
            setResult({ intent: response.data.intent, value: response.data.value });
          }
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  };

  const handleRunTemplate = (template: InventoryQueryTemplate) => {
    runTemplate.mutate(
      { id: template.id, branchId },
      {
        onSuccess: (response) => {
          if (isPaginatedQueryResult(response)) {
            setResult({ intent: 'detail', items: response.data });
          } else {
            setResult({ intent: response.data.intent, value: response.data.value });
          }
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    saveTemplate.mutate(
      { name: templateName.trim(), conditions, intent },
      {
        onSuccess: () => {
          enqueueSnackbar('Plantilla guardada correctamente', { variant: 'success' });
          setSaveDialogOpen(false);
          setTemplateName('');
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate.mutate(id, {
      onSuccess: () => enqueueSnackbar('Plantilla eliminada', { variant: 'success' }),
      onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
    });
  };

  return (
    <Box>
      {templates.length > 0 && (
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Plantillas guardadas
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {templates.map((template) => (
              <Chip
                key={template.id}
                label={template.name}
                icon={<Play size={13} />}
                onClick={() => handleRunTemplate(template)}
                onDelete={canManage ? () => handleDeleteTemplate(template.id) : undefined}
                deleteIcon={<Trash2 size={13} />}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>
        </Box>
      )}

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        Intención
      </Typography>
      <TextField
        select
        size="small"
        label="¿Qué quieres obtener?"
        value={intent}
        onChange={(e) => setIntent(e.target.value as InventoryQueryIntent)}
        sx={{ minWidth: 280, mb: 2.5 }}
      >
        {INTENT_OPTIONS.map((option) => (
          <MenuItem key={option} value={option}>
            {INVENTORY_QUERY_INTENT_LABELS[option]}
          </MenuItem>
        ))}
      </TextField>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        Constructor de condiciones
      </Typography>
      <Stack spacing={1.5} sx={{ mb: 2 }}>
        {conditions.map((condition, index) => {
          const fieldType = INVENTORY_QUERY_FIELD_TYPE[condition.field];
          const operators = INVENTORY_QUERY_OPERATORS_BY_TYPE[fieldType];
          return (
            <Stack key={index} direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                select
                size="small"
                label="Campo"
                value={condition.field}
                onChange={(e) => handleFieldChange(index, e.target.value as InventoryQueryField)}
                sx={{ minWidth: 170 }}
              >
                {FIELD_OPTIONS.map((field) => (
                  <MenuItem key={field} value={field}>
                    {INVENTORY_QUERY_FIELD_LABELS[field]}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                size="small"
                label="Operador"
                value={condition.operator}
                onChange={(e) =>
                  updateCondition(index, { operator: e.target.value as InventoryQueryCondition['operator'], value: undefined, value2: undefined, values: undefined })
                }
                sx={{ minWidth: 170 }}
              >
                {operators.map((operator) => (
                  <MenuItem key={operator} value={operator}>
                    {INVENTORY_QUERY_OPERATOR_LABELS[operator]}
                  </MenuItem>
                ))}
              </TextField>

              <ConditionValueInput
                condition={condition}
                categories={categories}
                onChange={(patch) => updateCondition(index, patch)}
              />

              <IconButton
                size="small"
                disabled={conditions.length === 1}
                onClick={() => setConditions((prev) => prev.filter((_, i) => i !== index))}
              >
                <Trash2 size={15} />
              </IconButton>
            </Stack>
          );
        })}
        <Button
          size="small"
          startIcon={<Plus size={15} />}
          onClick={() => setConditions((prev) => [...prev, defaultCondition()])}
          sx={{ alignSelf: 'flex-start' }}
        >
          Agregar condición
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Button variant="contained" startIcon={<Search size={16} />} onClick={handleSearch} loading={runQuery.isPending}>
          Buscar
        </Button>
        <Can permission="inventory.manage">
          <Button variant="outlined" startIcon={<Save size={16} />} onClick={() => setSaveDialogOpen(true)}>
            Guardar como plantilla
          </Button>
        </Can>
      </Stack>

      {result !== null && result.intent === 'detail' && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Resultados {result.items.length > 0 && `(${result.items.length})`}
          </Typography>
          <DataTable
            columns={columns}
            data={result.items}
            emptyTitle="Sin resultados"
            emptyDescription="Ningún insumo cumple con las condiciones armadas."
            pageSize={10}
          />
        </>
      )}

      {result !== null && result.intent !== 'detail' && (
        <Box sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', maxWidth: 320 }}>
          <Typography variant="body2" color="text.secondary">
            {INVENTORY_QUERY_INTENT_LABELS[result.intent]}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
            {formatAggregateValue(result.intent, result.value)}
          </Typography>
        </Box>
      )}

      {result === null && (
        <Stack sx={{ alignItems: 'center', py: 4, opacity: 0.6 }}>
          <Sparkles size={28} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Arma tus condiciones y haz clic en "Buscar" para ver los resultados.
          </Typography>
        </Stack>
      )}

      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Guardar como plantilla</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nombre de la plantilla"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setSaveDialogOpen(false)}>
            Cancelar
          </Button>
          <Button variant="contained" disabled={!templateName.trim()} loading={saveTemplate.isPending} onClick={handleSaveTemplate}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

interface ConditionValueInputProps {
  condition: InventoryQueryCondition;
  categories: { id: string; name: string }[];
  onChange: (patch: Partial<InventoryQueryCondition>) => void;
}

function ConditionValueInput({ condition, categories, onChange }: ConditionValueInputProps) {
  const { field, operator } = condition;
  const fieldType = INVENTORY_QUERY_FIELD_TYPE[field];

  if (operator === 'isEmpty' || operator === 'isNotEmpty') {
    return null;
  }

  if (fieldType === 'category') {
    if (operator === 'in') {
      return (
        <TextField
          select
          size="small"
          label="Categorías"
          value={condition.values ?? []}
          onChange={(e) => onChange({ values: typeof e.target.value === 'string' ? [e.target.value] : (e.target.value as unknown as string[]) })}
          slotProps={{ select: { multiple: true } }}
          sx={{ minWidth: 200 }}
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>
      );
    }
    return (
      <TextField
        select
        size="small"
        label="Categoría"
        value={condition.value ?? ''}
        onChange={(e) => onChange({ value: e.target.value })}
        sx={{ minWidth: 180 }}
      >
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  if (fieldType === 'boolean') {
    return (
      <TextField
        select
        size="small"
        label="Valor"
        value={condition.value === undefined ? 'true' : String(condition.value)}
        onChange={(e) => onChange({ value: e.target.value === 'true' })}
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="true">Sí</MenuItem>
        <MenuItem value="false">No</MenuItem>
      </TextField>
    );
  }

  if (fieldType === 'number') {
    const isMoney = field === 'currentCost';
    if (operator === 'between') {
      return (
        <Stack direction="row" spacing={1}>
          {isMoney ? (
            <>
              <CurrencyField
                size="small"
                label="Desde"
                value={condition.value === undefined ? '' : Number(condition.value)}
                onChange={(value) => onChange({ value })}
                sx={{ width: 130 }}
              />
              <CurrencyField
                size="small"
                label="Hasta"
                value={condition.value2 === undefined ? '' : Number(condition.value2)}
                onChange={(value) => onChange({ value2: value })}
                sx={{ width: 130 }}
              />
            </>
          ) : (
            <>
              <TextField
                size="small"
                type="number"
                label="Desde"
                value={condition.value ?? ''}
                onChange={(e) => onChange({ value: e.target.value === '' ? undefined : Number(e.target.value) })}
                sx={{ width: 110 }}
              />
              <TextField
                size="small"
                type="number"
                label="Hasta"
                value={condition.value2 ?? ''}
                onChange={(e) => onChange({ value2: e.target.value === '' ? undefined : Number(e.target.value) })}
                sx={{ width: 110 }}
              />
            </>
          )}
        </Stack>
      );
    }
    if (isMoney) {
      return (
        <CurrencyField
          size="small"
          label="Valor"
          value={condition.value === undefined ? '' : Number(condition.value)}
          onChange={(value) => onChange({ value })}
          sx={{ width: 140 }}
        />
      );
    }
    return (
      <TextField
        size="small"
        type="number"
        label="Valor"
        value={condition.value ?? ''}
        onChange={(e) => onChange({ value: e.target.value === '' ? undefined : Number(e.target.value) })}
        sx={{ width: 130 }}
      />
    );
  }

  if (fieldType === 'date') {
    if (operator === 'between') {
      return (
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            type="date"
            label="Desde"
            value={condition.value ?? ''}
            onChange={(e) => onChange({ value: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            size="small"
            type="date"
            label="Hasta"
            value={condition.value2 ?? ''}
            onChange={(e) => onChange({ value2: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
      );
    }
    return (
      <TextField
        size="small"
        type="date"
        label="Valor"
        value={condition.value ?? ''}
        onChange={(e) => onChange({ value: e.target.value })}
        slotProps={{ inputLabel: { shrink: true } }}
      />
    );
  }

  return (
    <TextField
      size="small"
      label="Valor"
      value={condition.value ?? ''}
      onChange={(e) => onChange({ value: e.target.value })}
      sx={{ minWidth: 160 }}
    />
  );
}
