import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface PublicMenuLinkDialogProps {
  open: boolean;
  businessId: string | undefined;
  onClose: () => void;
}

export default function PublicMenuLinkDialog({ open, businessId, onClose }: PublicMenuLinkDialogProps) {
  const [copied, setCopied] = useState(false);
  const link = businessId ? `${window.location.origin}/menu/${businessId}` : '';

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Vista previa del menú</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Vista previa general del catálogo — muestra los productos activos y visibles con precio y
          descripción, y se actualiza sola cuando cambias el catálogo. No identifica una sucursal ni una
          mesa, y no inicia una visita: para enlaces que sí fijan mesa (los gallos NFC), ve a
          Configuración → Sedes → Administrar mesas y NFC.
        </Typography>
        <TextField
          fullWidth
          value={link}
          slotProps={{ htmlInput: { readOnly: true } }}
          onFocus={(e) => e.target.select()}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          startIcon={<ExternalLink size={16} />}
          onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
        >
          Abrir
        </Button>
        <Button
          variant="contained"
          startIcon={copied ? <Check size={16} /> : <Copy size={16} />}
          onClick={handleCopy}
        >
          {copied ? 'Copiado' : 'Copiar enlace'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
