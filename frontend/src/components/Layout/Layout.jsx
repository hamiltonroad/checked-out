import PropTypes from 'prop-types';
import { AppBar, Toolbar, Typography, Container, IconButton, Tooltip, Box } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Outlet } from 'react-router-dom';
import { useThemeMode } from '../../context/ThemeContext';
import AppDrawer from '../AppDrawer';
import MobileNav from '../MobileNav';
import { DRAWER_WIDTH } from '../../constants/navigation';

/**
 * Layout component providing app structure with header, navigation, and main content area
 *
 * Features:
 * - Professional branded AppBar with logo icon and improved typography
 * - Material Design 3 surface elevation with subtle border (no heavy shadow)
 * - Sticky positioning keeps header visible on scroll
 * - Theme toggle button for light/dark mode switching
 * - Responsive navigation:
 *   - Desktop (md+): Permanent drawer navigation (240px width)
 *   - Mobile (xs-sm): Bottom navigation bar
 * - Main content container using React Router Outlet
 *
 * The layout uses the ThemeContext to access and toggle the current theme mode.
 * The AppBar uses MD3 tokens for surface colors, elevation, and proper contrast.
 * Navigation components handle routing between Books, Patrons, and Reports sections.
 *
 * @returns {JSX.Element} Layout component with header, navigation, and content area
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: 'surface.main',
          color: 'text.primary',
          boxShadow: 0,
          borderBottom: 1,
          borderColor: 'divider',
          zIndex: (theme) => theme.zIndex.drawer + 1,
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
            <IconButton onClick={toggleMode} color="inherit" aria-label="toggle theme">
              {/* Show icon for the mode that will be activated on click (not current mode) */}
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <AppDrawer />
        <Container
          component="main"
          sx={{
            mt: 4,
            mb: { xs: 8, md: 4 },
            flexGrow: 1,
            width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          }}
        >
          <Outlet />
        </Container>
      </Box>

      <MobileNav />
    </Box>
  );
}

// Layout has no props - it uses routing context (Outlet) and theme context
Layout.propTypes = {};

export default Layout;
