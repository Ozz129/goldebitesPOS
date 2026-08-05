import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Pencil, Trash2, Power } from 'lucide-react';
import DetailDrawer from '../../../components/common/DetailDrawer';
import CurrencyDisplay from '../../../components/common/CurrencyDisplay';
import StatusChip from '../../../components/common/StatusChip';
import { formatPercent } from '../../../utils/format';
import { Can } from '../../../modules/auth/components/can';
import type { Product } from '../../../modules/products/types/product.types';

interface ProductDetailDrawerProps {
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
}

export default function ProductDetailDrawer({
  product,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
}: ProductDetailDrawerProps) {
  if (!product) return null;

  const margin =
    product.salePrice > 0 ? (product.salePrice - product.currentCost) / product.salePrice : 0;

  return (
    <DetailDrawer
      open={Boolean(product)}
      onClose={onClose}
      title={product.name}
      subtitle={product.sku ? `Referencia: ${product.sku}` : undefined}
      footer={
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
          <Can permission="products.update">
            <Button startIcon={<Power size={16} />} onClick={() => onToggleStatus(product)}>
              {product.isActive ? 'Desactivar' : 'Activar'}
            </Button>
            <Button
              color="error"
              startIcon={<Trash2 size={16} />}
              onClick={() => onDelete(product)}
            >
              Eliminar
            </Button>
            <Button
              variant="contained"
              startIcon={<Pencil size={16} />}
              onClick={() => onEdit(product)}
            >
              Editar producto
            </Button>
          </Can>
        </Stack>
      }
    >
      <Stack spacing={3}>
        <Typography variant="body2" color="text.secondary">
          {product.description ?? 'Sin descripción'}
        </Typography>

        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Precio de venta
            </Typography>
            <CurrencyDisplay value={product.salePrice} variant="h6" sx={{ fontWeight: 700 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Costo actual
            </Typography>
            <CurrencyDisplay value={product.currentCost} variant="h6" sx={{ fontWeight: 700 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Margen
            </Typography>
            <Typography
              variant="h6"
              color={margin >= 0.6 ? 'success.main' : margin >= 0.4 ? 'warning.main' : 'error.main'}
              sx={{ fontWeight: 700 }}
            >
              {formatPercent(margin)}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          <StatusChip
            label={product.isActive ? 'Activo' : 'Inactivo'}
            tone={product.isActive ? 'success' : 'neutral'}
          />
          <StatusChip
            label={product.trackInventory ? 'Controla inventario' : 'No controla inventario'}
            tone={product.trackInventory ? 'gold' : 'neutral'}
          />
        </Stack>
      </Stack>
    </DetailDrawer>
  );
}
