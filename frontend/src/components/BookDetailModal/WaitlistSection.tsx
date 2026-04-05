import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useBookWaitlist, useJoinWaitlist, useLeaveWaitlist } from '../../hooks/useWaitlist';
import { getFormatAvailability } from '../../utils/copyUtils';
import type { Copy } from '../../types';

interface WaitlistSectionProps {
  bookId: number;
  copies: Copy[];
}

/**
 * WaitlistSection displays per-format waitlist join/leave/position UI
 * within the BookDetailsTab when copies of a format are unavailable.
 */
function WaitlistSection({ bookId, copies }: WaitlistSectionProps) {
  const { patron } = useAuth();
  const { data: waitlistEntries = [], isLoading } = useBookWaitlist(bookId);
  const joinMutation = useJoinWaitlist();
  const leaveMutation = useLeaveWaitlist();

  if (!patron || isLoading) return null;

  const formatAvailability = getFormatAvailability(copies);
  const unavailableFormats = formatAvailability.filter((fa) => fa.available === 0);

  if (unavailableFormats.length === 0) return null;

  const handleJoin = (format: string) => {
    joinMutation.mutate({ bookId, format });
  };

  const handleLeave = (format: string) => {
    leaveMutation.mutate({ bookId, format });
  };

  return (
    <Box sx={{ mt: 2 }}>
      {unavailableFormats.map((fa) => {
        const formatLower = fa.format.toLowerCase();
        const myEntry = waitlistEntries.find(
          (e) => e.format === formatLower && e.patron_id === patron.id
        );
        const isJoining = joinMutation.isPending;
        const isLeaving = leaveMutation.isPending;

        return (
          <Box key={fa.format} sx={{ mb: 1.5 }}>
            {myEntry ? (
              <>
                {myEntry.position === 1 ? (
                  <Alert severity="success" sx={{ mb: 1 }}>
                    {"You're next! Check out now."}
                  </Alert>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    You are #{myEntry.position} in line for {fa.format}
                  </Typography>
                )}
                <Button
                  size="small"
                  variant="text"
                  onClick={() => handleLeave(formatLower)}
                  disabled={isLeaving}
                  startIcon={isLeaving ? <CircularProgress size={14} /> : null}
                >
                  Leave {fa.format} Waitlist
                </Button>
              </>
            ) : (
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleJoin(formatLower)}
                disabled={isJoining}
                startIcon={isJoining ? <CircularProgress size={14} /> : null}
              >
                Join {fa.format} Waitlist
              </Button>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

export default WaitlistSection;
