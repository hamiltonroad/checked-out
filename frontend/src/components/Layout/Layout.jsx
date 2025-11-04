import PropTypes from 'prop-types';
import { AppBar, Toolbar, Typography, Container, IconButton, Tooltip, Box } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Outlet } from 'react-router-dom';
import { useThemeMode } from '../../context/ThemeContext';

/**
 * Layout component providing app structure with header and main content area
 *
 * Features:
 * - Professional branded AppBar with logo icon and improved typography
 * - Material Design 3 surface elevation with subtle border (no heavy shadow)
 * - Sticky positioning keeps header visible on scroll
 * - Theme toggle button for light/dark mode switching
 * - Responsive design (subtitle hides on mobile)
 * - Main content container using React Router Outlet
 *
 * The layout uses the ThemeContext to access and toggle the current theme mode.
 * The AppBar uses MD3 tokens for surface colors, elevation, and proper contrast.
 *
 * @returns {JSX.Element} Layout component with header and content area
 *
 * @example
 * // Used in router.jsx as the root layout
 * <Route path="/" element={<Layout />}>
 *   <Route index element={<HomePage />} />
 * </Route>
 */
function Layout() {
  const { mode, toggleMode } = useThemeMode();

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: 'surface.main',
          color: 'onSurface.main',
          boxShadow: 0,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <MenuBookIcon sx={{ mr: 2, fontSize: 28 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="headlineSmall" component="h1">
              Checked Out
            </Typography>
            <Typography
              variant="labelMedium"
              sx={{
                display: { xs: 'none', sm: 'block' },
                opacity: 0.7,
              }}
            >
              Library Management
            </Typography>
          </Box>
          <Tooltip title="Toggle light/dark mode">
            <IconButton
              onClick={toggleMode}
              color="inherit"
              aria-label="toggle theme"
              sx={{
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: '2px',
                },
              }}
            >
              {/* Show icon for the mode that will be activated on click (not current mode) */}
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </>
  );
}

// Layout has no props - it uses routing context (Outlet) and theme context
Layout.propTypes = {};

export default Layout;
