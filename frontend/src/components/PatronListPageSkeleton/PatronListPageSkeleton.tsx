import {
  Container,
  Box,
  Typography,
  Paper,
  Skeleton,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

/**
 * PatronListPageSkeleton displays a loading placeholder for the PatronListPage.
 * This component takes no props.
 */
function PatronListPageSkeleton() {
  return (
    <Container>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 600 }}>
          Patrons
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and manage library patrons
        </Typography>
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[0, 1, 2].map((index) => (
          <Grid key={index} size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Skeleton variant="text" width="40%" sx={{ mx: 'auto', fontSize: '2rem' }} />
              <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Skeleton
            variant="rounded"
            height={56}
            sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}
          />
          <Skeleton variant="rounded" height={56} sx={{ width: { xs: '100%', sm: 200 } }} />
        </Box>
      </Paper>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Card Number</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(6)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton variant="text" width="60%" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width="50%" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="rounded" width={80} height={24} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default PatronListPageSkeleton;
