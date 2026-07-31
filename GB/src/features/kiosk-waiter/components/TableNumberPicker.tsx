import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

interface TableNumberPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const QUICK_TABLES = Array.from({ length: 20 }, (_, i) => String(i + 1));

export default function TableNumberPicker({ value, onChange }: TableNumberPickerProps) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
        Mesa
      </Typography>
      <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap', mb: 1 }}>
        {QUICK_TABLES.map((table) => (
          <Chip
            key={table}
            label={table}
            onClick={() => onChange(table)}
            color={value === table ? 'primary' : 'default'}
            variant={value === table ? 'filled' : 'outlined'}
            sx={{ minWidth: 44, fontWeight: 700, fontSize: '0.95rem', height: 40 }}
          />
        ))}
      </Stack>
      <TextField
        size="small"
        fullWidth
        placeholder="Otra mesa (ej. Terraza 2)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Box>
  );
}
