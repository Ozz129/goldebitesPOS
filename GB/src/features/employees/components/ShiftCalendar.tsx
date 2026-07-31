import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useQueries } from '@tanstack/react-query';
import { alpha } from '@mui/material/styles';
import { brand } from '../../../theme/palette';
import { employeesApi } from '../../../modules/employees/api/employees.api';
import { employeeKeys } from '../../../modules/employees/api/employees.keys';
import { WEEKDAY_LABELS } from '../../../modules/employees/employee-status';
import type { Employee } from '../../../modules/employees/types/employee.types';

export default function ShiftCalendar({ employees }: { employees: Employee[] }) {
  const active = employees.filter((e) => e.status === 'ACTIVE');

  const results = useQueries({
    queries: active.map((employee) => ({
      queryKey: employeeKeys.detail(employee.id),
      queryFn: () => employeesApi.getEmployee(employee.id),
      staleTime: 30_000,
    })),
  });

  const withShifts = active
    .map((employee, index) => ({ employee, shifts: results[index]?.data?.shifts ?? [] }))
    .filter((entry) => entry.shifts.length > 0);

  if (withShifts.length === 0) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Calendario semanal de turnos
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: `180px repeat(7, minmax(110px, 1fr))`, gap: 1, minWidth: 900 }}>
            <Box />
            {WEEKDAY_LABELS.map((day) => (
              <Typography key={day} variant="caption" color="text.secondary" sx={{ fontWeight: 700, textAlign: 'center' }}>
                {day}
              </Typography>
            ))}
            {withShifts.map(({ employee, shifts }) => (
              <Box key={employee.id} sx={{ display: 'contents' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, py: 1 }} noWrap>
                  {employee.firstName} {employee.lastName}
                </Typography>
                {WEEKDAY_LABELS.map((_, dayOfWeek) => {
                  const shift = shifts.find((s) => s.dayOfWeek === dayOfWeek);
                  return (
                    <Box
                      key={dayOfWeek}
                      sx={{
                        py: 1,
                        borderRadius: 1.5,
                        textAlign: 'center',
                        backgroundColor: shift ? alpha(brand.gold, 0.12) : 'transparent',
                        border: shift ? `1px solid ${alpha(brand.gold, 0.3)}` : '1px dashed',
                        borderColor: shift ? undefined : 'divider',
                      }}
                    >
                      {shift && (
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {shift.startTime.slice(0, 5)}–{shift.endTime.slice(0, 5)}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
