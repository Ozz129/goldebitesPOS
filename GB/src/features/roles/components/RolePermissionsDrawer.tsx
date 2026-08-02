import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useSnackbar } from 'notistack';
import DetailDrawer from '../../../components/common/DetailDrawer';
import { Can } from '../../../modules/auth/components/can';
import { useRole } from '../../../modules/roles/hooks/use-role';
import { useSetRolePermissions } from '../../../modules/roles/hooks/use-set-role-permissions';
import { usePermissionCatalog } from '../../../modules/permissions/hooks/use-permission-catalog';
import { normalizeApiError } from '../../../lib/api/api-error';
import { getRoleLabel } from '../../../modules/roles/role-labels';
import { getPermissionModuleLabel } from '../../../modules/roles/permission-module-labels';

interface RolePermissionsDrawerProps {
  roleId: string | null;
  onClose: () => void;
  onEdit: () => void;
}

export default function RolePermissionsDrawer({ roleId, onClose, onEdit }: RolePermissionsDrawerProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { data: role } = useRole(roleId);
  const { data: catalog } = usePermissionCatalog();
  const setPermissions = useSetRolePermissions();

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  if (role && initializedFor !== role.id) {
    setInitializedFor(role.id);
    setChecked(new Set(role.permissions));
  }

  const grouped = useMemo(() => {
    const map = new Map<string, { code: string; description: string }[]>();
    for (const perm of catalog ?? []) {
      const list = map.get(perm.module) ?? [];
      list.push({ code: perm.code, description: perm.description });
      map.set(perm.module, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [catalog]);

  if (!roleId || !role) return null;

  const toggle = (code: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const hasChanges =
    checked.size !== role.permissions.length || role.permissions.some((code) => !checked.has(code));

  return (
    <DetailDrawer
      open={Boolean(roleId)}
      onClose={onClose}
      title={getRoleLabel(role.name)}
      subtitle={role.description ?? undefined}
      width={560}
      footer={
        <Can permission="roles.manage">
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={onEdit}>
              Editar nombre
            </Button>
            <Button
              variant="contained"
              disabled={!hasChanges}
              loading={setPermissions.isPending}
              onClick={() => {
                setPermissions.mutate(
                  { id: role.id, permissionCodes: Array.from(checked) },
                  {
                    onSuccess: () =>
                      enqueueSnackbar('Permisos actualizados correctamente', { variant: 'success' }),
                    onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
                  },
                );
              }}
            >
              Guardar permisos
            </Button>
          </Stack>
        </Can>
      }
    >
      <Stack spacing={2.5}>
        {grouped.map(([module, permissions], idx) => (
          <Box key={module}>
            {idx > 0 && <Divider sx={{ mb: 2 }} />}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              {getPermissionModuleLabel(module)}
            </Typography>
            <Stack spacing={0}>
              {permissions.map((perm) => (
                <FormControlLabel
                  key={perm.code}
                  control={
                    <Checkbox
                      size="small"
                      checked={checked.has(perm.code)}
                      onChange={() => toggle(perm.code)}
                    />
                  }
                  label={
                    <Stack>
                      <Typography variant="body2">{perm.description}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {perm.code}
                      </Typography>
                    </Stack>
                  }
                />
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </DetailDrawer>
  );
}
