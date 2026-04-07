import type { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Tooltip,
  Box,
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Shared confirm dialog used to gate destructive actions.
 * Renders an MUI Dialog with a Cancel + (optionally destructive) Confirm button.
 * When `loading` is true, both buttons are disabled and the confirm button shows
 * an inline spinner with a "Processing…" tooltip.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmColor = destructive ? 'error' : 'primary';

  const confirmButton = (
    <Button
      onClick={onConfirm}
      color={confirmColor}
      variant="contained"
      disabled={loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
    >
      {confirmLabel}
    </Button>
  );

  return (
    <Dialog
      open={open}
      onClose={(_event, reason) => {
        // Block all close attempts (escape, backdrop click) while the action is in flight.
        if (loading) return;
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          onCancel();
        }
      }}
      disableEscapeKeyDown={loading}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle component="h2">{title}</DialogTitle>
      <DialogContent>
        {typeof description === 'string' ? (
          <DialogContentText>{description}</DialogContentText>
        ) : (
          description
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        {loading ? (
          <Tooltip title="Processing…">
            <Box component="span">{confirmButton}</Box>
          </Tooltip>
        ) : (
          confirmButton
        )}
      </DialogActions>
    </Dialog>
  );
}
