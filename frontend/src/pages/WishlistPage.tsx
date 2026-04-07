import { useEffect, useState } from 'react';
import { Container, Typography, Box, Fade, Grid, CircularProgress, Alert } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWishlist, useRemoveFromWishlist } from '../hooks/useWishlist';
import BookCard from '../components/BookCard';
import EmptyState from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';

/**
 * WishlistPage displays the authenticated patron's wishlisted books
 * with the ability to remove books from the wishlist.
 */
function WishlistPage() {
  const { patron } = useAuth();
  const { data: wishlistEntries, isLoading, error } = useWishlist(patron?.id);
  const removeFromWishlist = useRemoveFromWishlist(patron?.id);
  const navigate = useNavigate();
  const [confirmBookId, setConfirmBookId] = useState<number | null>(null);

  const { isSuccess: removeSucceeded, reset: resetRemove } = removeFromWishlist;
  useEffect(() => {
    if (confirmBookId !== null && removeSucceeded) {
      setConfirmBookId(null);
      resetRemove();
    }
  }, [confirmBookId, removeSucceeded, resetRemove]);

  const handleWishlistToggle = (bookId: number) => {
    setConfirmBookId(bookId);
  };

  const handleConfirmRemove = () => {
    if (confirmBookId !== null) {
      removeFromWishlist.mutate(confirmBookId);
    }
  };

  const handleCancelRemove = () => {
    if (!removeFromWishlist.isPending) {
      setConfirmBookId(null);
    }
  };

  const handleBookClick = () => {
    navigate('/');
  };

  const handleBrowseCatalog = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Container>
    );
  }

  const entries = wishlistEntries || [];

  return (
    <Container>
      <Fade in timeout={300}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 600 }}>
            My Wishlist
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Books you have saved for later
          </Typography>
        </Box>
      </Fade>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Couldn&apos;t load your wishlist.
        </Alert>
      )}
      {entries.length === 0 && !error && (
        <EmptyState
          icon={<FavoriteBorderIcon sx={{ fontSize: 'inherit' }} />}
          title="Your wishlist is empty"
          message="Browse the catalog to add books you are interested in."
          action={{ label: 'Browse Catalog', onClick: handleBrowseCatalog }}
        />
      )}
      {entries.length > 0 && (
        <Fade in timeout={500}>
          <Grid container spacing={2}>
            {entries.map((entry) => (
              <Grid item xs={12} sm={6} md={6} lg={4} xl={3} key={entry.id}>
                <BookCard
                  book={entry.book}
                  onClick={handleBookClick}
                  isWishlisted
                  onWishlistToggle={handleWishlistToggle}
                />
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}
      <ConfirmDialog
        open={confirmBookId !== null}
        title="Remove from wishlist?"
        description="This book will no longer appear on your wishlist."
        confirmLabel="Remove"
        loading={removeFromWishlist.isPending}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />
    </Container>
  );
}

export default WishlistPage;
