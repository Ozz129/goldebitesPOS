import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Phone, Mail, Calendar, Pencil, Trash2 } from 'lucide-react';
import { useSnackbar } from 'notistack';
import DetailDrawer from '../../../components/common/DetailDrawer';
import StatusChip from '../../../components/common/StatusChip';
import DateDisplay from '../../../components/common/DateDisplay';
import { Can } from '../../../modules/auth/components/can';
import { useEmployee } from '../../../modules/employees/hooks/use-employee';
import { useSetEmployeeShifts } from '../../../modules/employees/hooks/use-set-employee-shifts';
import { normalizeApiError } from '../../../lib/api/api-error';
import { EMPLOYEE_STATUS_LABELS, EMPLOYEE_STATUS_TONE, WEEKDAY_LABELS } from '../../../modules/employees/employee-status';
import type { Employee, ShiftInput } from '../../../modules/employees/types/employee.types';
import EmployeeCredentialsSection from './EmployeeCredentialsSection';

interface EmployeeDetailDrawerProps {
  employeeId: string | null;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

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

export default function EmployeeDetailDrawer({
  employeeId,
  onClose,
  onEdit,
  onDelete,
}: EmployeeDetailDrawerProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { data: employee } = useEmployee(employeeId);
  const setShifts = useSetEmployeeShifts();

  const [rows, setRows] = useState<DayRow[] | null>(null);
  const [trackedEmployeeId, setTrackedEmployeeId] = useState<string | null>(null);

  if (employee && employee.id !== trackedEmployeeId) {
    setTrackedEmployeeId(employee.id);
    setRows(buildInitialRows(employee.shifts));
  }

  if (!employeeId || !employee || !rows) return null;

  const fullName = `${employee.firstName} ${employee.lastName}`;

  const updateRow = (index: number, patch: Partial<DayRow>) => {
    setRows((prev) => prev!.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const handleSaveShifts = () => {
    const shifts: ShiftInput[] = rows
      .map((row, dayOfWeek) => ({ ...row, dayOfWeek }))
      .filter((row) => row.enabled)
      .map((row) => ({ dayOfWeek: row.dayOfWeek, startTime: row.startTime, endTime: row.endTime }));

    setShifts.mutate(
      { id: employee.id, shifts },
      {
        onSuccess: () => enqueueSnackbar('Horario actualizado correctamente', { variant: 'success' }),
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  };

  return (
    <DetailDrawer
      open={Boolean(employeeId)}
      onClose={onClose}
      title={fullName}
      subtitle={employee.position ?? undefined}
      headerExtra={
        <StatusChip label={EMPLOYEE_STATUS_LABELS[employee.status]} tone={EMPLOYEE_STATUS_TONE[employee.status]} />
      }
      footer={
        <Can permission="employees.manage">
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
            <Button color="error" startIcon={<Trash2 size={16} />} onClick={() => onDelete(employee)}>
              Eliminar
            </Button>
            <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => onEdit(employee)}>
              Editar
            </Button>
          </Stack>
        </Can>
      }
    >
      <Stack spacing={3}>
        <Stack spacing={1}>
          {employee.phone && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <Phone size={14} />
              <Typography variant="body2">{employee.phone}</Typography>
            </Stack>
          )}
          {employee.email && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <Mail size={14} />
              <Typography variant="body2">{employee.email}</Typography>
            </Stack>
          )}
          {employee.hireDate && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <Calendar size={14} />
              <Typography variant="body2" component="span">
                Ingreso: <DateDisplay value={employee.hireDate} component="span" variant="body2" sx={{ fontWeight: 600 }} />
              </Typography>
            </Stack>
          )}
        </Stack>

        <Divider />

        <EmployeeCredentialsSection employee={employee} />

        <Divider />

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Horario semanal
          </Typography>
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
          <Can permission="employees.manage">
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 1.5 }}
              loading={setShifts.isPending}
              onClick={handleSaveShifts}
            >
              Guardar horario
            </Button>
          </Can>
        </Box>

        {employee.notes && (
          <>
            <Divider />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Observaciones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {employee.notes}
              </Typography>
            </Box>
          </>
        )}
      </Stack>
    </DetailDrawer>
  );
}
