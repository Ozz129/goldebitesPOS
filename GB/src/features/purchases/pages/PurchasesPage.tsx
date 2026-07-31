import { useMemo, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ColumnDef } from '@tanstack/react-table';
import { useSnackbar } from 'notistack';
import { ShoppingCart } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/common/DataTable';
import StatusChip from '../../../components/common/StatusChip';
import DateDisplay from '../../../components/common/DateDisplay';
import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
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
import { normalizeApiError } from '../../../lib/api/api-error';
import { formatCOP } from '../../../utils/format';
import {
  PURCHASE_ORDER_STATUS_LABELS,
  PURCHASE_ORDER_STATUS_TONE,
} from '../../../modules/purchases/purchase-order-status';
import type { PurchaseOrder, PurchaseOrderWithItems } from '../../../modules/purchases/types/purchase-order.types';
import type { PurchaseOrderFormValues } from '../schemas/purchaseOrderSchema';
import PurchaseOrderDetailDrawer from '../components/PurchaseOrderDetailDrawer';
import PurchaseOrderFormDrawer from '../components/PurchaseOrderFormDrawer';
import { supplierNameResolver } from '../utils/supplier-name-resolver';

export default function PurchasesPage() {
  const { enqueueSnackbar } = useSnackbar();
  const branchId = useAuthStore((s) => s.user?.branchId ?? null);

  const [tab, setTab] = useState<'sugerencia' | 'ordenes'>('sugerencia');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

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

  return (
    <>
      <PageHeader
        title="Compras"
        subtitle="Sugerencias de compra basadas en inventario y seguimiento de órdenes."
        breadcrumbs={[{ label: 'Compras' }]}
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Sugerencia de compra" value="sugerencia" />
        <Tab label="Órdenes de compra" value="ordenes" />
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
    </>
  );
}
