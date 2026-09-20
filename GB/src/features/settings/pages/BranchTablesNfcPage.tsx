import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { ColumnDef } from '@tanstack/react-table';
import { Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { useSnackbar } from 'notistack';
import DataTable from '../../../components/common/DataTable';
import PageHeader from '../../../components/common/PageHeader';
import StatusChip from '../../../components/common/StatusChip';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { normalizeApiError } from '../../../lib/api/api-error';
import { useBranch } from '../../../modules/branches/hooks/use-branch';
import { useNfcTags } from '../../../modules/nfc-tags/hooks/use-nfc-tags';
import { useCreateNfcTag } from '../../../modules/nfc-tags/hooks/use-create-nfc-tag';
import { useSetNfcTagStatus } from '../../../modules/nfc-tags/hooks/use-set-nfc-tag-status';
import { useRegenerateNfcTag } from '../../../modules/nfc-tags/hooks/use-regenerate-nfc-tag';
import type { NfcTag } from '../../../modules/nfc-tags/types/nfc-tag.types';

interface TableRow {
  tableNumber: string;
  tag: NfcTag | undefined;
}

function publicUrl(token: string): string {
  return `${window.location.origin}/m/${token}`;
}

export default function BranchTablesNfcPage() {
  const { branchId } = useParams<{ branchId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const { data: branch } = useBranch(branchId);
  const { data: tags, isLoading } = useNfcTags(branchId);
  const createTag = useCreateNfcTag();

  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [tagName, setTagName] = useState('');
  const [regenerateTarget, setRegenerateTarget] = useState<NfcTag | null>(null);

  const rows: TableRow[] = useMemo(() => {
    const tableCount = branch?.tableCount ?? 0;
    const byTable = new Map((tags ?? []).map((tag) => [tag.tableNumber, tag]));
    return Array.from({ length: tableCount }, (_, i) => {
      const tableNumber = String(i + 1);
      return { tableNumber, tag: byTable.get(tableNumber) };
    });
  }, [branch, tags]);

  function openGenerate(tableNumber: string) {
    setGeneratingFor(tableNumber);
    setTagName(`Mesa ${tableNumber}`);
  }

  function handleGenerate() {
    if (!branchId || !generatingFor) return;
    createTag.mutate(
      { branchId, tableNumber: generatingFor, name: tagName.trim() || `Mesa ${generatingFor}` },
      {
        onSuccess: () => {
          enqueueSnackbar('Enlace generado', { variant: 'success' });
          setGeneratingFor(null);
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  }

  async function handleCopy(token: string) {
    await navigator.clipboard.writeText(publicUrl(token));
    enqueueSnackbar('Enlace copiado', { variant: 'success' });
  }

  const columns: ColumnDef<TableRow, unknown>[] = [
    { id: 'tableNumber', header: 'Mesa', cell: ({ row }) => row.original.tableNumber },
    {
      id: 'name',
      header: 'Gallo NFC',
      cell: ({ row }) => row.original.tag?.name ?? '—',
    },
    {
      id: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const tag = row.original.tag;
        if (!tag) return <StatusChip label="Sin configurar" tone="neutral" />;
        return (
          <StatusChip label={tag.isActive ? 'Activo' : 'Inactivo'} tone={tag.isActive ? 'success' : 'neutral'} />
        );
      },
    },
    {
      id: 'link',
      header: 'Enlace',
      cell: ({ row }) => {
        const tag = row.original.tag;
        if (!tag) return '—';
        return (
          <Typography
            variant="body2"
            sx={{ fontFamily: 'monospace', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            /m/{tag.token}
          </Typography>
        );
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const { tableNumber, tag } = row.original;
        if (!tag) {
          return (
            <Button size="small" variant="outlined" onClick={() => openGenerate(tableNumber)}>
              Generar
            </Button>
          );
        }
        return <TagActions tag={tag} onCopy={() => handleCopy(tag.token)} onRegenerate={() => setRegenerateTarget(tag)} />;
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Mesas y NFC"
        subtitle={branch ? `Sede: ${branch.name}` : undefined}
        breadcrumbs={[{ label: 'Configuración', path: '/configuracion' }, { label: 'Mesas y NFC' }]}
      />

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          El número de mesas se define en Configuración → Sedes. Cada mesa puede tener a lo sumo un gallo NFC.
        </Typography>
      </Box>

      <DataTable columns={columns} data={rows} isLoading={isLoading} hidePagination getRowId={(r) => r.tableNumber} />

      <Dialog open={Boolean(generatingFor)} onClose={() => setGeneratingFor(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Generar enlace — Mesa {generatingFor}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nombre identificable"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setGeneratingFor(null)}>Cancelar</Button>
          <Button variant="contained" loading={createTag.isPending} onClick={handleGenerate}>
            Generar
          </Button>
        </DialogActions>
      </Dialog>

      <RegenerateConfirm tag={regenerateTarget} onClose={() => setRegenerateTarget(null)} />
    </>
  );
}

function TagActions({ tag, onCopy, onRegenerate }: { tag: NfcTag; onCopy: () => void; onRegenerate: () => void }) {
  const { enqueueSnackbar } = useSnackbar();
  const setStatus = useSetNfcTagStatus(tag.id);

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Tooltip title="Copiar enlace">
        <IconButton size="small" onClick={onCopy}>
          <Copy size={16} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Probar">
        <IconButton size="small" onClick={() => window.open(publicUrl(tag.token), '_blank', 'noopener,noreferrer')}>
          <ExternalLink size={16} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Regenerar token">
        <IconButton size="small" onClick={onRegenerate}>
          <RefreshCw size={16} />
        </IconButton>
      </Tooltip>
      <Button
        size="small"
        color={tag.isActive ? 'error' : 'primary'}
        loading={setStatus.isPending}
        onClick={() =>
          setStatus.mutate(!tag.isActive, {
            onSuccess: () => enqueueSnackbar(tag.isActive ? 'Gallo desactivado' : 'Gallo activado', { variant: 'success' }),
            onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
          })
        }
      >
        {tag.isActive ? 'Desactivar' : 'Activar'}
      </Button>
    </Stack>
  );
}

function RegenerateConfirm({ tag, onClose }: { tag: NfcTag | null; onClose: () => void }) {
  const { enqueueSnackbar } = useSnackbar();
  const regenerate = useRegenerateNfcTag(tag?.id ?? '');

  return (
    <ConfirmDialog
      open={Boolean(tag)}
      title="Regenerar enlace"
      description={`El enlace actual de "${tag?.name}" dejará de funcionar de inmediato. Tendrás que volver a programar el tag NFC con el nuevo enlace.`}
      confirmLabel="Regenerar"
      destructive
      loading={regenerate.isPending}
      onConfirm={() =>
        regenerate.mutate(undefined, {
          onSuccess: () => {
            enqueueSnackbar('Token regenerado', { variant: 'success' });
            onClose();
          },
          onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
        })
      }
      onClose={onClose}
    />
  );
}
