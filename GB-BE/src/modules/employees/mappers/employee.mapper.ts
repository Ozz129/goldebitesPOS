import {
  Employee,
  EmployeeRow,
  EmployeeShift,
  EmployeeShiftRow,
} from '../domain/employee.interface';

export class EmployeeMapper {
  static toDomain(row: EmployeeRow): Employee {
    return {
      id: row.id,
      businessId: row.business_id,
      branchId: row.branch_id,
      roleId: row.role_id,
      userId: row.user_id,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      email: row.email,
      position: row.position,
      status: row.status,
      hireDate: row.hire_date,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static shiftToDomain(row: EmployeeShiftRow): EmployeeShift {
    return {
      id: row.id,
      employeeId: row.employee_id,
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
    };
  }
}
