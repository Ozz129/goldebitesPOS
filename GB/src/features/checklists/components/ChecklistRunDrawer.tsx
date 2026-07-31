import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';
import { useSnackbar } from 'notistack';
import FormDrawer from '../../../components/common/FormDrawer';
import { useChecklistRun } from '../../../modules/checklists/hooks/use-checklist-run';
import { useUpdateRunItems } from '../../../modules/checklists/hooks/use-update-run-items';
import { useCompleteChecklistRun } from '../../../modules/checklists/hooks/use-complete-checklist-run';
import { normalizeApiError } from '../../../lib/api/api-error';

interface ChecklistRunDrawerProps {
  runId: string | null;
  onClose: () => void;
  onComplete: () => void;
}

export default function ChecklistRunDrawer({ runId, onClose, onComplete }: ChecklistRunDrawerProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { data: run } = useChecklistRun(runId);
  const updateItems = useUpdateRunItems();
  const completeRun = useCompleteChecklistRun();
  const [observations, setObservations] = useState('');

  if (!runId || !run) return null;

  const checkedCount = run.items.filter((item) => item.checked).length;
  const progress = run.items.length > 0 ? (checkedCount / run.items.length) * 100 : 0;

  const handleToggle = (itemId: string, checked: boolean) => {
    updateItems.mutate(
      { id: run.id, items: [{ id: itemId, checked }] },
      { onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }) },
    );
  };

  return (
    <FormDrawer
      open={Boolean(runId)}
      onClose={onClose}
      title="Checklist en progreso"
      submitLabel="Finalizar checklist"
      loading={completeRun.isPending}
      onSubmit={() => {
        completeRun.mutate(
          { id: run.id, observations: observations || undefined },
          {
            onSuccess: () => onComplete(),
            onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
          },
        );
      }}
    >
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            {checkedCount} de {run.items.length} ítems completados
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Stack>

        <Stack spacing={0.5}>
          {run.items.map((item) => (
            <FormControlLabel
              key={item.id}
              control={
                <Checkbox checked={item.checked} onChange={(e) => handleToggle(item.id, e.target.checked)} />
              }
              label={item.label}
            />
          ))}
        </Stack>

        <TextField
          label="Observaciones (ítems incumplidos, evidencias, notas)"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          multiline
          minRows={3}
          fullWidth
        />
      </Stack>
    </FormDrawer>
  );
}
