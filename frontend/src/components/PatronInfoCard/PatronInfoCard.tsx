import { Card, CardContent, Typography, Chip, Box, Grid } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import type { PatronDetail, PatronStatus } from '../../types';

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

interface PatronInfoCardProps {
  patron: PatronDetail;
}

/**
 * PatronInfoCard displays patron metadata in a Material UI Card
 */
function PatronInfoCard({ patron }: PatronInfoCardProps) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <PersonIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              {patron.first_name} {patron.last_name}
            </Typography>
          </Box>
          <Chip
            label={STATUS_LABEL_MAP[patron.status]}
            color={STATUS_COLOR_MAP[patron.status]}
            size="small"
          />
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Card Number
            </Typography>
            <Typography variant="body1">{patron.card_number}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">{patron.email || 'N/A'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Phone
            </Typography>
            <Typography variant="body1">{patron.phone || 'N/A'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <Typography variant="body1">{STATUS_LABEL_MAP[patron.status]}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default PatronInfoCard;
