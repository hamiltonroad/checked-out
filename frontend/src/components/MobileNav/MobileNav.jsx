import { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * MobileNav component providing mobile bottom navigation
 *
 * Features:
 * - Bottom navigation with icons and labels
 * - Fixed positioning at bottom of screen
 * - Navigation items: Books, Patrons, Reports
 * - Responsive display (xs-sm breakpoint only)
 * - Touch-friendly navigation for mobile devices
 * - Active route highlighting
 *
 * The mobile nav only displays on mobile devices (< md breakpoint).
 * On desktop, the AppDrawer component provides navigation instead.
 *
 * @returns {JSX.Element} MobileNav component with bottom navigation
 *
 * @example
 * // Used in Layout.jsx
 * <Layout>
 *   <AppBar>...</AppBar>
 *   <AppDrawer />
 *   <Container>...</Container>
 *   <MobileNav />
 * </Layout>
 */
function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current value based on route
  const getCurrentValue = () => {
    if (location.pathname === '/') return 0;
    if (location.pathname === '/patrons') return 1;
    if (location.pathname === '/reports') return 2;
    return 0; // Default to Books
  };

  const [value, setValue] = useState(getCurrentValue());

  const handleChange = (event, newValue) => {
    setValue(newValue);

    // Navigate based on selected value
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        // Patrons is disabled, don't navigate
        break;
      case 2:
        // Reports is disabled, don't navigate
        break;
      default:
        break;
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: { xs: 'block', md: 'none' },
        borderTop: 1,
        borderColor: 'divider',
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={handleChange}
        sx={{
          bgcolor: 'surface.main',
        }}
      >
        <BottomNavigationAction
          label="Books"
          icon={<MenuBookIcon />}
          aria-label="Navigate to Books"
        />
        <BottomNavigationAction
          label="Patrons"
          icon={<PeopleIcon />}
          disabled
          aria-label="Patrons (coming soon)"
        />
        <BottomNavigationAction
          label="Reports"
          icon={<AssessmentIcon />}
          disabled
          aria-label="Reports (coming soon)"
        />
      </BottomNavigation>
    </Paper>
  );
}

// MobileNav has no props - it uses routing context (useLocation, useNavigate)
MobileNav.propTypes = {};

export default MobileNav;
