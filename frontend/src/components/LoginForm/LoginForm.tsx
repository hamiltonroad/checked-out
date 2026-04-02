import type React from 'react';
import { useState } from 'react';
import { Box, Button, TextField, Alert, Typography } from '@mui/material';

interface LoginFormProps {
  onSubmit: (cardNumber: string, password: string) => void;
  loading?: boolean;
  error?: string | null;
}

/**
 * LoginForm — card number + password form for patron authentication.
 */
function LoginForm({ onSubmit, loading = false, error = null }: LoginFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
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

export default LoginForm;
