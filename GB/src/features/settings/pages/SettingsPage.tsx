import { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import { ChevronDown, Check, X } from 'lucide-react';
import { useSnackbar } from 'notistack';
import PageHeader from '../../../components/common/PageHeader';
import StatusChip from '../../../components/common/StatusChip';
import { Can } from '../../../modules/auth/components/can';
import { useCurrentBusiness } from '../../../modules/businesses/hooks/use-current-business';
import { useUpdateBusiness } from '../../../modules/businesses/hooks/use-update-business';
import { useUpdateTaxRate } from '../../../modules/settings/hooks/use-update-tax-rate';
import { useBranches } from '../../../modules/branches/hooks/use-branches';
import { useProductCategories } from '../../../modules/product-categories/hooks/use-product-categories';
import { normalizeApiError } from '../../../lib/api/api-error';
import { useSettingsStore } from '../../../store/settingsStore';
import { useUiStore } from '../../../store/uiStore';
import { PAYMENT_METHOD_LABELS, type PaymentMethod, type Channel, CHANNEL_LABELS } from '../../../types/common';
import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE } from '../../../modules/orders/order-status';

export default function SettingsPage() {
  const settings = useSettingsStore();
  const themeMode = useUiStore((s) => s.themeMode);
  const toggleThemeMode = useUiStore((s) => s.toggleThemeMode);
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);
  const { enqueueSnackbar } = useSnackbar();

  const { data: business } = useCurrentBusiness();
  const updateBusiness = useUpdateBusiness();
  const updateTaxRate = useUpdateTaxRate();
  const { data: branchesData } = useBranches({ limit: 50 });
  const branches = branchesData?.data ?? [];
  const { data: categoriesData } = useProductCategories({ limit: 100 });
  const categories = categoriesData?.data ?? [];

  const [businessForm, setBusinessForm] = useState({
    name: '',
    legalName: '',
    taxId: '',
    phone: '',
    email: '',
  });
  const [taxRatePercent, setTaxRatePercent] = useState('0');

  // Re-seed the form fields once the business loads (derived during render, not an effect).
  const [loadedBusinessId, setLoadedBusinessId] = useState<string | null>(null);
  if (business && business.id !== loadedBusinessId) {
    setLoadedBusinessId(business.id);
    setBusinessForm({
      name: business.name,
      legalName: business.legalName ?? '',
      taxId: business.taxId ?? '',
      phone: business.phone ?? '',
      email: business.email ?? '',
    });
    setTaxRatePercent(String(Math.round(business.taxRate * 100)));
  }

  return (
    <>
      <PageHeader title="Configuración" subtitle="Parámetros generales del negocio y del sistema." breadcrumbs={[{ label: 'Configuración' }]} />

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ChevronDown size={18} />}>
          <Typography sx={{ fontWeight: 700 }}>Información del negocio</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2} sx={{ maxWidth: 480 }}>
            <TextField
              label="Nombre comercial"
              value={businessForm.name}
              onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
            />
            <TextField
              label="Razón social"
              value={businessForm.legalName}
              onChange={(e) => setBusinessForm({ ...businessForm, legalName: e.target.value })}
            />
            <TextField
              label="NIT"
              value={businessForm.taxId}
              onChange={(e) => setBusinessForm({ ...businessForm, taxId: e.target.value })}
            />
            <TextField
              label="Teléfono"
              value={businessForm.phone}
              onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
            />
            <TextField
              label="Correo"
              value={businessForm.email}
              onChange={(e) => setBusinessForm({ ...businessForm, email: e.target.value })}
            />
            <Can permission="businesses.manage">
              <Button
                variant="contained"
                sx={{ alignSelf: 'flex-start' }}
                loading={updateBusiness.isPending}
                onClick={() => {
                  updateBusiness.mutate(businessForm, {
                    onSuccess: () => enqueueSnackbar('Información del negocio actualizada', { variant: 'success' }),
                    onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
                  });
                }}
              >
                Guardar cambios
              </Button>
            </Can>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={18} />}>
          <Typography sx={{ fontWeight: 700 }}>Sedes</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            {branches.map((branch) => (
              <Stack key={branch.id} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {branch.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {[branch.address, branch.city, branch.phone].filter(Boolean).join(' · ') || 'Sin datos de contacto'}
                  </Typography>
                </Box>
                <StatusChip
                  label={branch.isActive ? 'Activa' : 'Inactiva'}
                  tone={branch.isActive ? 'success' : 'neutral'}
                />
              </Stack>
            ))}
            {branches.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No hay sedes registradas.
              </Typography>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={18} />}>
          <Typography sx={{ fontWeight: 700 }}>Impuestos, pagos y canales de venta</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <TextField
                label="Tasa de impuesto (%)"
                type="number"
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(e.target.value)}
                sx={{ maxWidth: 220 }}
              />
              <Can permission="settings.manage">
                <Button
                  variant="outlined"
                  loading={updateTaxRate.isPending}
                  onClick={() => {
                    const rate = Number(taxRatePercent) / 100;
                    updateTaxRate.mutate(rate, {
                      onSuccess: () => enqueueSnackbar('Tasa de impuesto actualizada', { variant: 'success' }),
                      onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
                    });
                  }}
                >
                  Guardar
                </Button>
              </Can>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Los métodos de pago y canales de venta habilitados son preferencias locales de la interfaz — el
              backend no modela esta configuración todavía.
            </Typography>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Métodos de pago habilitados (local)
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(([value, label]) => (
                  <Chip
                    key={value}
                    label={label}
                    onClick={() => settings.togglePaymentMethod(value)}
                    color={settings.paymentMethodsEnabled.includes(value) ? 'primary' : 'default'}
                    variant={settings.paymentMethodsEnabled.includes(value) ? 'filled' : 'outlined'}
                    icon={settings.paymentMethodsEnabled.includes(value) ? <Check size={14} /> : <X size={14} />}
                  />
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Canales de venta habilitados (local)
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                {(Object.entries(CHANNEL_LABELS) as [Channel, string][]).map(([value, label]) => (
                  <Chip
                    key={value}
                    label={label}
                    onClick={() => settings.toggleChannel(value)}
                    color={settings.channelsEnabled.includes(value) ? 'primary' : 'default'}
                    variant={settings.channelsEnabled.includes(value) ? 'filled' : 'outlined'}
                    icon={settings.channelsEnabled.includes(value) ? <Check size={14} /> : <X size={14} />}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={18} />}>
          <Typography sx={{ fontWeight: 700 }}>Catálogo y estados</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Estados de pedido
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                {ORDER_STATUS_SEQUENCE.map((status) => (
                  <Chip key={status} label={ORDER_STATUS_LABELS[status]} variant="outlined" size="small" />
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Categorías de productos
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                {categories.map((cat) => (
                  <Chip key={cat.id} label={cat.name} variant="outlined" size="small" />
                ))}
                {categories.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No hay categorías registradas.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={18} />}>
          <Typography sx={{ fontWeight: 700 }}>Preferencias visuales</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            <FormControlLabel
              control={<Switch checked={themeMode === 'dark'} onChange={toggleThemeMode} />}
              label="Tema oscuro"
            />
            <FormControlLabel
              control={<Switch checked={sidebarCollapsed} onChange={toggleSidebarCollapsed} />}
              label="Menú lateral colapsado por defecto"
            />
          </Stack>
        </AccordionDetails>
      </Accordion>
    </>
  );
}
