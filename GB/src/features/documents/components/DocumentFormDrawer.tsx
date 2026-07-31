import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormDrawer from '../../../components/common/FormDrawer';
import { documentSchema, type DocumentFormValues } from '../schemas/documentSchema';
import type { ComplianceDocument } from '../../../modules/documents/types/document.types';

interface DocumentFormDrawerProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: DocumentFormValues) => void;
  initialDocument?: ComplianceDocument | null;
}

const emptyValues: DocumentFormValues = {
  name: '',
  category: '',
  issueDate: '',
  expirationDate: '',
  responsible: '',
  fileName: '',
  notes: '',
};

export default function DocumentFormDrawer({
  open,
  loading,
  onClose,
  onSubmit,
  initialDocument,
}: DocumentFormDrawerProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initialDocument
          ? {
              name: initialDocument.name,
              category: initialDocument.category,
              issueDate: initialDocument.issueDate.slice(0, 10),
              expirationDate: initialDocument.expirationDate?.slice(0, 10) ?? '',
              responsible: initialDocument.responsible ?? '',
              fileName: initialDocument.fileName ?? '',
              notes: initialDocument.notes ?? '',
            }
          : emptyValues,
      );
    }
  }, [open, initialDocument, reset]);

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      onSubmit={submit}
      title={initialDocument ? 'Editar documento' : 'Nuevo documento'}
      submitLabel={initialDocument ? 'Guardar cambios' : 'Registrar documento'}
      loading={loading}
      width={440}
    >
      <Stack spacing={2.5}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Nombre" fullWidth error={Boolean(errors.name)} helperText={errors.name?.message} />
          )}
        />

        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Categoría"
              fullWidth
              error={Boolean(errors.category)}
              helperText={errors.category?.message}
            />
          )}
        />

        <Stack direction="row" spacing={2}>
          <Controller
            name="issueDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Fecha de emisión"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                error={Boolean(errors.issueDate)}
                helperText={errors.issueDate?.message}
              />
            )}
          />
          <Controller
            name="expirationDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Fecha de vencimiento"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />
        </Stack>

        <Controller
          name="responsible"
          control={control}
          render={({ field }) => <TextField {...field} label="Responsable" fullWidth />}
        />

        <Controller
          name="fileName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nombre de archivo (referencia)"
              helperText="Solo texto de referencia: esta aplicación no almacena archivos."
              fullWidth
            />
          )}
        />

        <Controller
          name="notes"
          control={control}
          render={({ field }) => <TextField {...field} label="Observaciones" multiline minRows={2} fullWidth />}
        />
      </Stack>
    </FormDrawer>
  );
}
