import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import { WEEKDAY_LABELS } from '../../../modules/employees/employee-status';
import type { ShiftInput } from '../../../modules/employees/types/employee.types';

interface DayRow {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

function buildInitialRows(shifts: { dayOfWeek: number; startTime: string; endTime: string }[]): DayRow[] {
  return WEEKDAY_LABELS.map((_, dayOfWeek) => {
    const existing = shifts.find((s) => s.dayOfWeek === dayOfWeek);
    return existing
      ? { enabled: true, startTime: existing.startTime.slice(0, 5), endTime: existing.endTime.slice(0, 5) }
      : { enabled: false, startTime: '08:00', endTime: '16:00' };
  });
}

interface WeeklyScheduleEditorProps {
  /** Rows reset from `shifts` whenever this changes — e.g. an employee id, or "me" for the single self-service instance. */
  resetKey: string;
  shifts: { dayOfWeek: number; startTime: string; endTime: string }[];
  onSave: (shifts: ShiftInput[]) => void;
  saving?: boolean;
  saveLabel?: string;
}

/** Checkbox + start/end time per weekday, shared by the admin employee drawer and the self-service "Mi horario" section. */
export default function WeeklyScheduleEditor({
  resetKey,
  shifts,
  onSave,
  saving,
  saveLabel = 'Guardar horario',
}: WeeklyScheduleEditorProps) {
  const [rows, setRows] = useState<DayRow[]>(() => buildInitialRows(shifts));
  const [trackedKey, setTrackedKey] = useState(resetKey);

  if (resetKey !== trackedKey) {
    setTrackedKey(resetKey);
    setRows(buildInitialRows(shifts));
  }

  const updateRow = (index: number, patch: Partial<DayRow>) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const handleSave = () => {
    const nextShifts: ShiftInput[] = rows
      .map((row, dayOfWeek) => ({ ...row, dayOfWeek }))
      .filter((row) => row.enabled)
      .map((row) => ({ dayOfWeek: row.dayOfWeek, startTime: row.startTime, endTime: row.endTime }));
    onSave(nextShifts);
  };

  return (
    <Stack spacing={1}>
      <Stack spacing={1}>
        {WEEKDAY_LABELS.map((label, index) => (
          <Stack key={label} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <FormControlLabel
              sx={{ width: 90, m: 0 }}
              control={
                <Checkbox
                  size="small"
                  checked={rows[index].enabled}
                  onChange={(e) => updateRow(index, { enabled: e.target.checked })}
                />
              }
              label={label}
            />
            <TextField
              size="small"
              type="time"
              value={rows[index].startTime}
              disabled={!rows[index].enabled}
              onChange={(e) => updateRow(index, { startTime: e.target.value })}
              sx={{ width: 120 }}
            />
            <Typography variant="body2" color="text.secondary">
              a
            </Typography>
            <TextField
              size="small"
              type="time"
              value={rows[index].endTime}
              disabled={!rows[index].enabled}
              onChange={(e) => updateRow(index, { endTime: e.target.value })}
              sx={{ width: 120 }}
            />
          </Stack>
        ))}
      </Stack>
      <Button variant="outlined" size="small" sx={{ mt: 0.5, alignSelf: 'flex-start' }} loading={saving} onClick={handleSave}>
        {saveLabel}
      </Button>
    </Stack>
  );
}
