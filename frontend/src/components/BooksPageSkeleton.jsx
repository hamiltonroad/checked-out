import PropTypes from 'prop-types';
import {
  Container,
  Box,
  Typography,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

/**
 * BooksPageSkeleton displays a loading placeholder for the BooksPage
 */
/**
 * BooksPageSkeleton displays a loading placeholder for the BooksPage.
 * This component takes no props.
 */
function BooksPageSkeleton() {
  return (
    <Container>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 600 }}>
          Books
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and search our library collection
        </Typography>
      </Box>
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: 'flex-start',
            mb: 1.5,
          }}
        >
          <Skeleton
            variant="rounded"
            height={56}
            sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}
          />
          <Skeleton variant="rounded" height={56} sx={{ width: { xs: '100%', sm: 200 } }} />
        </Box>
        <Skeleton variant="text" width={150} />
      </Paper>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author(s)</TableCell>
              <TableCell>Availability</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(6)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton variant="text" width="60%" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width="40%" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="rounded" width={100} height={24} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

BooksPageSkeleton.propTypes = {};

export default BooksPageSkeleton;
