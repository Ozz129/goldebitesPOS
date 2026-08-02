import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { UploadCloud } from 'lucide-react';
import FormDrawer from '../../../components/common/FormDrawer';
import { DOCUMENT_SCAN_CATEGORY_LABELS } from '../../../modules/document-scans/document-scan-category';
import { documentScanSchema, type DocumentScanFormValues } from '../schemas/documentScanSchema';
import type { DocumentScan, DocumentScanCategory } from '../../../modules/document-scans/types/document-scan.types';

interface DocumentScanFormDrawerProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: DocumentScanFormValues, file: File | null) => void;
  initialDocumentScan?: DocumentScan | null;
}

const emptyValues: DocumentScanFormValues = {
  title: '',
  category: 'invoice',
  documentDate: '',
  notes: '',
};

const ACCEPTED_TYPES = 'image/jpeg,image/png,application/pdf';

export default function DocumentScanFormDrawer({
  open,
  loading,
  onClose,
  onSubmit,
  initialDocumentScan,
}: DocumentScanFormDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const isEditing = Boolean(initialDocumentScan);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocumentScanFormValues>({
    resolver: zodResolver(documentScanSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      setSelectedFile(null);
      setFileError(null);
      reset(
        initialDocumentScan
          ? {
              title: initialDocumentScan.title,
              category: initialDocumentScan.category,
              documentDate: initialDocumentScan.documentDate?.slice(0, 10) ?? '',
              notes: initialDocumentScan.notes ?? '',
            }
          : emptyValues,
      );
    }
  }, [open, initialDocumentScan, reset]);

  const submit = handleSubmit((values) => {
    if (!isEditing && !selectedFile) {
      setFileError('Adjunta un archivo (JPG, PNG o PDF)');
      return;
    }
    onSubmit(values, selectedFile);
  });

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      onSubmit={submit}
      title={isEditing ? 'Editar documento' : 'Nuevo escaneo'}
      submitLabel={isEditing ? 'Guardar cambios' : 'Subir documento'}
      loading={loading}
      width={440}
    >
      <Stack spacing={2.5}>
        {!isEditing && (
          <Stack spacing={0.75}>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              hidden
              onChange={(e) => {
                setSelectedFile(e.target.files?.[0] ?? null);
                setFileError(null);
              }}
            />
            <Button
              variant="outlined"
              startIcon={<UploadCloud size={16} />}
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? selectedFile.name : 'Seleccionar archivo (JPG, PNG o PDF)'}
            </Button>
            {fileError && (
              <Typography variant="caption" color="error">
                {fileError}
              </Typography>
            )}
          </Stack>
        )}

        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Título"
              fullWidth
              error={Boolean(errors.title)}
              helperText={errors.title?.message}
            />
          )}
        />

        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <TextField {...field} select label="Categoría" fullWidth>
              {(Object.entries(DOCUMENT_SCAN_CATEGORY_LABELS) as [DocumentScanCategory, string][]).map(
                ([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ),
              )}
            </TextField>
          )}
        />

        <Controller
          name="documentDate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Fecha del documento"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        />

        <Controller
          name="notes"
          control={control}
          render={({ field }) => <TextField {...field} label="Notas" multiline minRows={2} fullWidth />}
        />
      </Stack>
    </FormDrawer>
  );
}
