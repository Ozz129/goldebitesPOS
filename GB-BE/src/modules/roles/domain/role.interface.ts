export interface Role {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  createdAt: Date;
}

export interface RoleRow {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  created_at: Date;
}

export interface RoleWithPermissions extends Role {
  permissions: string[];
}
