import { useMemo, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ColumnDef } from '@tanstack/react-table';
import { useSnackbar } from 'notistack';
import { ShoppingCart, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/common/DataTable';
import StatusChip from '../../../components/common/StatusChip';
import DateDisplay from '../../../components/common/DateDisplay';
import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { Can } from '../../../modules/auth/components/can';
import { useAuthStore } from '../../../modules/auth/store/auth.store';
import { useSuppliers } from '../../../modules/suppliers/hooks/use-suppliers';
import { useInventoryItems } from '../../../modules/inventory/hooks/use-inventory-items';
import { useLowStock } from '../../../modules/inventory/hooks/use-low-stock';
import { usePurchaseOrders } from '../../../modules/purchases/hooks/use-purchase-orders';
import { usePurchaseOrder } from '../../../modules/purchases/hooks/use-purchase-order';
import { useCreatePurchaseOrder } from '../../../modules/purchases/hooks/use-create-purchase-order';
import {
  useSubmitPurchaseOrder,
  useApprovePurchaseOrder,
  useCancelPurchaseOrder,
} from '../../../modules/purchases/hooks/use-purchase-order-transitions';
import { useReceiveGoods } from '../../../modules/purchases/hooks/use-receive-goods';
import { useExpenses } from '../../../modules/finances/hooks/use-expenses';
import { useCreateExpense } from '../../../modules/finances/hooks/use-create-expense';
import { useDeleteExpense } from '../../../modules/finances/hooks/use-delete-expense';
import { EXPENSE_CATEGORY_LABELS } from '../../../modules/finances/expense-category';
import { normalizeApiError } from '../../../lib/api/api-error';
import { formatCOP } from '../../../utils/format';
import {
  PURCHASE_ORDER_STATUS_LABELS,
  PURCHASE_ORDER_STATUS_TONE,
} from '../../../modules/purchases/purchase-order-status';
import type { PurchaseOrder, PurchaseOrderWithItems } from '../../../modules/purchases/types/purchase-order.types';
import type { PurchaseOrderFormValues } from '../schemas/purchaseOrderSchema';
import type { Expense } from '../../../modules/finances/types/expense.types';
import type { ExpenseFormValues } from '../../finances/schemas/expenseSchema';
import PurchaseOrderDetailDrawer from '../components/PurchaseOrderDetailDrawer';
import PurchaseOrderFormDrawer from '../components/PurchaseOrderFormDrawer';
import ExpenseFormDrawer from '../../finances/components/ExpenseFormDrawer';
import { supplierNameResolver } from '../utils/supplier-name-resolver';

export default function PurchasesPage() {
  const { enqueueSnackbar } = useSnackbar();
  const branchId = useAuthStore((s) => s.user?.branchId ?? null);

  const [tab, setTab] = useState<'sugerencia' | 'ordenes' | 'gastos'>('sugerencia');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const { data: suppliersData } = useSuppliers({ limit: 100, isActive: true });
  const suppliers = suppliersData?.data ?? [];
  const { data: itemsData } = useInventoryItems({ limit: 100, isActive: true });
  const inventoryItems = useMemo(() => itemsData?.data ?? [], [itemsData]);
  const { data: lowStock } = useLowStock(branchId ?? undefined);

  const { data: ordersData, isLoading, isError, refetch } = usePurchaseOrders({ limit: 50 });
  const orders = ordersData?.data ?? [];
  const { data: selectedOrder } = usePurchaseOrder(selectedOrderId);

  const createOrder = useCreatePurchaseOrder();
  const submitOrder = useSubmitPurchaseOrder();
  const approveOrder = useApprovePurchaseOrder();
  const cancelOrder = useCancelPurchaseOrder();
  const receiveGoods = useReceiveGoods();

  const { data: expensesData } = useExpenses({ limit: 100 });
  const expenses = expensesData?.data ?? [];
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();

  const getSupplierName = supplierNameResolver(suppliers);

  const initialLines = useMemo(() => {
    const itemById = new Map(inventoryItems.map((i) => [i.id, i]));
    return selectedIds
      .map((id) => itemById.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({
        inventoryItemId: item.id,
        quantity: Math.max(1, item.minimumStock * 2),
        unitCost: item.currentCost,
      }));
  }, [selectedIds, inventoryItems]);

  function toggleSelected(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function handleCreateOrder(values: PurchaseOrderFormValues) {
    if (!branchId) {
      enqueueSnackbar('Tu usuario no tiene una sucursal asignada.', { variant: 'error' });
      return;
    }
    createOrder.mutate(
      {
        branchId,
        supplierId: values.supplierId,
        expectedDate: values.expectedDate || undefined,
        notes: values.notes || undefined,
        items: values.items,
      },
      {
        onSuccess: () => {
          enqueueSnackbar('Orden de compra creada correctamente', { variant: 'success' });
          setFormOpen(false);
          setSelectedIds([]);
          setTab('ordenes');
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  }

  function handleCreateExpense(values: ExpenseFormValues) {
    createExpense.mutate(values, {
      onSuccess: () => {
        enqueueSnackbar('Gasto registrado correctamente', { variant: 'success' });
        setExpenseFormOpen(false);
      },
      onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
    });
  }

  function handleSubmitOrder(order: PurchaseOrderWithItems) {
    submitOrder.mutate(order.id, {
      onSuccess: () => enqueueSnackbar('Orden enviada al proveedor', { variant: 'success' }),
      onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
    });
  }

  function handleApproveOrder(order: PurchaseOrderWithItems) {
    approveOrder.mutate(order.id, {
      onSuccess: () => enqueueSnackbar('Orden aprobada', { variant: 'success' }),
      onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
    });
  }

  function handleCancelOrder(order: PurchaseOrderWithItems) {
    cancelOrder.mutate(order.id, {
      onSuccess: () => {
        enqueueSnackbar('Orden cancelada', { variant: 'warning' });
        setSelectedOrderId(null);
      },
      onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
    });
  }

  function handleReceive(order: PurchaseOrderWithItems, receivedQuantities: Record<string, number>) {
    const items = order.items
      .filter((line) => (receivedQuantities[line.id] ?? 0) > 0)
      .map((line) => ({
        purchaseOrderItemId: line.id,
        quantityReceived: receivedQuantities[line.id],
        unitCost: line.unitCost,
      }));
    if (items.length === 0) return;

    receiveGoods.mutate(
      { purchaseOrderId: order.id, items },
      {
        onSuccess: () => {
          enqueueSnackbar('Mercancía recibida e inventario actualizado', { variant: 'success' });
          setSelectedOrderId(null);
        },
        onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
      },
    );
  }

  const orderColumns: ColumnDef<PurchaseOrder, unknown>[] = [
    { accessorKey: 'orderNumber', header: 'Folio', cell: ({ row }) => `OC-${row.original.orderNumber}` },
    {
      id: 'supplier',
      header: 'Proveedor',
      cell: ({ row }) => getSupplierName(row.original.supplierId),
    },
    {
      id: 'status',
      header: 'Estado',
      cell: ({ row }) => (
        <StatusChip
          label={PURCHASE_ORDER_STATUS_LABELS[row.original.status]}
          tone={PURCHASE_ORDER_STATUS_TONE[row.original.status]}
        />
      ),
    },
    { id: 'orderDate', header: 'Creada', cell: ({ row }) => <DateDisplay value={row.original.orderDate} variant="body2" /> },
    {
      id: 'expectedDate',
      header: 'Esperada',
      cell: ({ row }) => (row.original.expectedDate ? <DateDisplay value={row.original.expectedDate} variant="body2" /> : '—'),
    },
    {
      id: 'total',
      header: 'Total',
      cell: ({ row }) => formatCOP(row.original.totalAmount),
    },
  ];

  const expenseColumns: ColumnDef<Expense, unknown>[] = [
    { id: 'date', header: 'Fecha', cell: ({ row }) => <DateDisplay value={row.original.expenseDate} variant="body2" /> },
    { id: 'name', header: 'Nombre', cell: ({ row }) => row.original.name ?? '—' },
    { accessorKey: 'description', header: 'Motivo' },
    { id: 'responsible', header: 'Responsable', cell: ({ row }) => row.original.responsible ?? '—' },
    { id: 'category', header: 'Categoría', cell: ({ row }) => EXPENSE_CATEGORY_LABELS[row.original.category] },
    { id: 'amount', header: 'Cantidad', cell: ({ row }) => formatCOP(row.original.amount) },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Can permission="finances.manage">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingExpense(row.original);
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
        title="Compras"
        subtitle="Sugerencias de compra basadas en inventario, seguimiento de órdenes y registro de gastos."
        breadcrumbs={[{ label: 'Compras' }]}
        actions={
          tab === 'gastos' ? (
            <Can permission="finances.manage">
              <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setExpenseFormOpen(true)}>
                Registrar gasto
              </Button>
            </Can>
          ) : undefined
        }
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Sugerencia de compra" value="sugerencia" />
        <Tab label="Órdenes de compra" value="ordenes" />
        <Tab label="Gastos" value="gastos" />
      </Tabs>

      {tab === 'sugerencia' ? (
        !lowStock || lowStock.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No hay insumos por debajo del stock mínimo"
            description="Cuando el inventario baje del mínimo configurado, aparecerán aquí las sugerencias de compra."
          />
        ) : (
          <>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                {selectedIds.length} insumo(s) seleccionado(s)
              </Typography>
              <Can permission="purchases.create">
                <Button variant="contained" disabled={selectedIds.length === 0} onClick={() => setFormOpen(true)}>
                  Generar orden de compra
                </Button>
              </Can>
            </Stack>
            <DataTable
              columns={[
                {
                  id: 'select',
                  header: '',
                  cell: ({ row }) => (
                    <Checkbox
                      checked={selectedIds.includes(row.original.inventoryItemId)}
                      onChange={() => toggleSelected(row.original.inventoryItemId)}
                    />
                  ),
                },
                { accessorKey: 'name', header: 'Insumo' },
                { accessorKey: 'currentStock', header: 'Stock actual' },
                { accessorKey: 'minimumStock', header: 'Mínimo' },
                { id: 'unit', header: 'Unidad', cell: ({ row }) => row.original.unit },
              ]}
              data={lowStock}
              getRowId={(row) => row.inventoryItemId}
              hidePagination
            />
          </>
        )
      ) : tab === 'gastos' ? (
        <DataTable
          columns={expenseColumns}
          data={expenses}
          emptyTitle="No hay gastos registrados"
          emptyDescription="Registra compras, insumos u otros gastos relacionados con Compras."
          pageSize={10}
        />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={orderColumns}
          data={orders}
          isLoading={isLoading}
          onRowClick={(row) => setSelectedOrderId(row.id)}
          emptyTitle="No hay órdenes de compra"
          pageSize={10}
        />
      )}

      <PurchaseOrderDetailDrawer
        order={selectedOrder ?? null}
        supplierName={getSupplierName}
        onClose={() => setSelectedOrderId(null)}
        onSubmit={handleSubmitOrder}
        onApprove={handleApproveOrder}
        onCancel={handleCancelOrder}
        onReceive={handleReceive}
      />

      <PurchaseOrderFormDrawer
        open={formOpen}
        loading={createOrder.isPending}
        suppliers={suppliers}
        inventoryItems={inventoryItems}
        initialItems={initialLines}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreateOrder}
      />

      <ExpenseFormDrawer
        open={expenseFormOpen}
        loading={createExpense.isPending}
        defaultCategory="COGS"
        onClose={() => setExpenseFormOpen(false)}
        onSubmit={handleCreateExpense}
      />

      <ConfirmDialog
        open={Boolean(deletingExpense)}
        title="Eliminar gasto"
        description={`¿Seguro que deseas eliminar "${deletingExpense?.name ?? deletingExpense?.description}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        onClose={() => setDeletingExpense(null)}
        onConfirm={() => {
          if (!deletingExpense) return;
          deleteExpense.mutate(deletingExpense.id, {
            onSuccess: () => enqueueSnackbar('Gasto eliminado', { variant: 'success' }),
            onError: (error) => enqueueSnackbar(normalizeApiError(error).message, { variant: 'error' }),
            onSettled: () => setDeletingExpense(null),
          });
        }}
      />
    </>
  );
}
