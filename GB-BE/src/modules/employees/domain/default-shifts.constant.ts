import { ShiftInput } from './employee.types';

/** Every day of the week, 3pm–10pm — the typical shift for this business. Applied once at employee creation; the employee (or an admin) can adjust it afterward. */
export const DEFAULT_EMPLOYEE_SHIFTS: ShiftInput[] = Array.from({ length: 7 }, (_, dayOfWeek) => ({
  dayOfWeek,
  startTime: '15:00',
  endTime: '22:00',
}));
