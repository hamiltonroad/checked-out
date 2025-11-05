import { useState, useEffect } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../../constants/navigation';

/**
 * MobileNav component providing mobile bottom navigation
 *
 * Features:
 * - Bottom navigation with icons and labels
 * - Fixed positioning at bottom of screen
 * - Navigation items from shared NAVIGATION_ITEMS constant
 * - Responsive display (xs-sm breakpoint only)
 * - Touch-friendly navigation for mobile devices
 * - Active route highlighting with state sync
 * - Syncs with browser navigation (back/forward buttons)
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
    const index = NAVIGATION_ITEMS.findIndex((item) => item.path === location.pathname);
    return index >= 0 ? index : 0; // Default to first item (Books) if no match
  };

  const [value, setValue] = useState(getCurrentValue());

  // Sync state with location changes (e.g., browser back/forward buttons)
  useEffect(() => {
    const index = NAVIGATION_ITEMS.findIndex((item) => item.path === location.pathname);
    setValue(index >= 0 ? index : 0);
  }, [location.pathname]);

  const handleChange = (event, newValue) => {
    setValue(newValue);

    const selectedItem = NAVIGATION_ITEMS[newValue];
    if (selectedItem && !selectedItem.disabled) {
      navigate(selectedItem.path);
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
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <BottomNavigationAction
              key={item.id}
              label={item.label}
              icon={<Icon />}
              disabled={item.disabled}
              aria-label={item.ariaLabel}
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  );
}

// MobileNav has no props - it uses routing context (useLocation, useNavigate)
MobileNav.propTypes = {};

export default MobileNav;
