import { Container, Typography, Box, Fade, Grid, CircularProgress } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWishlist, useRemoveFromWishlist } from '../hooks/useWishlist';
import BookCard from '../components/BookCard';
import EmptyState from '../components/EmptyState';

/**
 * WishlistPage displays the authenticated patron's wishlisted books
 * with the ability to remove books from the wishlist.
 */
function WishlistPage() {
  const { patron } = useAuth();
  const { data: wishlistEntries, isLoading } = useWishlist(patron?.id);
  const removeFromWishlist = useRemoveFromWishlist(patron?.id);
  const navigate = useNavigate();

  const handleWishlistToggle = (bookId: number) => {
    removeFromWishlist.mutate(bookId);
  };

  const handleBookClick = (bookId: number) => {
    navigate(`/?book=${bookId}`);
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
      {entries.length === 0 && (
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
    </Container>
  );
}

export default WishlistPage;
