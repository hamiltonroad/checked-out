import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, TextField, Alert, Typography } from '@mui/material';

/**
 * LoginForm — card number + password form for patron authentication.
 *
 * @param {Object} props
 * @param {Function} props.onSubmit - Called with (cardNumber, password)
 * @param {boolean} [props.loading=false] - Disables form while submitting
 * @param {string|null} [props.error=null] - Error message to display
 */
function LoginForm({ onSubmit, loading = false, error = null }) {
  const [cardNumber, setCardNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(cardNumber, password);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
        Library Login
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Card Number"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
        required
        fullWidth
        autoFocus
        disabled={loading}
        sx={{ mb: 2 }}
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        disabled={loading}
        sx={{ mb: 3 }}
      />

      <Button type="submit" variant="contained" fullWidth disabled={loading} size="large">
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </Box>
  );
}

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default LoginForm;
