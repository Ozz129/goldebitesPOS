import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { X } from 'lucide-react';

interface FilterBarProps {
  children: React.ReactNode;
  onClear?: () => void;
  hasActiveFilters?: boolean;
}

export default function FilterBar({ children, onClear, hasActiveFilters }: FilterBarProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
     
     
      useFlexGap
      sx={{ flexWrap: "wrap", alignItems: { xs: 'stretch', md: 'center' }, mb: 2.5 }}
    >
      {children}
      {onClear && hasActiveFilters && (
        <Button
          size="small"
          color="inherit"
          startIcon={<X size={14} />}
          onClick={onClear}
          sx={{ color: 'text.secondary' }}
        >
          Limpiar filtros
        </Button>
      )}
    </Stack>
  );
}
