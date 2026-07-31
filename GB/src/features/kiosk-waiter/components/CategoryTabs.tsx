import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useProductCategories } from '../../../modules/product-categories/hooks/use-product-categories';

interface CategoryTabsProps {
  value: string | null;
  onChange: (categoryId: string | null) => void;
}

const ALL_VALUE = '__all__';

export default function CategoryTabs({ value, onChange }: CategoryTabsProps) {
  const { data } = useProductCategories({ isActive: true, limit: 100 });
  const categories = data?.data ?? [];

  return (
    <Tabs
      value={value ?? ALL_VALUE}
      onChange={(_, next) => onChange(next === ALL_VALUE ? null : next)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        minHeight: 64,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '& .MuiTab-root': { minHeight: 64, fontSize: '1rem', fontWeight: 600 },
      }}
    >
      <Tab value={ALL_VALUE} label="Todos" />
      {categories.map((category) => (
        <Tab key={category.id} value={category.id} label={category.name} />
      ))}
    </Tabs>
  );
}
