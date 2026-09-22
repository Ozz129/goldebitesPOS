import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BookOpen } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';
import ErrorState from '../../../components/common/ErrorState';
import EmptyState from '../../../components/common/EmptyState';
import { useAuthStore } from '../../../modules/auth/store/auth.store';
import { getRoleLabel } from '../../../modules/roles/role-labels';
import { useMyHrProfile } from '../../../modules/hr/hooks/use-my-hr-profile';

export default function MyProfilePage() {
  const branchId = useAuthStore((s) => s.user?.branchId);
  const { data: profile, isLoading, isError, refetch } = useMyHrProfile();

  return (
    <>
      <PageHeader title="Mi Perfil" subtitle="Tu rol y las normas de tu sede." breadcrumbs={[{ label: 'Mi Perfil' }]} />

      {isLoading && <LoadingSkeleton variant="page" />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {profile && (
        <Stack spacing={3}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <BookOpen size={20} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Mi rol
                  </Typography>
                  <Chip label={getRoleLabel(profile.role.name)} size="small" color="primary" />
                </Stack>
                {profile.role.description ? (
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                    {profile.role.description}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Tu administrador aún no configuró una descripción para este rol.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Normas de mi sede
                </Typography>

                {!branchId && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No tienes una sede asignada.
                  </Typography>
                )}

                {branchId && profile.branchRules.length === 0 && (
                  <Box sx={{ py: 1 }}>
                    <EmptyState title="Sin normas configuradas" description="Tu sede aún no tiene normas registradas." />
                  </Box>
                )}

                {branchId && profile.branchRules.length > 0 && (
                  <Stack spacing={2} divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
                    {profile.branchRules.map((rule) => (
                      <Box key={rule.id}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {rule.title}
                        </Typography>
                        {rule.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', mt: 0.25 }}>
                            {rule.description}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      )}
    </>
  );
}
