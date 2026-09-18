import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { UtensilsCrossed } from 'lucide-react';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';
import ErrorState from '../../../components/common/ErrorState';
import { usePublicMenu } from '../../../modules/public-menu/hooks/use-public-menu';
import { formatCOP } from '../../../utils/format';
import { brand } from '../../../theme/palette';

export default function PublicMenuPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const { data: menu, isLoading, isError } = usePublicMenu(businessId);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 3, sm: 6 }, px: 2 }}>
      <Box sx={{ maxWidth: 640, mx: 'auto' }}>
        {isLoading && <LoadingSkeleton variant="page" />}

        {isError && (
          <ErrorState
            title="Menú no disponible"
            description="No pudimos cargar este menú. Verifica el enlace o intenta más tarde."
          />
        )}

        {menu && (
          <>
            <Stack sx={{ alignItems: 'center', textAlign: 'center', mb: 5 }} spacing={1}>
              <UtensilsCrossed size={28} color={brand.gold} strokeWidth={1.75} />
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: 0.3 }}>
                {menu.businessName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Menú
              </Typography>
            </Stack>

            {menu.categories.length === 0 && (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                Todavía no hay productos disponibles en el menú.
              </Typography>
            )}

            <Stack spacing={5}>
              {menu.categories.map((category) => (
                <Box key={category.id ?? 'uncategorized'}>
                  <Typography
                    variant="overline"
                    sx={{ color: brand.gold, fontWeight: 700, letterSpacing: 1.5 }}
                  >
                    {category.name}
                  </Typography>
                  <Divider sx={{ mb: 2, mt: 0.5, borderColor: brand.gold, opacity: 0.3 }} />
                  <Stack spacing={2.5}>
                    {category.products.map((product) => (
                      <Stack key={product.id} direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {product.name}
                          </Typography>
                          {product.description && (
                            <Typography variant="body2" color="text.secondary">
                              {product.description}
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {formatCOP(product.salePrice)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </>
        )}
      </Box>
    </Box>
  );
}
