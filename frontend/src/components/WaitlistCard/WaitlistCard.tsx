import { Card, CardContent, Box, Typography, Chip, Button, Stack } from '@mui/material';
import QueueIcon from '@mui/icons-material/Queue';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import type { WaitlistEntryData } from '../../types';
import { formatDate } from '../../utils/checkoutUtils';

interface WaitlistCardProps {
  entry: WaitlistEntryData;
  onBookClick: (bookId: number) => void;
  onLeave: (bookId: number, format: string) => void;
  isLeaving: boolean;
}

/**
 * WaitlistCard displays a single waitlist entry with book info,
 * queue position, copy count, and a leave action.
 */
function WaitlistCard({ entry, onBookClick, onLeave, isLeaving }: WaitlistCardProps) {
  const isNextInLine = entry.position === 1;
  const formatLabel = entry.format === 'kindle' ? 'Kindle' : 'Physical';

  const handleTitleClick = () => {
    if (entry.book?.id) {
      onBookClick(entry.book.id);
    }
  };

  const handleLeave = () => {
    onLeave(entry.book_id, entry.format);
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
                {entry.book?.title || 'Unknown Book'}
              </Typography>
              <Chip label={formatLabel} size="small" variant="outlined" />
              {isNextInLine && <Chip label="Next in line" size="small" color="success" />}
            </Box>

            <Stack direction="row" spacing={3} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <QueueIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Position: #{entry.position} of {entry.queue_size ?? '?'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LibraryBooksIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {entry.total_copies ?? 0} {(entry.total_copies ?? 0) === 1 ? 'copy' : 'copies'}
                </Typography>
              </Box>
            </Stack>

            <Typography variant="caption" color="text.secondary">
              Joined {formatDate(entry.created_at)}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={handleLeave}
            disabled={isLeaving}
            sx={{ ml: 2, flexShrink: 0 }}
          >
            {isLeaving ? 'Leaving...' : 'Leave Waitlist'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default WaitlistCard;
