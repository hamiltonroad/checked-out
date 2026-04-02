import PropTypes from 'prop-types';
import { Box, Pagination as MuiPagination } from '@mui/material';

/**
 * Pagination wraps MUI Pagination with consistent styling for paginated lists
 */
function Pagination({ page = 1, totalPages = 1, onPageChange }) {
  const handleChange = (_event, value) => {
    onPageChange(value);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
      <MuiPagination
        count={totalPages}
        page={page}
        onChange={handleChange}
        color="primary"
        showFirstButton
        showLastButton
      />
    </Box>
  );
}

Pagination.propTypes = {
  page: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
