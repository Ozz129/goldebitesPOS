import { printThermalDocument } from '../../orders/utils/print-thermal-document';
import { escapeHtml } from '../../orders/utils/escape-html';
import { EMPLOYEE_PAY_FREQUENCY_LABELS } from '../employee-status';
import type { Employee } from '../types/employee.types';

interface PrintReceiptOptions {
  businessName?: string;
  businessLogo?: string | null;
  legalName?: string | null;
}

function buildReceiptHtml(employee: Employee, { businessName, businessLogo, legalName }: PrintReceiptOptions): string {
  const fullName = `${employee.firstName} ${employee.lastName}`;
  const dateLabel = new Date().toLocaleDateString('es-CO', { dateStyle: 'long' });
  const amountLabel = employee.payRate != null ? `$${employee.payRate.toLocaleString('es-CO')}` : '—';
  const frequencyLabel = employee.payFrequency
    ? EMPLOYEE_PAY_FREQUENCY_LABELS[employee.payFrequency]
    : 'Sin definir';

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Comprobante de pago — ${escapeHtml(fullName)}</title>
<style>
  @page { margin: 20mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    color: #111;
  }
  .header { text-align: center; margin-bottom: 10mm; }
  .logo { max-width: 40mm; max-height: 25mm; margin-bottom: 2mm; }
  .business { font-size: 18px; font-weight: 700; text-transform: uppercase; }
  .legal { font-size: 12px; color: #555; margin-top: 1mm; }
  .title { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 4mm; }
  hr { border: none; border-top: 1px solid #999; margin: 6mm 0; }
  .row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 3mm; }
  .row .label { color: #555; }
  .row .value { font-weight: 600; }
  .amount-box {
    margin-top: 6mm;
    padding: 6mm;
    border: 2px solid #111;
    border-radius: 4px;
    text-align: center;
  }
  .amount-box .label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #555; }
  .amount-box .value { font-size: 28px; font-weight: 800; margin-top: 2mm; }
  .signatures { display: flex; justify-content: space-between; margin-top: 20mm; }
  .signature { width: 45%; text-align: center; }
  .signature .line { border-top: 1px solid #111; padding-top: 2mm; font-size: 12px; color: #555; }
  .footer { margin-top: 10mm; text-align: center; font-size: 11px; color: #777; }
</style>
</head>
<body>
  <div class="header">
    ${businessLogo ? `<img class="logo" src="${businessLogo}" alt="" />` : ''}
    ${businessName ? `<div class="business">${escapeHtml(businessName)}</div>` : ''}
    ${legalName && legalName !== businessName ? `<div class="legal">${escapeHtml(legalName)}</div>` : ''}
    <div class="title">Comprobante de pago</div>
  </div>

  <div class="row"><span class="label">Empleado</span><span class="value">${escapeHtml(fullName)}</span></div>
  ${employee.position ? `<div class="row"><span class="label">Cargo</span><span class="value">${escapeHtml(employee.position)}</span></div>` : ''}
  <div class="row"><span class="label">Frecuencia de pago</span><span class="value">${escapeHtml(frequencyLabel)}</span></div>
  <div class="row"><span class="label">Fecha</span><span class="value">${escapeHtml(dateLabel)}</span></div>

  <div class="amount-box">
    <div class="label">Valor pagado</div>
    <div class="value">${amountLabel}</div>
  </div>

  <div class="signatures">
    <div class="signature">
      <div class="line">Firma del empleado</div>
    </div>
    <div class="signature">
      <div class="line">Firma del responsable</div>
    </div>
  </div>

  <div class="footer">Generado el ${escapeHtml(new Date().toLocaleString('es-CO'))}</div>
</body>
</html>`;
}

/** printThermalDocument is just a generic "print this HTML" helper — the @page CSS above renders it as a normal letter-size document. */
export function printPaymentReceipt(employee: Employee, options: PrintReceiptOptions = {}): void {
  printThermalDocument(buildReceiptHtml(employee, options));
}
