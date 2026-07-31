import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  CreateEmployeePayload,
  CredentialsStatus,
  Employee,
  EmployeeFilters,
  EmployeeStatus,
  EmployeeUserAccount,
  EmployeeWithShifts,
  GenerateEmployeeCredentialsPayload,
  ShiftInput,
  UpdateEmployeePayload,
} from '../types/employee.types';

export const employeesApi = {
  async getEmployees(filters: EmployeeFilters = {}): Promise<PaginatedResponse<Employee>> {
    const { data } = await apiClient.get<PaginatedResponse<Employee>>('/employees', {
      params: filters,
    });
    return data;
  },

  async getEmployee(id: string): Promise<EmployeeWithShifts> {
    const { data } = await apiClient.get<ApiResponse<EmployeeWithShifts>>(`/employees/${id}`);
    return data.data;
  },

  async createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
    const { data } = await apiClient.post<ApiResponse<Employee>>('/employees', payload);
    return data.data;
  },

  async updateEmployee(id: string, payload: UpdateEmployeePayload): Promise<Employee> {
    const { data } = await apiClient.patch<ApiResponse<Employee>>(`/employees/${id}`, payload);
    return data.data;
  },

  async setEmployeeStatus(id: string, status: EmployeeStatus): Promise<Employee> {
    const { data } = await apiClient.patch<ApiResponse<Employee>>(`/employees/${id}/status`, {
      status,
    });
    return data.data;
  },

  async deleteEmployee(id: string): Promise<void> {
    await apiClient.delete(`/employees/${id}`);
  },

  async replaceShifts(id: string, shifts: ShiftInput[]): Promise<EmployeeWithShifts> {
    const { data } = await apiClient.put<ApiResponse<EmployeeWithShifts>>(
      `/employees/${id}/shifts`,
      { shifts },
    );
    return data.data;
  },

  async generateCredentials(
    id: string,
    payload: GenerateEmployeeCredentialsPayload,
  ): Promise<{ employee: EmployeeWithShifts; temporaryPassword: string }> {
    const { data } = await apiClient.post<
      ApiResponse<{ employee: EmployeeWithShifts; temporaryPassword: string }>
    >(`/employees/${id}/credentials`, payload);
    return data.data;
  },

  async resetCredentials(id: string): Promise<{ temporaryPassword: string }> {
    const { data } = await apiClient.post<ApiResponse<{ temporaryPassword: string }>>(
      `/employees/${id}/credentials/reset`,
    );
    return data.data;
  },

  async setCredentialsStatus(id: string, status: CredentialsStatus): Promise<EmployeeUserAccount> {
    const { data } = await apiClient.patch<ApiResponse<EmployeeUserAccount>>(
      `/employees/${id}/credentials/status`,
      { status },
    );
    return data.data;
  },
};
