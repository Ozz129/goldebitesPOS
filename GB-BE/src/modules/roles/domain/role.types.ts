export interface CreateRoleData {
  businessId: string;
  name: string;
  description?: string;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
}
