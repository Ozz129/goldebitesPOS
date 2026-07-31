import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { Pencil, Trash2 } from 'lucide-react';
import DetailDrawer from '../../../components/common/DetailDrawer';
import StatusChip from '../../../components/common/StatusChip';
import { Can } from '../../../modules/auth/components/can';
import { useChecklistTemplate } from '../../../modules/checklists/hooks/use-checklist-template';
import { CHECKLIST_TYPE_LABELS } from '../../../modules/checklists/checklist-status';
import type { ChecklistTemplateWithItems } from '../../../modules/checklists/types/checklist.types';

interface ChecklistTemplateDetailDrawerProps {
  templateId: string | null;
  onClose: () => void;
  onEdit: (template: ChecklistTemplateWithItems) => void;
  onDelete: (template: ChecklistTemplateWithItems) => void;
  onToggleStatus: (template: ChecklistTemplateWithItems) => void;
  toggling?: boolean;
}

export default function ChecklistTemplateDetailDrawer({
  templateId,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
  toggling,
}: ChecklistTemplateDetailDrawerProps) {
  const { data: template } = useChecklistTemplate(templateId);

  if (!templateId || !template) return null;

  return (
    <DetailDrawer
      open={Boolean(templateId)}
      onClose={onClose}
      title={template.name}
      subtitle={CHECKLIST_TYPE_LABELS[template.type]}
      headerExtra={
        <StatusChip label={template.isActive ? 'Activa' : 'Inactiva'} tone={template.isActive ? 'success' : 'neutral'} />
      }
      footer={
        <Can permission="checklists.manage">
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
            <Button color="error" startIcon={<Trash2 size={16} />} onClick={() => onDelete(template)}>
              Eliminar
            </Button>
            <Button
              variant="outlined"
              loading={toggling}
              onClick={() => onToggleStatus(template)}
            >
              {template.isActive ? 'Desactivar' : 'Activar'}
            </Button>
            <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => onEdit(template)}>
              Editar
            </Button>
          </Stack>
        </Can>
      }
    >
      <Stack spacing={2}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Ítems a verificar
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {template.items.map((item) => (
            <Chip key={item.id} label={item.label} variant="outlined" />
          ))}
        </Box>
      </Stack>
    </DetailDrawer>
  );
}
