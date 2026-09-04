/**
 * Imprime un documento HTML usando el diálogo de impresión del navegador. Funciona con
 * termoimpresoras de 80mm instaladas como impresora del sistema operativo (USB/Bluetooth
 * con driver). El navegador debe tener seleccionado el tamaño de papel de 80mm/continuo en
 * el diálogo de impresión — el CSS del documento solo puede sugerirlo vía @page, no forzarlo.
 */
export function printThermalDocument(html: string): void {
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
  doc.write(html);
  doc.close();
}
