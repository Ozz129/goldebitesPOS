import { useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import type { ColumnDef } from '@tanstack/react-table';
import { useSnackbar } from 'notistack';
import { Gift, Save, Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/common/DataTable';
import StatusChip from '../../../components/common/StatusChip';
import DateDisplay from '../../../components/common/DateDisplay';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { Can } from '../../../modules/auth/components/can';
import { useCustomers } from '../../../modules/customers/hooks/use-customers';
import { useLoyaltyConfig } from '../../../modules/loyalty/hooks/use-loyalty-config';
import { useUpdateLoyaltyConfig } from '../../../modules/loyalty/hooks/use-update-loyalty-config';
import { useLoyaltyRewards } from '../../../modules/loyalty/hooks/use-loyalty-rewards';
import { useCreateReward } from '../../../modules/loyalty/hooks/use-create-reward';
import { useUpdateReward } from '../../../modules/loyalty/hooks/use-update-reward';
import { useSetRewardStatus } from '../../../modules/loyalty/hooks/use-set-reward-status';
import { useDeleteReward } from '../../../modules/loyalty/hooks/use-delete-reward';
import { useLoyaltyMovements } from '../../../modules/loyalty/hooks/use-loyalty-movements';
import { useRedeemReward } from '../../../modules/loyalty/hooks/use-redeem-reward';
import { normalizeApiError } from '../../../lib/api/api-error';
import type { LoyaltyMovement, LoyaltyReward } from '../../../modules/loyalty/types/loyalty.types';
import type { RewardFormValues } from '../schemas/rewardSchema';
import RewardFormDrawer from '../components/RewardFormDrawer';

const MOVEMENT_TYPE_LABELS = { EARNED: 'Puntos ganados', REDEEMED: 'Puntos redimidos', ADJUSTED: 'Ajuste manual' } as const;
const MOVEMENT_TYPE_TONE = { EARNED: 'success', REDEEMED: 'gold', ADJUSTED: 'info' } as const;

const LOYALTY_TIERS = [
  { name: 'Bronce', minPoints: 0, benefit: 'Acumulación estándar de puntos' },
  { name: 'Plata', minPoints: 400, benefit: '5% de puntos adicionales por compra' },
  { name: 'Oro', minPoints: 900, benefit: '10% de puntos adicionales + salsa de cortesía' },
  { name: 'Corona', minPoints: 1500, benefit: 'Envío gratis en domicilio propio + regalo de cumpleaños' },
];

export default function LoyaltyPage() {
  const { enqueueSnackbar } = useSnackbar();

  const { data: config } = useLoyaltyConfig();
  const updateConfig = useUpdateLoyaltyConfig();
  const { data: rewardsData } = useLoyaltyRewards({ limit: 100 });
  const createReward = useCreateReward();
  const updateReward = useUpdateReward();
  const setRewardStatus = useSetRewardStatus();
  const deleteReward = useDeleteReward();
  const { data: movementsData } = useLoyaltyMovements({ limit: 50 });
  const { data: customersData } = useCustomers({ limit: 100 });
  const redeemReward = useRedeemReward();

  const rewards = rewardsData?.data ?? [];
  const activeRewards = rewards.filter((r) => r.isActive);
  const movements = movementsData?.data ?? [];
  const customers = customersData?.data ?? [];

  const [pointsPerThousand, setPointsPerThousand] = useState('1');
  const [birthdayEnabled, setBirthdayEnabled] = useState(false);
  const [birthdayBonus, setBirthdayBonus] = useState('0');
  const [configLoaded, setConfigLoaded] = useState(false);

  if (config && !configLoaded) {
    setConfigLoaded(true);
    setPointsPerThousand(String(config.pointsPerThousand));
    setBirthdayEnabled(config.birthdayBonusEnabled);
    setBirthdayBonus(String(config.birthdayBonusPoints));
  }

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<LoyaltyReward | null>(null);
  const [deletingReward, setDeletingReward] = useState<LoyaltyReward | null>(null);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const movementColumns: ColumnDef<LoyaltyMovement, unknown>[] = [
    { id: 'createdAt', header: 'Fecha', cell: ({ row }) => <DateDisplay value={row.original.createdAt} mode="datetime" variant="body2" /> },
    {
      id: 'customer',
      header: 'Cliente',
      cell: ({ row }) => {
        const c = customers.find((c) => c.id === row.original.customerId);
        return c ? `${c.firstName} ${c.lastName ?? ''}`.trim() : '—';
      },
    },
    {
      id: 'type',
      header: 'Tipo',
      cell: ({ row }) => (
        <StatusChip label={MOVEMENT_TYPE_LABELS[row.original.type]} tone={MOVEMENT_TYPE_TONE[row.original.type]} />
      ),
    },
    { accessorKey: 'description', header: 'Descripción' },
    { accessorKey: 'points', header: 'Puntos' },
  ];

  const configChanged = useMemo(
    () =>
      config
        ? Number(pointsPerThousand) !== config.pointsPerThousand ||
          birthdayEnabled !== config.birthdayBonusEnabled ||
          Number(birthdayBonus) !== config.birthdayBonusPoints
        : false,
    [pointsPerThousand, birthdayEnabled, birthdayBonus, config],
  );

  const handleRewardSubmit = (values: RewardFormValues) => {
    const payload = { name: values.name, description: values.description || undefined, pointsCost: values.pointsCost };
    if (editingReward) {
      updateReward.mutate(
        { id: editingReward.id, payload },
        {
          onSuccess: () => {
            enqueueSnackbar('Recompensa actualizada correctamente', { variant: 'success' });
            setFormOpen(false);
          },
          onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
        },
      );
    } else {
      createReward.mutate(payload, {
        onSuccess: () => {
          enqueueSnackbar('Recompensa creada correctamente', { variant: 'success' });
          setFormOpen(false);
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      });
    }
  };

  const handleDeleteReward = () => {
    if (!deletingReward) return;
    deleteReward.mutate(deletingReward.id, {
      onSuccess: () => enqueueSnackbar('Recompensa eliminada', { variant: 'success' }),
      onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      onSettled: () => setDeletingReward(null),
    });
  };

  return (
    <>
      <PageHeader
        title="Fidelización"
        subtitle="Programa de puntos, niveles y recompensas para clientes."
        breadcrumbs={[{ label: 'Fidelización' }]}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Configuración del programa
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Puntos por cada $1.000 COP en compras"
                  type="number"
                  size="small"
                  value={pointsPerThousand}
                  onChange={(e) => setPointsPerThousand(e.target.value)}
                />
                <FormControlLabel
                  control={<Switch checked={birthdayEnabled} onChange={(e) => setBirthdayEnabled(e.target.checked)} />}
                  label="Promoción automática de cumpleaños"
                />
                <TextField
                  label="Puntos de bono por cumpleaños"
                  type="number"
                  size="small"
                  value={birthdayBonus}
                  onChange={(e) => setBirthdayBonus(e.target.value)}
                  disabled={!birthdayEnabled}
                />
                <Can permission="loyalty.manage">
                  <Button
                    variant="contained"
                    startIcon={<Save size={16} />}
                    disabled={!configChanged}
                    loading={updateConfig.isPending}
                    onClick={() => {
                      updateConfig.mutate(
                        {
                          pointsPerThousand: Number(pointsPerThousand),
                          birthdayBonusEnabled: birthdayEnabled,
                          birthdayBonusPoints: Number(birthdayBonus),
                        },
                        {
                          onSuccess: () =>
                            enqueueSnackbar('Configuración de fidelización actualizada', { variant: 'success' }),
                          onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
                        },
                      );
                    }}
                  >
                    Guardar configuración
                  </Button>
                </Can>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Niveles de cliente
              </Typography>
              <Stack spacing={1.5}>
                {LOYALTY_TIERS.map((tier) => (
                  <Stack key={tier.name} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Chip label={tier.name} size="small" color="primary" variant="outlined" />
                      <Typography variant="body2" color="text.secondary">
                        {tier.benefit}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Desde {tier.minPoints} pts
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Consultar puntos y redimir recompensas
          </Typography>
          <TextField
            select
            label="Selecciona un cliente"
            size="small"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            sx={{ minWidth: 280, mb: 2 }}
          >
            <MenuItem value="">Selecciona…</MenuItem>
            {customers.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.firstName} {c.lastName ?? ''} — {c.loyaltyPoints} pts
              </MenuItem>
            ))}
          </TextField>

          {selectedCustomer && (
            <>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>
                  {selectedCustomer.firstName} {selectedCustomer.lastName ?? ''}
                </strong>{' '}
                tiene <strong>{selectedCustomer.loyaltyPoints} puntos</strong> disponibles.
              </Typography>
              <Grid container spacing={2}>
                {activeRewards.map((reward) => (
                  <Grid key={reward.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <Gift size={18} />
                          <Chip size="small" label={`${reward.pointsCost} pts`} />
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 700, mt: 1 }}>
                          {reward.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {reward.description}
                        </Typography>
                        <Can permission="loyalty.redeem">
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            sx={{ mt: 1.5 }}
                            disabled={selectedCustomer.loyaltyPoints < reward.pointsCost}
                            loading={redeemReward.isPending}
                            onClick={() => {
                              redeemReward.mutate(
                                { customerId: selectedCustomer.id, rewardId: reward.id },
                                {
                                  onSuccess: () =>
                                    enqueueSnackbar(
                                      `Recompensa "${reward.name}" canjeada para ${selectedCustomer.firstName}`,
                                      { variant: 'success' },
                                    ),
                                  onError: (error) =>
                                    enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
                                },
                              );
                            }}
                          >
                            Canjear
                          </Button>
                        </Can>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </CardContent>
      </Card>

      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Catálogo de recompensas
        </Typography>
        <Can permission="loyalty.manage">
          <Button
            size="small"
            startIcon={<Plus size={16} />}
            onClick={() => {
              setEditingReward(null);
              setFormOpen(true);
            }}
          >
            Nueva recompensa
          </Button>
        </Can>
      </Stack>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {rewards.map((reward) => (
          <Grid key={reward.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {reward.name}
                  </Typography>
                  <Can permission="loyalty.manage">
                    <Switch
                      size="small"
                      checked={reward.isActive}
                      onChange={() =>
                        setRewardStatus.mutate(
                          { id: reward.id, isActive: !reward.isActive },
                          {
                            onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
                          },
                        )
                      }
                    />
                  </Can>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {reward.description}
                </Typography>
                <Chip size="small" sx={{ mt: 1 }} label={`${reward.pointsCost} pts`} />
                <Can permission="loyalty.manage">
                  <Stack direction="row" spacing={0.5} sx={{ mt: 1, justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      startIcon={<Pencil size={14} />}
                      onClick={() => {
                        setEditingReward(reward);
                        setFormOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button size="small" color="error" startIcon={<Trash2 size={14} />} onClick={() => setDeletingReward(reward)}>
                      Eliminar
                    </Button>
                  </Stack>
                </Can>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        Historial de movimientos
      </Typography>
      <DataTable columns={movementColumns} data={movements} emptyTitle="Sin movimientos de puntos" pageSize={8} />

      <RewardFormDrawer
        open={formOpen}
        loading={createReward.isPending || updateReward.isPending}
        initialReward={editingReward}
        onClose={() => setFormOpen(false)}
        onSubmit={handleRewardSubmit}
      />

      <ConfirmDialog
        open={Boolean(deletingReward)}
        title="Eliminar recompensa"
        description={`¿Seguro que deseas eliminar "${deletingReward?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        onClose={() => setDeletingReward(null)}
        onConfirm={handleDeleteReward}
      />
    </>
  );
}
