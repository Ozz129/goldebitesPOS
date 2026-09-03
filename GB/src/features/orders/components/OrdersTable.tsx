import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/common/DataTable';
import StatusChip from '../../../components/common/StatusChip';
import CurrencyDisplay from '../../../components/common/CurrencyDisplay';
import DateDisplay from '../../../components/common/DateDisplay';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  ORDER_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
} from '../../../modules/orders/order-status';
import type { Order } from '../../../modules/orders/types/order.types';
import PrintOrderButton from './PrintOrderButton';

interface OrdersTableProps {
  orders: Order[];
  onSelect: (order: Order) => void;
  customerName: (order: Order) => string;
}

export default function OrdersTable({ orders, onSelect, customerName }: OrdersTableProps) {
  const columns: ColumnDef<Order, unknown>[] = [
    {
      id: 'orderNumber',
      header: 'Pedido',
      cell: ({ row }) => (
        <Stack>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            #{row.original.orderNumber}
          </Typography>
          <DateDisplay value={row.original.createdAt} mode="time" variant="caption" color="text.secondary" />
        </Stack>
      ),
    },
    {
      id: 'customer',
      header: 'Cliente',
      cell: ({ row }) => <Typography variant="body2">{customerName(row.original)}</Typography>,
    },
    {
      id: 'orderType',
      header: 'Tipo',
      cell: ({ row }) => <Typography variant="body2">{ORDER_TYPE_LABELS[row.original.orderType]}</Typography>,
    },
    {
      id: 'status',
      header: 'Estado',
      cell: ({ row }) => (
        <StatusChip
          label={ORDER_STATUS_LABELS[row.original.status]}
          tone={ORDER_STATUS_TONE[row.original.status]}
        />
      ),
    },
    {
      id: 'payment',
      header: 'Pago',
      cell: ({ row }) => (
        <StatusChip
          label={PAYMENT_STATUS_LABELS[row.original.paymentStatus]}
          tone={PAYMENT_STATUS_TONE[row.original.paymentStatus]}
        />
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ getValue }) => <CurrencyDisplay value={getValue<number>()} variant="body2" sx={{ fontWeight: 700 }} />,
    },
    {
      id: 'print',
      header: '',
      cell: ({ row }) => <PrintOrderButton orderId={row.original.id} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={orders}
      onRowClick={onSelect}
      getRowId={(order) => order.id}
      emptyTitle="No hay pedidos con estos filtros"
      emptyDescription="Ajusta la búsqueda o crea un nuevo pedido."
      pageSize={12}
    />
  );
}
