import { useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useSnackbar } from 'notistack';
import PageHeader from '../../../components/common/PageHeader';
import FilterBar from '../../../components/common/FilterBar';
import SearchInput from '../../../components/common/SearchInput';
import DataTable from '../../../components/common/DataTable';
import ErrorState from '../../../components/common/ErrorState';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import CurrencyDisplay from '../../../components/common/CurrencyDisplay';
import { Can } from '../../../modules/auth/components/can';
import { useCustomers } from '../../../modules/customers/hooks/use-customers';
import { useCreateCustomer } from '../../../modules/customers/hooks/use-create-customer';
import { useUpdateCustomer } from '../../../modules/customers/hooks/use-update-customer';
import { useDeleteCustomer } from '../../../modules/customers/hooks/use-delete-customer';
import { normalizeApiError } from '../../../lib/api/api-error';
import type { Customer } from '../../../modules/customers/types/customer.types';
import type { CustomerFormValues } from '../schemas/customerSchema';
import CustomerDetailDrawer from '../components/CustomerDetailDrawer';
import CustomerFormDrawer from '../components/CustomerFormDrawer';

export default function CustomersPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const filters = useMemo(() => ({ limit: 100, search: search || undefined }), [search]);

  const { data, isLoading, isError, refetch } = useCustomers(filters);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const customers = data?.data ?? [];

  const handleSubmit = (values: CustomerFormValues) => {
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName || undefined,
      email: values.email || undefined,
      phone: values.phone || undefined,
      documentNumber: values.documentNumber || undefined,
      notes: values.notes || undefined,
    };

    if (editingCustomer) {
      updateCustomer.mutate(
        { id: editingCustomer.id, payload },
        {
          onSuccess: () => {
            enqueueSnackbar('Cliente actualizado correctamente', { variant: 'success' });
            setFormOpen(false);
          },
          onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
        },
      );
    } else {
      createCustomer.mutate(payload, {
        onSuccess: () => {
          enqueueSnackbar('Cliente creado correctamente', { variant: 'success' });
          setFormOpen(false);
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      });
    }
  };

  const handleSaveNotes = (customer: Customer, notes: string) => {
    updateCustomer.mutate(
      { id: customer.id, payload: { notes } },
      {
        onSuccess: (updated) => {
          enqueueSnackbar('Notas guardadas', { variant: 'success' });
          setSelected(updated);
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  };

  const handleDelete = () => {
    if (!deletingCustomer) return;
    deleteCustomer.mutate(deletingCustomer.id, {
      onSuccess: () => enqueueSnackbar('Cliente eliminado', { variant: 'success' }),
      onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      onSettled: () => setDeletingCustomer(null),
    });
  };

  const columns: ColumnDef<Customer, unknown>[] = [
    {
      id: 'name',
      header: 'Cliente',
      cell: ({ row }) => (
        <Stack>
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            {row.original.firstName} {row.original.lastName ?? ''}
          </span>
          <span style={{ fontSize: 12, opacity: 0.7 }}>{row.original.phone ?? '—'}</span>
        </Stack>
      ),
    },
    { accessorKey: 'totalOrders', header: 'Pedidos' },
    {
      accessorKey: 'totalSpent',
      header: 'Total gastado',
      cell: ({ getValue }) => (
        <CurrencyDisplay value={getValue<number>()} variant="body2" sx={{ fontWeight: 700 }} />
      ),
    },
    { accessorKey: 'loyaltyPoints', header: 'Puntos' },
  ];

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle="Base de clientes registrados en el negocio."
        breadcrumbs={[{ label: 'Clientes' }]}
        actions={
          <Can permission="orders.create">
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => {
                setEditingCustomer(null);
                setFormOpen(true);
              }}
            >
              Nuevo cliente
            </Button>
          </Can>
        }
      />

      <FilterBar onClear={() => setSearch('')} hasActiveFilters={Boolean(search)}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, teléfono o email..." />
      </FilterBar>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={customers}
          isLoading={isLoading}
          onRowClick={(row) => setSelected(row)}
          emptyTitle="No hay clientes con estos filtros"
          emptyDescription="Ajusta la búsqueda o crea un nuevo cliente."
          pageSize={10}
        />
      )}

      <CustomerDetailDrawer
        customer={selected}
        onClose={() => setSelected(null)}
        onEdit={(c) => {
          setSelected(null);
          setEditingCustomer(c);
          setFormOpen(true);
        }}
        onDelete={(c) => {
          setSelected(null);
          setDeletingCustomer(c);
        }}
        onSaveNotes={handleSaveNotes}
      />

      <CustomerFormDrawer
        open={formOpen}
        initialCustomer={editingCustomer}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deletingCustomer)}
        title="Eliminar cliente"
        description={`¿Seguro que deseas eliminar a "${deletingCustomer?.firstName}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        onClose={() => setDeletingCustomer(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
