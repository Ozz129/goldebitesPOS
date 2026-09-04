import { ORDER_TYPE_LABELS } from '../order-status';
import type { OrderWithItems } from '../types/order.types';

interface PrintTicketOptions {
  businessName?: string;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildTicketHtml(order: OrderWithItems, { businessName }: PrintTicketOptions): string {
  const dateLabel = new Date(order.createdAt).toLocaleString('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const itemsHtml = order.items
    .map((item) => {
      const selections = [
        item.sauceNames.length > 0 && `Salsas: ${item.sauceNames.join(', ')}`,
        item.sideNames.length > 0 && `Acompañantes: ${item.sideNames.join(', ')}`,
      ]
        .filter(Boolean)
        .join(' · ');
      return `
        <div class="item">
          <div class="item-line"><span class="qty">${item.quantity}×</span> ${escapeHtml(item.productNameSnapshot)}</div>
          ${selections ? `<div class="note">${escapeHtml(selections)}</div>` : ''}
          ${item.notes ? `<div class="note">Nota: ${escapeHtml(item.notes)}</div>` : ''}
        </div>
      `;
    })
    .join('');

  const tableLine = order.tableNumber
    ? `<div class="meta">${order.orderType === 'CAR_SERVICE' ? 'Vehículo' : 'Mesa'}: ${escapeHtml(order.tableNumber)}</div>`
    : '';

  const notesBlock = order.notes
    ? `<div class="order-notes">Nota del pedido: ${escapeHtml(order.notes)}</div>`
    : '';

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Comanda #${order.orderNumber}</title>
<style>
  @page { margin: 0; size: 80mm auto; }
  html, body { width: 80mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 3mm 3mm;
    font-family: 'Courier New', monospace;
    color: #000;
  }
  .header { text-align: center; margin-bottom: 3mm; }
  .business { font-size: 15px; font-weight: 700; text-transform: uppercase; }
  .order-number { font-size: 26px; font-weight: 800; margin-top: 1.5mm; }
  .type { font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 1mm; }
  .meta { font-size: 12px; margin-top: 1mm; }
  .date { font-size: 10px; color: #333; margin-top: 1mm; }
  hr { border: none; border-top: 1px dashed #000; margin: 2.5mm 0; }
  .item { margin-bottom: 2mm; }
  .item-line { font-size: 14px; font-weight: 700; word-break: break-word; }
  .qty { display: inline-block; min-width: 7mm; }
  .note { font-size: 11px; font-weight: 700; margin-left: 7mm; word-break: break-word; }
  .order-notes { margin-top: 2.5mm; font-size: 11px; font-weight: 700; border: 1px dashed #000; padding: 1.5mm; word-break: break-word; }
  .footer { margin-top: 3mm; text-align: center; font-size: 9px; }
</style>
</head>
<body>
  <div class="header">
    ${businessName ? `<div class="business">${escapeHtml(businessName)}</div>` : ''}
    <div class="order-number">#${order.orderNumber}</div>
    <div class="type">${ORDER_TYPE_LABELS[order.orderType]}</div>
    ${tableLine}
    <div class="date">${dateLabel}</div>
  </div>
  <hr />
  ${itemsHtml}
  ${notesBlock}
  <div class="footer">— Comanda de cocina —</div>
</body>
</html>`;
}

/**
 * Imprime la comanda usando el diálogo de impresión del navegador. Funciona con termoimpresoras
 * de 80mm instaladas como impresora del sistema operativo (USB/Bluetooth con driver). El navegador
 * debe tener seleccionado el tamaño de papel de 80mm/continuo en el diálogo de impresión — el CSS
 * solo puede sugerirlo vía @page, no forzarlo.
 */
export function printKitchenTicket(order: OrderWithItems, options: PrintTicketOptions = {}): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const cleanup = () => {
    setTimeout(() => {
      iframe.parentNode?.removeChild(iframe);
    }, 1000);
  };

  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) {
      cleanup();
      return;
    }
    win.focus();
    win.print();
    cleanup();
  };

  const doc = iframe.contentDocument;
  if (!doc) {
    cleanup();
    return;
  }
  doc.open();
  doc.write(buildTicketHtml(order, options));
  doc.close();
}
