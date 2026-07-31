import { useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import type { ColumnDef } from '@tanstack/react-table';
import { Sunrise, Moon, PlayCircle, Plus } from 'lucide-react';
import { useSnackbar } from 'notistack';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/common/DataTable';
import StatusChip from '../../../components/common/StatusChip';
import DateDisplay from '../../../components/common/DateDisplay';
import ErrorState from '../../../components/common/ErrorState';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { Can } from '../../../modules/auth/components/can';
import { useAuthStore } from '../../../modules/auth/store/auth.store';
import { brand } from '../../../theme/palette';
import { useChecklistTemplates } from '../../../modules/checklists/hooks/use-checklist-templates';
import { useCreateChecklistTemplate } from '../../../modules/checklists/hooks/use-create-checklist-template';
import { useUpdateChecklistTemplate } from '../../../modules/checklists/hooks/use-update-checklist-template';
import { useReplaceChecklistTemplateItems } from '../../../modules/checklists/hooks/use-replace-checklist-template-items';
import { useSetChecklistTemplateStatus } from '../../../modules/checklists/hooks/use-set-checklist-template-status';
import { useDeleteChecklistTemplate } from '../../../modules/checklists/hooks/use-delete-checklist-template';
import { useChecklistRuns } from '../../../modules/checklists/hooks/use-checklist-runs';
import { useStartChecklistRun } from '../../../modules/checklists/hooks/use-start-checklist-run';
import { normalizeApiError } from '../../../lib/api/api-error';
import {
  CHECKLIST_RUN_STATUS_LABELS,
  CHECKLIST_RUN_STATUS_TONE,
  CHECKLIST_TYPE_LABELS,
} from '../../../modules/checklists/checklist-status';
import type { ChecklistRun, ChecklistTemplate, ChecklistTemplateWithItems } from '../../../modules/checklists/types/checklist.types';
import type { ChecklistTemplateFormValues } from '../schemas/checklistTemplateSchema';
import ChecklistRunDrawer from '../components/ChecklistRunDrawer';
import ChecklistTemplateFormDrawer from '../components/ChecklistTemplateFormDrawer';
import ChecklistTemplateDetailDrawer from '../components/ChecklistTemplateDetailDrawer';

export default function ChecklistsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const branchId = useAuthStore((s) => s.user?.branchId ?? null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplateWithItems | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<ChecklistTemplateWithItems | null>(null);
  const [detailTemplateId, setDetailTemplateId] = useState<string | null>(null);
  const [runningRunId, setRunningRunId] = useState<string | null>(null);

  const { data: templatesData, isLoading: templatesLoading, isError: templatesError, refetch: refetchTemplates } =
    useChecklistTemplates({ limit: 100 });
  const { data: runsData, isLoading: runsLoading, isError: runsError, refetch: refetchRuns } = useChecklistRuns({
    branchId: branchId ?? undefined,
    limit: 50,
  });

  const createTemplate = useCreateChecklistTemplate();
  const updateTemplate = useUpdateChecklistTemplate();
  const replaceItems = useReplaceChecklistTemplateItems();
  const setStatus = useSetChecklistTemplateStatus();
  const deleteTemplate = useDeleteChecklistTemplate();
  const startRun = useStartChecklistRun();

  const templates = useMemo(() => templatesData?.data ?? [], [templatesData]);
  const activeTemplates = useMemo(() => templates.filter((t) => t.isActive), [templates]);
  const runs = runsData?.data ?? [];
  const templateNameById = useMemo(() => new Map(templates.map((t) => [t.id, t.name])), [templates]);

  const handleStart = (templateId: string) => {
    if (!branchId) {
      enqueueSnackbar('Tu usuario no tiene una sucursal asignada', { variant: 'error' });
      return;
    }
    startRun.mutate(
      { branchId, templateId },
      {
        onSuccess: (run) => setRunningRunId(run.id),
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  };

  const handleTemplateSubmit = (values: ChecklistTemplateFormValues, items: string[]) => {
    if (editingTemplate) {
      updateTemplate.mutate(
        { id: editingTemplate.id, payload: values },
        {
          onSuccess: () => {
            replaceItems.mutate(
              { id: editingTemplate.id, items: items.map((label) => ({ label })) },
              {
                onSuccess: () => {
                  enqueueSnackbar('Plantilla actualizada correctamente', { variant: 'success' });
                  setFormOpen(false);
                },
                onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
              },
            );
          },
          onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
        },
      );
    } else {
      createTemplate.mutate(
        { ...values, items: items.map((label) => ({ label })) },
        {
          onSuccess: () => {
            enqueueSnackbar('Plantilla creada correctamente', { variant: 'success' });
            setFormOpen(false);
          },
          onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
        },
      );
    }
  };

  const handleDelete = () => {
    if (!deletingTemplate) return;
    deleteTemplate.mutate(deletingTemplate.id, {
      onSuccess: () => enqueueSnackbar('Plantilla eliminada', { variant: 'success' }),
      onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      onSettled: () => setDeletingTemplate(null),
    });
  };

  const templateColumns: ColumnDef<ChecklistTemplate, unknown>[] = [
    { accessorKey: 'name', header: 'Nombre' },
    {
      id: 'type',
      header: 'Tipo',
      cell: ({ row }) => CHECKLIST_TYPE_LABELS[row.original.type],
    },
    {
      id: 'status',
      header: 'Estado',
      cell: ({ row }) => (
        <StatusChip label={row.original.isActive ? 'Activa' : 'Inactiva'} tone={row.original.isActive ? 'success' : 'neutral'} />
      ),
    },
  ];

  const runColumns: ColumnDef<ChecklistRun, unknown>[] = [
    {
      id: 'template',
      header: 'Checklist',
      cell: ({ row }) => templateNameById.get(row.original.templateId) ?? '—',
    },
    {
      id: 'startedAt',
      header: 'Fecha y hora',
      cell: ({ row }) => <DateDisplay value={row.original.startedAt} mode="datetime" variant="body2" />,
    },
    {
      id: 'status',
      header: 'Estado',
      cell: ({ row }) => (
        <StatusChip
          label={CHECKLIST_RUN_STATUS_LABELS[row.original.status]}
          tone={CHECKLIST_RUN_STATUS_TONE[row.original.status]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Checklists"
        subtitle="Rutinas de apertura y cierre con evidencia de cumplimiento."
        breadcrumbs={[{ label: 'Checklists' }]}
        actions={
          <Can permission="checklists.manage">
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => {
                setEditingTemplate(null);
                setFormOpen(true);
              }}
            >
              Nueva plantilla
            </Button>
          </Can>
        }
      />

      {templatesError ? (
        <ErrorState onRetry={() => refetchTemplates()} />
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {!templatesLoading && activeTemplates.length === 0 && (
            <Grid size={12}>
              <Typography variant="body2" color="text.secondary">
                No hay plantillas activas. Crea una plantilla para poder iniciar un checklist.
              </Typography>
            </Grid>
          )}
          {activeTemplates.map((template) => {
            const Icon = template.type === 'OPENING' ? Sunrise : Moon;
            const lastRun = runs
              .filter((r) => r.templateId === template.id)
              .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];
            return (
              <Grid key={template.id} size={{ xs: 12, sm: 6 }}>
                <Card>
                  <CardContent>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: 'center', cursor: 'pointer' }}
                      onClick={() => setDetailTemplateId(template.id)}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: alpha(brand.gold, 0.12),
                          color: brand.gold,
                        }}
                      >
                        <Icon size={20} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {template.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {CHECKLIST_TYPE_LABELS[template.type]}
                        </Typography>
                      </Box>
                    </Stack>

                    {lastRun && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                        Última ejecución: <DateDisplay value={lastRun.startedAt} mode="datetime" component="span" variant="caption" />
                      </Typography>
                    )}

                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PlayCircle size={16} />}
                      sx={{ mt: 2 }}
                      loading={startRun.isPending}
                      onClick={() => handleStart(template.id)}
                    >
                      Iniciar checklist
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        Plantillas
      </Typography>
      <DataTable
        columns={templateColumns}
        data={templates}
        isLoading={templatesLoading}
        onRowClick={(row) => setDetailTemplateId(row.id)}
        emptyTitle="Aún no hay plantillas de checklist"
        pageSize={5}
      />

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1.5 }}>
        Historial de ejecuciones
      </Typography>
      {runsError ? (
        <ErrorState onRetry={() => refetchRuns()} />
      ) : (
        <DataTable
          columns={runColumns}
          data={runs}
          isLoading={runsLoading}
          emptyTitle="Aún no hay checklists ejecutados"
          emptyDescription="Inicia una rutina de apertura o cierre para ver el historial aquí."
          pageSize={10}
        />
      )}

      <ChecklistTemplateDetailDrawer
        templateId={detailTemplateId}
        onClose={() => setDetailTemplateId(null)}
        onEdit={(template) => {
          setDetailTemplateId(null);
          setEditingTemplate(template);
          setFormOpen(true);
        }}
        onDelete={(template) => {
          setDetailTemplateId(null);
          setDeletingTemplate(template);
        }}
        onToggleStatus={(template) =>
          setStatus.mutate(
            { id: template.id, isActive: !template.isActive },
            {
              onSuccess: () =>
                enqueueSnackbar(template.isActive ? 'Plantilla desactivada' : 'Plantilla activada', {
                  variant: 'success',
                }),
              onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
            },
          )
        }
        toggling={setStatus.isPending}
      />

      <ChecklistTemplateFormDrawer
        open={formOpen}
        loading={createTemplate.isPending || updateTemplate.isPending || replaceItems.isPending}
        initialTemplate={editingTemplate}
        onClose={() => setFormOpen(false)}
        onSubmit={handleTemplateSubmit}
      />

      <ConfirmDialog
        open={Boolean(deletingTemplate)}
        title="Eliminar plantilla"
        description={`¿Seguro que deseas eliminar la plantilla "${deletingTemplate?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        onClose={() => setDeletingTemplate(null)}
        onConfirm={handleDelete}
      />

      <ChecklistRunDrawer
        runId={runningRunId}
        onClose={() => setRunningRunId(null)}
        onComplete={() => {
          enqueueSnackbar('Checklist finalizado correctamente', { variant: 'success' });
          setRunningRunId(null);
        }}
      />
    </>
  );
}
