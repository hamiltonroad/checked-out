import type React from 'react';
import { Box, Pagination as MuiPagination } from '@mui/material';

interface PaginationProps {
  page?: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
}

/**
 * Pagination wraps MUI Pagination with consistent styling for paginated lists
 */
function Pagination({ page = 1, totalPages = 1, onPageChange }: PaginationProps) {
  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
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

export default Pagination;
