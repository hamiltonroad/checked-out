import { Box, Skeleton } from '@mui/material';
import SkeletonField from '../SkeletonField';

/** Loading skeleton for the BookDetailModal content area */
function BookDetailSkeleton() {
  return (
    <Box sx={{ pt: 1 }}>
      <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2 }} width="80%" />
      <SkeletonField labelWidth="30%" valueWidth="60%" />
      <SkeletonField labelWidth="20%" valueWidth="50%" />
      <SkeletonField labelWidth="30%" valueWidth="40%" />
      <SkeletonField labelWidth="40%" valueWidth="25%" />
      <SkeletonField labelWidth="25%" valueWidth="35%" />
      <Box sx={{ mb: 2 }}>
        <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width="20%" />
        <Skeleton variant="rounded" width={100} height={24} />
      </Box>
    </Box>
  );
}

export default BookDetailSkeleton;
