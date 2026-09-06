import { useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useSnackbar } from 'notistack';
import { useUpdateBranch } from '../../../modules/branches/hooks/use-update-branch';
import { normalizeApiError } from '../../../lib/api/api-error';
import type { Branch } from '../../../modules/branches/types/branch.types';

interface BranchTableCountFieldProps {
  branch: Branch;
}

/** Lets a manager set how many tables a branch has — that count drives the waiter kiosk's table picker. */
export default function BranchTableCountField({ branch }: BranchTableCountFieldProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [value, setValue] = useState(String(branch.tableCount));
  const updateBranch = useUpdateBranch(branch.id);

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <TextField
        size="small"
        type="number"
        label="Número de mesas"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        sx={{ width: 140 }}
        slotProps={{ htmlInput: { min: 1, max: 500 } }}
      />
      <Button
        size="small"
        variant="outlined"
        loading={updateBranch.isPending}
        onClick={() => {
          const tableCount = Number(value);
          if (!tableCount || tableCount < 1) return;
          updateBranch.mutate(
            { tableCount },
            {
              onSuccess: () => enqueueSnackbar('Número de mesas actualizado', { variant: 'success' }),
              onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
            },
          );
        }}
      >
        Guardar
      </Button>
    </Stack>
  );
}
