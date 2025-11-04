import PropTypes from 'prop-types';
import { AppBar, Toolbar, Typography, Container, IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Outlet } from 'react-router-dom';
import { useThemeMode } from '../../context/ThemeContext';

/**
 * Layout component providing app structure with header and main content area
 *
 * Features:
 * - Application header with AppBar
 * - Theme toggle button for light/dark mode switching
 * - Main content container using React Router Outlet
 * - Responsive design with Material UI components
 *
 * The layout uses the ThemeContext to access and toggle the current theme mode.
 * The theme toggle button is positioned in the top-right corner of the AppBar
 * with proper accessibility attributes (ARIA label and tooltip).
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
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Checked Out - Library Management
          </Typography>
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
