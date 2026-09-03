import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Printer } from 'lucide-react';
import { useOrder } from '../../../modules/orders/hooks/use-order';
import { usePrintKitchenTicket } from '../../../modules/orders/hooks/use-print-kitchen-ticket';

interface PrintOrderButtonProps {
  orderId: string;
  size?: 'small' | 'medium';
}

/** Reusable "Imprimir comanda" action — used in the Kanban card, the table row, and the detail drawer. */
export default function PrintOrderButton({ orderId, size = 'small' }: PrintOrderButtonProps) {
  const { data: order } = useOrder(orderId);
  const printTicket = usePrintKitchenTicket();

  return (
    <Tooltip title="Imprimir comanda">
      <span>
        <IconButton
          size={size}
          disabled={!order}
          onClick={(e) => {
            e.stopPropagation();
            if (order) printTicket(order);
          }}
          sx={{ color: 'text.secondary' }}
        >
          <Printer size={16} />
        </IconButton>
      </span>
    </Tooltip>
  );
}
