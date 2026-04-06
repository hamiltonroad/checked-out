import { Card, CardContent, Box, Typography, Chip, Button } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { HoldData } from '../../types';

interface HoldCardProps {
  hold: HoldData;
  onBookClick: (bookId: number) => void;
  onCheckout: (copyId: number) => void;
  isCheckingOut: boolean;
}

/**
 * Compute a human-readable countdown string from an expiration date.
 */
function getExpirationCountdown(expiresAt: string): { label: string; isUrgent: boolean } {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { label: 'Expired', isUrgent: true };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;
  const isUrgent = diffHours < 24;

  if (diffDays > 0) {
    return { label: `Expires in ${diffDays}d ${remainingHours}h`, isUrgent };
  }
  return { label: `Expires in ${remainingHours}h`, isUrgent };
}

/**
 * HoldCard displays a single active hold with book info,
 * expiration countdown, and a checkout action.
 */
function HoldCard({ hold, onBookClick, onCheckout, isCheckingOut }: HoldCardProps) {
  const formatLabel = hold.copy?.format === 'kindle' ? 'Kindle' : 'Physical';
  const bookTitle = hold.copy?.book?.title || 'Unknown Book';
  const bookId = hold.copy?.book?.id;
  const { label: expirationLabel, isUrgent } = getExpirationCountdown(hold.expires_at);

  const handleTitleClick = () => {
    if (bookId) {
      onBookClick(bookId);
    }
  };

  const handleCheckout = () => {
    onCheckout(hold.copy_id);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              <Typography
                variant="h6"
                component="button"
                onClick={handleTitleClick}
                sx={{
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'none',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  font: 'inherit',
                  textAlign: 'left',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {bookTitle}
              </Typography>
              <Chip label={formatLabel} size="small" variant="outlined" />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon
                sx={{ fontSize: '1rem', color: isUrgent ? 'warning.main' : 'text.secondary' }}
              />
              <Chip
                label={expirationLabel}
                size="small"
                color={isUrgent ? 'warning' : 'default'}
                variant={isUrgent ? 'filled' : 'outlined'}
              />
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleCheckout}
            disabled={isCheckingOut}
            sx={{ ml: 2, flexShrink: 0 }}
          >
            {isCheckingOut ? 'Checking Out...' : 'Check Out'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default HoldCard;
