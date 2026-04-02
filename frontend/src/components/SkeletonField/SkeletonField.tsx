import { Box, Skeleton } from '@mui/material';

interface SkeletonFieldProps {
  labelWidth?: string | number;
  valueWidth?: string | number;
}

/**
 * SkeletonField displays a loading skeleton for a label-value pair
 * Used in forms and detail views to show loading state
 */
function SkeletonField({ labelWidth = '30%', valueWidth = '60%' }: SkeletonFieldProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={labelWidth} />
      <Skeleton variant="text" sx={{ fontSize: '1rem' }} width={valueWidth} />
    </Box>
  );
}

export default SkeletonField;
