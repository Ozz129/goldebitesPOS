import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { UtensilsCrossed } from 'lucide-react';
import { useProducts } from '../../../modules/products/hooks/use-products';
import { formatCOP } from '../../../utils/format';
import type { Product } from '../../../modules/products/types/product.types';

interface ProductGridProps {
  categoryId: string | null;
  onSelect: (product: Product) => void;
}

export default function ProductGrid({ categoryId, onSelect }: ProductGridProps) {
  const { data, isLoading } = useProducts({
    isActive: true,
    categoryId: categoryId ?? undefined,
    limit: 100,
  });
  const products = data?.data ?? [];

  if (!isLoading && products.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No hay productos en esta categoría.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={1.5} sx={{ p: 1.5 }}>
      {products.map((product) => (
        <Grid key={product.id} size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }}>
          <ButtonBase
            onClick={() => onSelect(product)}
            sx={{
              width: '100%',
              minHeight: 128,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              overflow: 'hidden',
              textAlign: 'left',
              bgcolor: 'background.paper',
              '&:active': { transform: 'scale(0.97)' },
            }}
          >
            <Box
              sx={{
                height: 72,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
                overflow: 'hidden',
              }}
            >
              {product.imageUrl ? (
                <Box
                  component="img"
                  src={product.imageUrl}
                  alt={product.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <UtensilsCrossed size={28} strokeWidth={1.5} />
              )}
            </Box>
            <Box sx={{ p: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                {product.name}
              </Typography>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>
                {formatCOP(product.salePrice)}
              </Typography>
            </Box>
          </ButtonBase>
        </Grid>
      ))}
    </Grid>
  );
}
