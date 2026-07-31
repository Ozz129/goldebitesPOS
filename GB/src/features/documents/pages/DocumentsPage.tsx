import { useMemo, useState } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import type { ColumnDef } from '@tanstack/react-table';
import { useSnackbar } from 'notistack';
import { FileWarning, FileCheck2, FileClock, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';
import FilterBar from '../../../components/common/FilterBar';
import SearchInput from '../../../components/common/SearchInput';
import DataTable from '../../../components/common/DataTable';
import StatusChip from '../../../components/common/StatusChip';
import DateDisplay from '../../../components/common/DateDisplay';
import ErrorState from '../../../components/common/ErrorState';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { Can } from '../../../modules/auth/components/can';
import { useDocuments } from '../../../modules/documents/hooks/use-documents';
import { useCreateDocument } from '../../../modules/documents/hooks/use-create-document';
import { useUpdateDocument } from '../../../modules/documents/hooks/use-update-document';
import { useDeleteDocument } from '../../../modules/documents/hooks/use-delete-document';
import { normalizeApiError } from '../../../lib/api/api-error';
import { DOCUMENT_STATUS_LABELS, DOCUMENT_STATUS_TONE, getDocumentStatus } from '../../../modules/documents/document-status';
import type { ComplianceDocument } from '../../../modules/documents/types/document.types';
import type { DocumentFormValues } from '../schemas/documentSchema';
import DocumentFormDrawer from '../components/DocumentFormDrawer';

export default function DocumentsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('todas');
  const [formOpen, setFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<ComplianceDocument | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<ComplianceDocument | null>(null);

  const { data, isLoading, isError, refetch } = useDocuments({ limit: 100 });
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  const documents = useMemo(() => data?.data ?? [], [data]);
  const categories = useMemo(() => Array.from(new Set(documents.map((d) => d.category))), [documents]);

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      if (category !== 'todas' && d.category !== category) return false;
      if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [documents, search, category]);

  const vigentes = documents.filter((d) => getDocumentStatus(d) === 'vigente').length;
  const porVencer = documents.filter((d) => getDocumentStatus(d) === 'por_vencer').length;
  const vencidos = documents.filter((d) => getDocumentStatus(d) === 'vencido').length;

  const onError = (error: unknown) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' });

  const handleSubmit = (values: DocumentFormValues) => {
    const payload = {
      name: values.name,
      category: values.category,
      issueDate: values.issueDate,
      expirationDate: values.expirationDate || undefined,
      responsible: values.responsible || undefined,
      fileName: values.fileName || undefined,
      notes: values.notes || undefined,
    };

    if (editingDocument) {
      updateDocument.mutate(
        { id: editingDocument.id, payload },
        {
          onSuccess: () => {
            enqueueSnackbar('Documento actualizado correctamente', { variant: 'success' });
            setFormOpen(false);
          },
          onError,
        },
      );
    } else {
      createDocument.mutate(payload, {
        onSuccess: () => {
          enqueueSnackbar('Documento registrado correctamente', { variant: 'success' });
          setFormOpen(false);
        },
        onError,
      });
    }
  };

  const columns: ColumnDef<ComplianceDocument, unknown>[] = [
    { accessorKey: 'name', header: 'Documento' },
    { accessorKey: 'category', header: 'Categoría' },
    { id: 'issueDate', header: 'Emisión', cell: ({ row }) => <DateDisplay value={row.original.issueDate} variant="body2" /> },
    {
      id: 'expirationDate',
      header: 'Vencimiento',
      cell: ({ row }) => (row.original.expirationDate ? <DateDisplay value={row.original.expirationDate} variant="body2" /> : 'No aplica'),
    },
    { id: 'responsible', header: 'Responsable', cell: ({ row }) => row.original.responsible ?? '—' },
    {
      id: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = getDocumentStatus(row.original);
        return <StatusChip label={DOCUMENT_STATUS_LABELS[status]} tone={DOCUMENT_STATUS_TONE[status]} />;
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Can permission="documents.manage">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingDocument(row.original);
            }}
          >
            <Trash2 size={14} />
          </IconButton>
        </Can>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Documentos"
        subtitle="Documentos legales, sanitarios y de cumplimiento del negocio."
        breadcrumbs={[{ label: 'Documentos' }]}
        actions={
          <Can permission="documents.manage">
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => {
                setEditingDocument(null);
                setFormOpen(true);
              }}
            >
              Nuevo documento
            </Button>
          </Can>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Documentos vigentes" value={String(vigentes)} icon={FileCheck2} accent="#4CAF6D" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Por vencer (30 días)" value={String(porVencer)} icon={FileClock} accent="#D9A441" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Documentos vencidos" value={String(vencidos)} icon={FileWarning} accent="#D9534F" />
        </Grid>
      </Grid>

      <FilterBar
        onClear={() => {
          setSearch('');
          setCategory('todas');
        }}
        hasActiveFilters={Boolean(search) || category !== 'todas'}
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar documento..." />
        <TextField select size="small" label="Categoría" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="todas">Todas las categorías</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
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
            setEditingDocument(row);
            setFormOpen(true);
          }}
          emptyTitle="No hay documentos con estos filtros"
          pageSize={12}
        />
      )}

      <DocumentFormDrawer
        open={formOpen}
        loading={createDocument.isPending || updateDocument.isPending}
        initialDocument={editingDocument}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deletingDocument)}
        title="Eliminar documento"
        description={`¿Seguro que deseas eliminar "${deletingDocument?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        onClose={() => setDeletingDocument(null)}
        onConfirm={() => {
          if (!deletingDocument) return;
          deleteDocument.mutate(deletingDocument.id, {
            onSuccess: () => enqueueSnackbar('Documento eliminado', { variant: 'success' }),
            onError,
            onSettled: () => setDeletingDocument(null),
          });
        }}
      />
    </>
  );
}
