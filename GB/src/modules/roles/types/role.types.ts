export interface Role {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface RoleWithPermissions extends Role {
  permissions: string[];
}

export interface CreateRolePayload {
  name: string;
  description?: string;
}

export type UpdateRolePayload = Partial<CreateRolePayload>;
