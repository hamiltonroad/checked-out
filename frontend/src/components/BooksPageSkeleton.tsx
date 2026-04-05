import { Container, Box, Typography, Paper, Skeleton, Grid } from '@mui/material';

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
      <Grid container spacing={2}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} md={6} lg={4} xl={3} key={index}>
            <Paper elevation={1} sx={{ overflow: 'hidden' }}>
              <Skeleton variant="rectangular" height={160} />
              <Box sx={{ p: 2 }}>
                <Skeleton variant="text" width="80%" height={28} />
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="rounded" width={80} height={24} sx={{ mt: 1 }} />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default BooksPageSkeleton;
