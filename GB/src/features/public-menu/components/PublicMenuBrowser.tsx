import { useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Fab from '@mui/material/Fab';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { ShoppingCart, UtensilsCrossed } from 'lucide-react';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';
import ErrorState from '../../../components/common/ErrorState';
import { usePublicMenu } from '../../../modules/public-menu/hooks/use-public-menu';
import type { PublicMenuProduct } from '../../../modules/public-menu/types/public-menu.types';
import { formatCOP } from '../../../utils/format';
import { brand } from '../../../theme/palette';
import ProductDetailDialog from './ProductDetailDialog';
import PublicCartDrawer from './PublicCartDrawer';
import { usePublicCart } from '../hooks/use-public-cart';

interface PublicMenuBrowserProps {
  businessId: string | undefined;
  /** Whether the generic "Menú" heading under the business name should render — off when a caller (e.g. the NFC page) already shows its own context header above this. */
  showMenuLabel?: boolean;
}

/**
 * The shared catalog-browsing + cart experience — categories, products,
 * product customization, and the local cart. Used as-is by the generic
 * preview (`/menu/:businessId`, no branch/table context) and wrapped with a
 * fixed-table context header by the NFC gallo page (`/m/:token`).
 */
export default function PublicMenuBrowser({ businessId, showMenuLabel = true }: PublicMenuBrowserProps) {
  const { data: menu, isLoading, isError } = usePublicMenu(businessId);
  const [selectedProduct, setSelectedProduct] = useState<PublicMenuProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const { cart, addToCart, increment, decrement, remove, itemCount, total } = usePublicCart();

  return (
    <Box sx={{ pb: 12 }}>
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
              {showMenuLabel && (
                <Typography variant="body2" color="text.secondary">
                  Menú
                </Typography>
              )}
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
                  <Stack spacing={0.5}>
                    {category.products.map((product) => (
                      <ButtonBase
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        sx={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          py: 1.25,
                          borderRadius: 1.5,
                          textAlign: 'left',
                          justifyContent: 'flex-start',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            flexShrink: 0,
                            borderRadius: 2,
                            overflow: 'hidden',
                            bgcolor: 'action.hover',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
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
                            <UtensilsCrossed size={22} color={brand.gold} strokeWidth={1.5} />
                          )}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {product.name}
                          </Typography>
                          {product.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {product.description}
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {formatCOP(product.salePrice)}
                        </Typography>
                      </ButtonBase>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </>
        )}
      </Box>

      {itemCount > 0 && (
        <Fab
          color="primary"
          variant="extended"
          onClick={() => setCartOpen(true)}
          sx={{ position: 'fixed', bottom: 24, right: 24, fontWeight: 700, boxShadow: 4 }}
        >
          <Badge badgeContent={itemCount} color="secondary" sx={{ mr: 2 }}>
            <ShoppingCart size={20} />
          </Badge>
          {formatCOP(total)}
        </Fab>
      )}

      <ProductDetailDialog
        product={selectedProduct}
        sauces={menu?.sauces ?? []}
        sides={menu?.sides ?? []}
        onAdd={addToCart}
        onClose={() => setSelectedProduct(null)}
      />

      <PublicCartDrawer
        open={cartOpen}
        cart={cart}
        sauces={menu?.sauces ?? []}
        sides={menu?.sides ?? []}
        total={total}
        onIncrement={increment}
        onDecrement={decrement}
        onRemove={remove}
        onClose={() => setCartOpen(false)}
      />
    </Box>
  );
}
