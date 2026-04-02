import { useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';

interface LoginError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

/**
 * LoginPage — full-page login screen with centered form.
 */
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (cardNumber: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      await login(cardNumber, password);
      navigate('/');
    } catch (err: unknown) {
      const loginErr = err as LoginError;
      const message = loginErr?.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        px: 2,
      }}
    >
      <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />
    </Box>
  );
}

export default LoginPage;
