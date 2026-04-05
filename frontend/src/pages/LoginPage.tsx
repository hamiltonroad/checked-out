import { useState } from 'react';
import { Alert, Box } from '@mui/material';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import AuthLoadingScreen from '../components/AuthLoadingScreen';

interface LoginError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface LocationState {
  redirectTo?: string;
}

/**
 * LoginPage — full-page login screen with centered form.
 *
 * Enhancements:
 * - Redirects already-authenticated users to / (or their original destination)
 * - Redirects to the originally requested page after successful login
 * - Displays session-expired warning when redirected by the 401 interceptor
 */
function LoginPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locationState = location.state as LocationState | null;
  const redirectTo = locationState?.redirectTo || '/';
  const sessionExpired = new URLSearchParams(window.location.search).get('sessionExpired');

  // Show loading screen while auth status is being determined
  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  // Redirect already-authenticated users away from login
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (cardNumber: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      await login(cardNumber, password);
      navigate(redirectTo, { replace: true });
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        px: 2,
      }}
    >
      {sessionExpired && (
        <Alert severity="warning" sx={{ mb: 2, width: '100%', maxWidth: 400 }}>
          Your session has expired. Please log in again.
        </Alert>
      )}
      <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />
    </Box>
  );
}

export default LoginPage;
