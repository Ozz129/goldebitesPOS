import { useCallback, useMemo, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import type { ColumnDef } from '@tanstack/react-table';
import { useSnackbar } from 'notistack';
import { Megaphone, Wallet, Users2, Percent, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import DataTable from '../../../components/common/DataTable';
import StatusChip from '../../../components/common/StatusChip';
import DateDisplay from '../../../components/common/DateDisplay';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { Can } from '../../../modules/auth/components/can';
import { formatCOP, formatNumber } from '../../../utils/format';
import { normalizeApiError } from '../../../lib/api/api-error';
import {
  MARKETING_CHANNEL_LABELS,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_TONE,
  CONTENT_STATUS_LABELS,
  CONTENT_STATUS_TONE,
  INFLUENCER_STATUS_LABELS,
  INFLUENCER_STATUS_TONE,
} from '../../../modules/marketing/marketing-status';
import { useCampaigns } from '../../../modules/marketing/hooks/use-campaigns';
import { useCreateCampaign } from '../../../modules/marketing/hooks/use-create-campaign';
import { useUpdateCampaign } from '../../../modules/marketing/hooks/use-update-campaign';
import { useDeleteCampaign } from '../../../modules/marketing/hooks/use-delete-campaign';
import { useCoupons } from '../../../modules/marketing/hooks/use-coupons';
import { useCreateCoupon } from '../../../modules/marketing/hooks/use-create-coupon';
import { useUpdateCoupon } from '../../../modules/marketing/hooks/use-update-coupon';
import { useSetCouponStatus } from '../../../modules/marketing/hooks/use-set-coupon-status';
import { useDeleteCoupon } from '../../../modules/marketing/hooks/use-delete-coupon';
import { useContentItems } from '../../../modules/marketing/hooks/use-content-items';
import { useCreateContentItem } from '../../../modules/marketing/hooks/use-create-content-item';
import { useUpdateContentItem } from '../../../modules/marketing/hooks/use-update-content-item';
import { useDeleteContentItem } from '../../../modules/marketing/hooks/use-delete-content-item';
import { useInfluencers } from '../../../modules/marketing/hooks/use-influencers';
import { useCreateInfluencer } from '../../../modules/marketing/hooks/use-create-influencer';
import { useUpdateInfluencer } from '../../../modules/marketing/hooks/use-update-influencer';
import { useDeleteInfluencer } from '../../../modules/marketing/hooks/use-delete-influencer';
import type {
  Campaign,
  ContentItem,
  Coupon,
  Influencer,
} from '../../../modules/marketing/types/marketing.types';
import type { CampaignFormValues } from '../schemas/campaignSchema';
import type { CouponFormValues } from '../schemas/couponSchema';
import type { ContentItemFormValues } from '../schemas/contentItemSchema';
import type { InfluencerFormValues } from '../schemas/influencerSchema';
import CampaignFormDrawer from '../components/CampaignFormDrawer';
import CouponFormDrawer from '../components/CouponFormDrawer';
import ContentItemFormDrawer from '../components/ContentItemFormDrawer';
import InfluencerFormDrawer from '../components/InfluencerFormDrawer';

type MarketingTab = 'campanas' | 'calendario' | 'cupones' | 'influencers';

export default function MarketingPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState<MarketingTab>('campanas');

  const { data: campaignsData } = useCampaigns({ limit: 100 });
  const { data: couponsData } = useCoupons({ limit: 100 });
  const { data: contentData } = useContentItems({ limit: 100 });
  const { data: influencersData } = useInfluencers({ limit: 100 });

  const campaigns = campaignsData?.data ?? [];
  const coupons = couponsData?.data ?? [];
  const contentItems = contentData?.data ?? [];
  const influencers = influencersData?.data ?? [];

  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();

  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const setCouponStatus = useSetCouponStatus();
  const deleteCoupon = useDeleteCoupon();

  const createContentItem = useCreateContentItem();
  const updateContentItem = useUpdateContentItem();
  const deleteContentItem = useDeleteContentItem();

  const createInfluencer = useCreateInfluencer();
  const updateInfluencer = useUpdateInfluencer();
  const deleteInfluencer = useDeleteInfluencer();

  const [campaignFormOpen, setCampaignFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);

  const [couponFormOpen, setCouponFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);

  const [contentFormOpen, setContentFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [deletingContent, setDeletingContent] = useState<ContentItem | null>(null);

  const [influencerFormOpen, setInfluencerFormOpen] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);
  const [deletingInfluencer, setDeletingInfluencer] = useState<Influencer | null>(null);

  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const totalReach = campaigns.reduce((s, c) => s + c.reach, 0);

  const onError = useCallback(
    (error: unknown) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
    [enqueueSnackbar],
  );

  const handleCampaignSubmit = (values: CampaignFormValues) => {
    if (editingCampaign) {
      updateCampaign.mutate(
        { id: editingCampaign.id, payload: values },
        {
          onSuccess: () => {
            enqueueSnackbar('Campaña actualizada correctamente', { variant: 'success' });
            setCampaignFormOpen(false);
          },
          onError,
        },
      );
    } else {
      createCampaign.mutate(
        { name: values.name, channel: values.channel, budget: values.budget, startDate: values.startDate || undefined, endDate: values.endDate || undefined },
        {
          onSuccess: () => {
            enqueueSnackbar('Campaña creada correctamente', { variant: 'success' });
            setCampaignFormOpen(false);
          },
          onError,
        },
      );
    }
  };

  const handleCouponSubmit = (values: CouponFormValues) => {
    if (editingCoupon) {
      updateCoupon.mutate(
        { id: editingCoupon.id, payload: values },
        { onSuccess: () => { enqueueSnackbar('Cupón actualizado correctamente', { variant: 'success' }); setCouponFormOpen(false); }, onError },
      );
    } else {
      createCoupon.mutate(values, {
        onSuccess: () => { enqueueSnackbar('Cupón creado correctamente', { variant: 'success' }); setCouponFormOpen(false); },
        onError,
      });
    }
  };

  const handleContentSubmit = (values: ContentItemFormValues) => {
    if (editingContent) {
      updateContentItem.mutate(
        { id: editingContent.id, payload: values },
        { onSuccess: () => { enqueueSnackbar('Contenido actualizado correctamente', { variant: 'success' }); setContentFormOpen(false); }, onError },
      );
    } else {
      createContentItem.mutate(
        { scheduledDate: values.scheduledDate, title: values.title, channel: values.channel },
        { onSuccess: () => { enqueueSnackbar('Contenido programado correctamente', { variant: 'success' }); setContentFormOpen(false); }, onError },
      );
    }
  };

  const handleInfluencerSubmit = (values: InfluencerFormValues) => {
    if (editingInfluencer) {
      updateInfluencer.mutate(
        { id: editingInfluencer.id, payload: values },
        { onSuccess: () => { enqueueSnackbar('Influencer actualizado correctamente', { variant: 'success' }); setInfluencerFormOpen(false); }, onError },
      );
    } else {
      createInfluencer.mutate(values, {
        onSuccess: () => { enqueueSnackbar('Influencer agregado correctamente', { variant: 'success' }); setInfluencerFormOpen(false); },
        onError,
      });
    }
  };

  const campaignColumns: ColumnDef<Campaign, unknown>[] = useMemo(
    () => [
      { accessorKey: 'name', header: 'Campaña' },
      { id: 'channel', header: 'Canal', cell: ({ row }) => MARKETING_CHANNEL_LABELS[row.original.channel] },
      { id: 'status', header: 'Estado', cell: ({ row }) => <StatusChip label={CAMPAIGN_STATUS_LABELS[row.original.status]} tone={CAMPAIGN_STATUS_TONE[row.original.status]} /> },
      {
        id: 'budget',
        header: 'Presupuesto usado',
        cell: ({ row }) => (
          <Stack sx={{ minWidth: 140 }}>
            <Typography variant="caption">{formatCOP(row.original.spent)} / {formatCOP(row.original.budget)}</Typography>
            <LinearProgress variant="determinate" value={row.original.budget > 0 ? (row.original.spent / row.original.budget) * 100 : 0} sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
          </Stack>
        ),
      },
      { id: 'reach', header: 'Alcance', cell: ({ row }) => formatNumber(row.original.reach) },
      { id: 'conversions', header: 'Conversiones', cell: ({ row }) => formatNumber(row.original.conversions) },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Can permission="marketing.manage">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeletingCampaign(row.original); }}>
              <Trash2 size={14} />
            </IconButton>
          </Can>
        ),
      },
    ],
    [],
  );

  const contentColumns: ColumnDef<ContentItem, unknown>[] = useMemo(
    () => [
      { id: 'date', header: 'Fecha', cell: ({ row }) => <DateDisplay value={row.original.scheduledDate} variant="body2" /> },
      { accessorKey: 'title', header: 'Contenido' },
      { id: 'channel', header: 'Canal', cell: ({ row }) => MARKETING_CHANNEL_LABELS[row.original.channel] },
      { id: 'status', header: 'Estado', cell: ({ row }) => <StatusChip label={CONTENT_STATUS_LABELS[row.original.status]} tone={CONTENT_STATUS_TONE[row.original.status]} /> },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Can permission="marketing.manage">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeletingContent(row.original); }}>
              <Trash2 size={14} />
            </IconButton>
          </Can>
        ),
      },
    ],
    [],
  );

  const couponColumns: ColumnDef<Coupon, unknown>[] = useMemo(
    () => [
      { accessorKey: 'code', header: 'Código' },
      { accessorKey: 'discountLabel', header: 'Beneficio' },
      {
        id: 'usage',
        header: 'Uso',
        cell: ({ row }) => (
          <Stack sx={{ minWidth: 120 }}>
            <Typography variant="caption">{row.original.usageCount} / {row.original.maxUsage}</Typography>
            <LinearProgress variant="determinate" value={(row.original.usageCount / row.original.maxUsage) * 100} sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
          </Stack>
        ),
      },
      {
        id: 'status',
        header: 'Estado',
        cell: ({ row }) => (
          <Can
            permission="marketing.manage"
            fallback={<StatusChip label={row.original.isActive ? 'Activo' : 'Inactivo'} tone={row.original.isActive ? 'success' : 'neutral'} />}
          >
            <Switch
              size="small"
              checked={row.original.isActive}
              onChange={(e) => {
                e.stopPropagation();
                setCouponStatus.mutate({ id: row.original.id, isActive: !row.original.isActive }, { onError });
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </Can>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Can permission="marketing.manage">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeletingCoupon(row.original); }}>
              <Trash2 size={14} />
            </IconButton>
          </Can>
        ),
      },
    ],
    [setCouponStatus, onError],
  );

  const influencerColumns: ColumnDef<Influencer, unknown>[] = useMemo(
    () => [
      { accessorKey: 'name', header: 'Perfil' },
      { id: 'channel', header: 'Canal', cell: ({ row }) => MARKETING_CHANNEL_LABELS[row.original.channel] },
      { id: 'followers', header: 'Seguidores', cell: ({ row }) => formatNumber(row.original.followers) },
      { id: 'status', header: 'Estado', cell: ({ row }) => <StatusChip label={INFLUENCER_STATUS_LABELS[row.original.status]} tone={INFLUENCER_STATUS_TONE[row.original.status]} /> },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Can permission="marketing.manage">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeletingInfluencer(row.original); }}>
              <Trash2 size={14} />
            </IconButton>
          </Can>
        ),
      },
    ],
    [],
  );

  const addButtonByTab: Record<MarketingTab, { label: string; onClick: () => void }> = {
    campanas: { label: 'Nueva campaña', onClick: () => { setEditingCampaign(null); setCampaignFormOpen(true); } },
    calendario: { label: 'Nuevo contenido', onClick: () => { setEditingContent(null); setContentFormOpen(true); } },
    cupones: { label: 'Nuevo cupón', onClick: () => { setEditingCoupon(null); setCouponFormOpen(true); } },
    influencers: { label: 'Nuevo influencer', onClick: () => { setEditingInfluencer(null); setInfluencerFormOpen(true); } },
  };

  return (
    <>
      <PageHeader
        title="Marketing"
        subtitle="Campañas, contenido, cupones e influencers."
        breadcrumbs={[{ label: 'Marketing' }]}
        actions={
          <Can permission="marketing.manage">
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={addButtonByTab[tab].onClick}>
              {addButtonByTab[tab].label}
            </Button>
          </Can>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Presupuesto total" value={formatCOP(totalBudget)} icon={Wallet} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Invertido" value={formatCOP(totalSpent)} icon={Percent} helperText={totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(0)}% del presupuesto` : undefined} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Alcance total" value={formatNumber(totalReach)} icon={Users2} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Conversiones" value={formatNumber(totalConversions)} icon={Megaphone} />
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Campañas" value="campanas" />
        <Tab label="Calendario de contenido" value="calendario" />
        <Tab label="Cupones" value="cupones" />
        <Tab label="Influencers" value="influencers" />
      </Tabs>

      {tab === 'campanas' && (
        <DataTable
          columns={campaignColumns}
          data={campaigns}
          onRowClick={(row) => { setEditingCampaign(row); setCampaignFormOpen(true); }}
          emptyTitle="Sin campañas"
          pageSize={10}
        />
      )}
      {tab === 'calendario' && (
        <DataTable
          columns={contentColumns}
          data={contentItems}
          onRowClick={(row) => { setEditingContent(row); setContentFormOpen(true); }}
          emptyTitle="Sin contenido programado"
          pageSize={10}
        />
      )}
      {tab === 'cupones' && (
        <DataTable
          columns={couponColumns}
          data={coupons}
          onRowClick={(row) => { setEditingCoupon(row); setCouponFormOpen(true); }}
          emptyTitle="Sin cupones"
          pageSize={10}
        />
      )}
      {tab === 'influencers' && (
        <DataTable
          columns={influencerColumns}
          data={influencers}
          onRowClick={(row) => { setEditingInfluencer(row); setInfluencerFormOpen(true); }}
          emptyTitle="Sin influencers"
          pageSize={10}
        />
      )}

      <CampaignFormDrawer
        open={campaignFormOpen}
        loading={createCampaign.isPending || updateCampaign.isPending}
        initialCampaign={editingCampaign}
        onClose={() => setCampaignFormOpen(false)}
        onSubmit={handleCampaignSubmit}
      />
      <ConfirmDialog
        open={Boolean(deletingCampaign)}
        title="Eliminar campaña"
        description={`¿Seguro que deseas eliminar "${deletingCampaign?.name}"?`}
        confirmLabel="Eliminar"
        destructive
        onClose={() => setDeletingCampaign(null)}
        onConfirm={() => {
          if (!deletingCampaign) return;
          deleteCampaign.mutate(deletingCampaign.id, {
            onSuccess: () => enqueueSnackbar('Campaña eliminada', { variant: 'success' }),
            onError,
            onSettled: () => setDeletingCampaign(null),
          });
        }}
      />

      <CouponFormDrawer
        open={couponFormOpen}
        loading={createCoupon.isPending || updateCoupon.isPending}
        initialCoupon={editingCoupon}
        onClose={() => setCouponFormOpen(false)}
        onSubmit={handleCouponSubmit}
      />
      <ConfirmDialog
        open={Boolean(deletingCoupon)}
        title="Eliminar cupón"
        description={`¿Seguro que deseas eliminar "${deletingCoupon?.code}"?`}
        confirmLabel="Eliminar"
        destructive
        onClose={() => setDeletingCoupon(null)}
        onConfirm={() => {
          if (!deletingCoupon) return;
          deleteCoupon.mutate(deletingCoupon.id, {
            onSuccess: () => enqueueSnackbar('Cupón eliminado', { variant: 'success' }),
            onError,
            onSettled: () => setDeletingCoupon(null),
          });
        }}
      />

      <ContentItemFormDrawer
        open={contentFormOpen}
        loading={createContentItem.isPending || updateContentItem.isPending}
        initialItem={editingContent}
        onClose={() => setContentFormOpen(false)}
        onSubmit={handleContentSubmit}
      />
      <ConfirmDialog
        open={Boolean(deletingContent)}
        title="Eliminar contenido"
        description={`¿Seguro que deseas eliminar "${deletingContent?.title}"?`}
        confirmLabel="Eliminar"
        destructive
        onClose={() => setDeletingContent(null)}
        onConfirm={() => {
          if (!deletingContent) return;
          deleteContentItem.mutate(deletingContent.id, {
            onSuccess: () => enqueueSnackbar('Contenido eliminado', { variant: 'success' }),
            onError,
            onSettled: () => setDeletingContent(null),
          });
        }}
      />

      <InfluencerFormDrawer
        open={influencerFormOpen}
        loading={createInfluencer.isPending || updateInfluencer.isPending}
        initialInfluencer={editingInfluencer}
        onClose={() => setInfluencerFormOpen(false)}
        onSubmit={handleInfluencerSubmit}
      />
      <ConfirmDialog
        open={Boolean(deletingInfluencer)}
        title="Eliminar influencer"
        description={`¿Seguro que deseas eliminar "${deletingInfluencer?.name}"?`}
        confirmLabel="Eliminar"
        destructive
        onClose={() => setDeletingInfluencer(null)}
        onConfirm={() => {
          if (!deletingInfluencer) return;
          deleteInfluencer.mutate(deletingInfluencer.id, {
            onSuccess: () => enqueueSnackbar('Influencer eliminado', { variant: 'success' }),
            onError,
            onSettled: () => setDeletingInfluencer(null),
          });
        }}
      />
    </>
  );
}
