import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { UtensilsCrossed, Plus } from 'lucide-react';
import { useProducts } from '../../../modules/products/hooks/use-products';
import { formatCOP } from '../../../utils/format';
import type { Product } from '../../../modules/products/types/product.types';

interface CarServiceProductGridProps {
  categoryId: string | null;
  onSelect: (product: Product) => void;
}

export default function CarServiceProductGrid({ categoryId, onSelect }: CarServiceProductGridProps) {
  const { data, isLoading } = useProducts({
    isActive: true,
    categoryId: categoryId ?? undefined,
    limit: 100,
  });
  const products = data?.data ?? [];

  if (!isLoading && products.length === 0) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No hay productos en esta categoría.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2.5} sx={{ p: 2.5 }}>
      {products.map((product) => (
        <Grid key={product.id} size={{ xs: 6, sm: 4, md: 3 }}>
          <ButtonBase
            onClick={() => onSelect(product)}
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              borderRadius: 4,
              border: '2px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              textAlign: 'left',
              bgcolor: 'background.paper',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              transition: 'transform 0.12s ease, border-color 0.12s ease',
              '&:active': { transform: 'scale(0.97)', borderColor: 'primary.main' },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                height: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
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
                <UtensilsCrossed size={44} strokeWidth={1.3} />
              )}
              <Box
                sx={{
                  position: 'absolute',
                  right: 8,
                  bottom: 8,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus size={18} color="#0B0B0C" strokeWidth={3} />
              </Box>
            </Box>
            <Box sx={{ p: 1.75 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.25 }}>
                {product.name}
              </Typography>
              <Typography sx={{ mt: 0.5, fontWeight: 800, fontSize: '1.15rem' }} color="primary.main">
                {formatCOP(product.salePrice)}
              </Typography>
            </Box>
          </ButtonBase>
        </Grid>
      ))}
    </Grid>
  );
}
