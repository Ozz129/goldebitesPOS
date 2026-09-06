import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

interface TableNumberPickerProps {
  value: string;
  onChange: (value: string) => void;
  tableCount?: number;
  occupiedTables?: Set<string>;
}

const DEFAULT_TABLE_COUNT = 20;

export default function TableNumberPicker({ value, onChange, tableCount, occupiedTables }: TableNumberPickerProps) {
  const quickTables = Array.from({ length: tableCount ?? DEFAULT_TABLE_COUNT }, (_, i) => String(i + 1));
  const valueIsOccupied = Boolean(value && occupiedTables?.has(value));

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
        Mesa
      </Typography>
      <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap', mb: 1 }}>
        {quickTables.map((table) => {
          const occupied = occupiedTables?.has(table) ?? false;
          const chip = (
            <Chip
              key={table}
              label={table}
              onClick={occupied ? undefined : () => onChange(table)}
              disabled={occupied}
              color={value === table ? 'primary' : 'default'}
              variant={value === table ? 'filled' : 'outlined'}
              sx={{
                minWidth: 44,
                fontWeight: 700,
                fontSize: '0.95rem',
                height: 40,
                textDecoration: occupied ? 'line-through' : 'none',
              }}
            />
          );
          return occupied ? (
            <Tooltip key={table} title="Mesa ocupada — ya tiene un pedido activo">
              <span>{chip}</span>
            </Tooltip>
          ) : (
            chip
          );
        })}
      </Stack>
      <TextField
        size="small"
        fullWidth
        placeholder="Otra mesa (ej. Terraza 2)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={valueIsOccupied}
        helperText={valueIsOccupied ? 'Esta mesa ya tiene un pedido activo.' : undefined}
      />
    </Box>
  );
}
