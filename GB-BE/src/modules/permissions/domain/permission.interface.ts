export interface Permission {
  id: string;
  code: string;
  module: string;
  description: string | null;
  createdAt: Date;
}

export interface PermissionRow {
  id: string;
  code: string;
  module: string;
  description: string | null;
  created_at: Date;
}
