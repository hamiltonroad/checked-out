import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import type { Patron, PatronStatus } from '../../types';

const STATUS_COLOR_MAP: Record<PatronStatus, 'success' | 'warning' | 'error'> = {
  active: 'success',
  suspended: 'warning',
  inactive: 'error',
};

const STATUS_LABEL_MAP: Record<PatronStatus, string> = {
  active: 'Active',
  suspended: 'Suspended',
  inactive: 'Inactive',
};

interface PatronCardProps {
  patron: Patron;
  onClick: (patronId: number) => void;
}

/**
 * PatronCard displays a patron summary in a mobile-friendly card layout.
 */
function PatronCard({ patron, onClick }: PatronCardProps) {
  return (
    <Card
      onClick={() => onClick(patron.id)}
      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
    >
      <CardContent
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1.5,
          '&:last-child': { pb: 1.5 },
        }}
      >
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {patron.last_name}, {patron.first_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {patron.card_number}
          </Typography>
        </Box>
        <Chip
          label={STATUS_LABEL_MAP[patron.status]}
          color={STATUS_COLOR_MAP[patron.status]}
          size="small"
        />
      </CardContent>
    </Card>
  );
}

export default PatronCard;
