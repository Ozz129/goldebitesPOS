import { formatCOP } from '../../../utils/format';
import { ORDER_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '../order-status';
import { printThermalDocument } from './print-thermal-document';
import { escapeHtml } from './escape-html';
import type { OrderWithItems } from '../types/order.types';
import type { Payment } from '../types/payment.types';

interface PrintInvoiceOptions {
  businessName?: string;
  legalName?: string | null;
  taxId?: string | null;
  phone?: string | null;
}

function buildInvoiceHtml(
  order: OrderWithItems,
  payments: Payment[],
  { businessName, legalName, taxId, phone }: PrintInvoiceOptions,
): string {
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
          <div class="item-line">
            <span class="item-name"><span class="qty">${item.quantity}×</span> ${escapeHtml(item.productNameSnapshot)}</span>
            <span class="item-total">${formatCOP(item.totalPrice)}</span>
          </div>
          ${selections ? `<div class="note">${escapeHtml(selections)}</div>` : ''}
        </div>
      `;
    })
    .join('');

  const paymentsHtml = payments
    .map(
      (payment) => `
        <div class="totals-line">
          <span>${escapeHtml(PAYMENT_METHOD_LABELS[payment.paymentMethod])}${payment.payerLabel ? ` · ${escapeHtml(payment.payerLabel)}` : ''}</span>
          <span>${formatCOP(payment.amount)}</span>
        </div>
      `,
    )
    .join('');

  const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const tableLine = order.tableNumber
    ? `<div class="meta">${order.orderType === 'CAR_SERVICE' ? 'Vehículo' : 'Mesa'}: ${escapeHtml(order.tableNumber)}</div>`
    : '';

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Factura #${order.orderNumber}</title>
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
  .legal { font-size: 10px; margin-top: 0.5mm; }
  .order-number { font-size: 22px; font-weight: 800; margin-top: 1.5mm; }
  .title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 1mm; }
  .type { font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 1mm; }
  .meta { font-size: 12px; margin-top: 1mm; }
  .date { font-size: 10px; color: #333; margin-top: 1mm; }
  hr { border: none; border-top: 1px dashed #000; margin: 2.5mm 0; }
  .item { margin-bottom: 2mm; }
  .item-line { display: flex; justify-content: space-between; gap: 2mm; font-size: 13px; font-weight: 700; }
  .item-name { word-break: break-word; }
  .item-total { white-space: nowrap; }
  .qty { display: inline-block; min-width: 7mm; }
  .note { font-size: 11px; margin-left: 7mm; word-break: break-word; }
  .totals-line { display: flex; justify-content: space-between; font-size: 12px; margin: 0.75mm 0; }
  .totals-line.total { font-size: 15px; font-weight: 800; margin-top: 1.5mm; }
  .footer { margin-top: 3mm; text-align: center; font-size: 9px; }
</style>
</head>
<body>
  <div class="header">
    ${businessName ? `<div class="business">${escapeHtml(businessName)}</div>` : ''}
    ${legalName && legalName !== businessName ? `<div class="legal">${escapeHtml(legalName)}</div>` : ''}
    ${taxId ? `<div class="legal">NIT: ${escapeHtml(taxId)}</div>` : ''}
    ${phone ? `<div class="legal">Tel: ${escapeHtml(phone)}</div>` : ''}
    <div class="order-number">#${order.orderNumber}</div>
    <div class="title">Factura de venta</div>
    <div class="type">${ORDER_TYPE_LABELS[order.orderType]}</div>
    ${tableLine}
    <div class="date">${dateLabel}</div>
  </div>
  <hr />
  ${itemsHtml}
  <hr />
  <div class="totals-line"><span>Subtotal</span><span>${formatCOP(order.subtotal)}</span></div>
  ${order.discountAmount > 0 ? `<div class="totals-line"><span>Descuento</span><span>-${formatCOP(order.discountAmount)}</span></div>` : ''}
  ${order.taxAmount > 0 ? `<div class="totals-line"><span>Impuestos</span><span>${formatCOP(order.taxAmount)}</span></div>` : ''}
  ${order.deliveryFee > 0 ? `<div class="totals-line"><span>Domicilio</span><span>${formatCOP(order.deliveryFee)}</span></div>` : ''}
  <div class="totals-line total"><span>TOTAL</span><span>${formatCOP(order.totalAmount)}</span></div>
  <hr />
  ${paymentsHtml}
  <div class="totals-line" style="font-weight: 700; margin-top: 1mm;"><span>Total pagado</span><span>${formatCOP(amountPaid)}</span></div>
  <div class="footer">¡Gracias por su compra!</div>
</body>
</html>`;
}

export function printInvoice(
  order: OrderWithItems,
  payments: Payment[],
  options: PrintInvoiceOptions = {},
): void {
  printThermalDocument(buildInvoiceHtml(order, payments, options));
}
