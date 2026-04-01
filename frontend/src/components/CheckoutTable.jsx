import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import EmptyState from './EmptyState';

/**
 * Format a date string for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * CheckoutTable displays a table of checkout records with return functionality
 *
 * @param {Object} props
 * @param {Array} props.checkouts - Array of checkout records
 * @param {Function} props.onReturn - Callback when Return button is clicked
 * @returns {JSX.Element} Table of checkouts or empty state
 */
function CheckoutTable({ checkouts, onReturn }) {
  if (checkouts.length === 0) {
    return (
      <EmptyState
        icon={<AssignmentReturnIcon sx={{ fontSize: 'inherit' }} />}
        title="No checkouts found"
        message="There are no checkout records to display."
      />
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 600 }}>Patron Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Book Title</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Checkout Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Return Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {checkouts.map((checkout, index) => {
            const isActive = !checkout.returnDate;
            const isLastRow = index === checkouts.length - 1;
            const tableCellSx = {
              borderBottom: isLastRow ? 'none' : '1px solid',
              borderColor: 'divider',
            };

            return (
              <TableRow key={checkout.id}>
                <TableCell sx={tableCellSx}>{checkout.patronName}</TableCell>
                <TableCell sx={tableCellSx}>{checkout.bookTitle}</TableCell>
                <TableCell sx={tableCellSx}>{formatDate(checkout.checkoutDate)}</TableCell>
                <TableCell sx={tableCellSx}>{formatDate(checkout.returnDate)}</TableCell>
                <TableCell sx={tableCellSx}>
                  {isActive && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => onReturn(checkout.id)}
                      startIcon={<AssignmentReturnIcon />}
                    >
                      Return
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

CheckoutTable.propTypes = {
  checkouts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      patronName: PropTypes.string.isRequired,
      bookTitle: PropTypes.string.isRequired,
      checkoutDate: PropTypes.string.isRequired,
      returnDate: PropTypes.string,
    })
  ).isRequired,
  onReturn: PropTypes.func.isRequired,
};

export default CheckoutTable;
