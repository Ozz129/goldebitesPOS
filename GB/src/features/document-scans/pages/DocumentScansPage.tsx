import { useMemo, useState } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import type { ColumnDef } from '@tanstack/react-table';
import { useSnackbar } from 'notistack';
import { Eye, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import FilterBar from '../../../components/common/FilterBar';
import SearchInput from '../../../components/common/SearchInput';
import DataTable from '../../../components/common/DataTable';
import DateDisplay from '../../../components/common/DateDisplay';
import ErrorState from '../../../components/common/ErrorState';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { Can } from '../../../modules/auth/components/can';
import { useDocumentScans } from '../../../modules/document-scans/hooks/use-document-scans';
import { useCreateDocumentScan } from '../../../modules/document-scans/hooks/use-create-document-scan';
import { useUpdateDocumentScan } from '../../../modules/document-scans/hooks/use-update-document-scan';
import { useDeleteDocumentScan } from '../../../modules/document-scans/hooks/use-delete-document-scan';
import { useViewDocumentScanFile } from '../../../modules/document-scans/hooks/use-view-document-scan-file';
import { normalizeApiError } from '../../../lib/api/api-error';
import { DOCUMENT_SCAN_CATEGORY_LABELS } from '../../../modules/document-scans/document-scan-category';
import type { DocumentScan, DocumentScanCategory } from '../../../modules/document-scans/types/document-scan.types';
import type { DocumentScanFormValues } from '../schemas/documentScanSchema';
import DocumentScanFormDrawer from '../components/DocumentScanFormDrawer';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentScansPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('todas');
  const [formOpen, setFormOpen] = useState(false);
  const [editingScan, setEditingScan] = useState<DocumentScan | null>(null);
  const [deletingScan, setDeletingScan] = useState<DocumentScan | null>(null);

  const { data, isLoading, isError, refetch } = useDocumentScans({ limit: 100 });
  const createDocumentScan = useCreateDocumentScan();
  const updateDocumentScan = useUpdateDocumentScan();
  const deleteDocumentScan = useDeleteDocumentScan();
  const viewFile = useViewDocumentScanFile();

  const scans = useMemo(() => data?.data ?? [], [data]);

  const filtered = useMemo(() => {
    return scans.filter((s) => {
      if (category !== 'todas' && s.category !== category) return false;
      if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [scans, search, category]);

  const onError = (error: unknown) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' });

  const handleSubmit = (values: DocumentScanFormValues, file: File | null) => {
    if (editingScan) {
      updateDocumentScan.mutate(
        {
          id: editingScan.id,
          payload: {
            title: values.title,
            category: values.category,
            documentDate: values.documentDate || undefined,
            notes: values.notes || undefined,
          },
        },
        {
          onSuccess: () => {
            enqueueSnackbar('Documento actualizado correctamente', { variant: 'success' });
            setFormOpen(false);
          },
          onError,
        },
      );
      return;
    }

    if (!file) return;

    createDocumentScan.mutate(
      {
        title: values.title,
        category: values.category,
        documentDate: values.documentDate || undefined,
        notes: values.notes || undefined,
        file,
      },
      {
        onSuccess: () => {
          enqueueSnackbar('Documento subido correctamente', { variant: 'success' });
          setFormOpen(false);
        },
        onError,
      },
    );
  };

  const columns: ColumnDef<DocumentScan, unknown>[] = [
    { accessorKey: 'title', header: 'Título' },
    {
      id: 'category',
      header: 'Categoría',
      cell: ({ row }) => DOCUMENT_SCAN_CATEGORY_LABELS[row.original.category],
    },
    {
      id: 'documentDate',
      header: 'Fecha',
      cell: ({ row }) => (row.original.documentDate ? <DateDisplay value={row.original.documentDate} variant="body2" /> : '—'),
    },
    { id: 'fileSize', header: 'Tamaño', cell: ({ row }) => formatFileSize(row.original.fileSizeBytes) },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              viewFile.mutate(row.original.id, { onError });
            }}
          >
            <Eye size={14} />
          </IconButton>
          <Can permission="document_scans.manage">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setDeletingScan(row.original);
              }}
            >
              <Trash2 size={14} />
            </IconButton>
          </Can>
        </>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Facturas y Recibos"
        subtitle="Escaneos de facturas, recibos y otros documentos del negocio."
        breadcrumbs={[{ label: 'Facturas y Recibos' }]}
        actions={
          <Can permission="document_scans.manage">
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => {
                setEditingScan(null);
                setFormOpen(true);
              }}
            >
              Nuevo escaneo
            </Button>
          </Can>
        }
      />

      <FilterBar
        onClear={() => {
          setSearch('');
          setCategory('todas');
        }}
        hasActiveFilters={Boolean(search) || category !== 'todas'}
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por título..." />
        <TextField select size="small" label="Categoría" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="todas">Todas las categorías</MenuItem>
          {(Object.entries(DOCUMENT_SCAN_CATEGORY_LABELS) as [DocumentScanCategory, string][]).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      </FilterBar>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          onRowClick={(row) => {
            setEditingScan(row);
            setFormOpen(true);
          }}
          emptyTitle="No hay documentos con estos filtros"
          pageSize={12}
        />
      )}

      <DocumentScanFormDrawer
        open={formOpen}
        loading={createDocumentScan.isPending || updateDocumentScan.isPending}
        initialDocumentScan={editingScan}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deletingScan)}
        title="Eliminar documento"
        description={`¿Seguro que deseas eliminar "${deletingScan?.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        onClose={() => setDeletingScan(null)}
        onConfirm={() => {
          if (!deletingScan) return;
          deleteDocumentScan.mutate(deletingScan.id, {
            onSuccess: () => enqueueSnackbar('Documento eliminado', { variant: 'success' }),
            onError,
            onSettled: () => setDeletingScan(null),
          });
        }}
      />
    </>
  );
}
