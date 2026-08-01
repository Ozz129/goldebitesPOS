import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Grid3x3 } from 'lucide-react';
import { useProductCategories } from '../../../modules/product-categories/hooks/use-product-categories';
import { categoryIcon } from '../utils/categoryIcon';

interface CarServiceCategoryStripProps {
  value: string | null;
  onChange: (categoryId: string | null) => void;
}

export default function CarServiceCategoryStrip({ value, onChange }: CarServiceCategoryStripProps) {
  const { data } = useProductCategories({ isActive: true, limit: 100 });
  const categories = data?.data ?? [];

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        overflowX: 'auto',
        px: 2.5,
        py: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <CategoryPill
        label="Todo el menú"
        icon={Grid3x3}
        active={value === null}
        onClick={() => onChange(null)}
      />
      {categories.map((category) => (
        <CategoryPill
          key={category.id}
          label={category.name}
          icon={categoryIcon(category.name)}
          active={value === category.id}
          onClick={() => onChange(category.id)}
        />
      ))}
    </Box>
  );
}

function CategoryPill({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: typeof Grid3x3;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        flexShrink: 0,
        borderRadius: 4,
        px: 3,
        py: 1.5,
        border: '2px solid',
        borderColor: active ? 'primary.main' : 'divider',
        bgcolor: active ? 'primary.main' : 'transparent',
        transition: 'transform 0.12s ease, background-color 0.12s ease',
        '&:active': { transform: 'scale(0.96)' },
      }}
    >
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
        <Icon size={22} color={active ? '#0B0B0C' : undefined} />
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '1.05rem',
            color: active ? '#0B0B0C' : 'text.primary',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Typography>
      </Stack>
    </ButtonBase>
  );
}
