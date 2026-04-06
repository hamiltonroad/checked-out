import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { hasMinimumRole } from '../../utils/roles';
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
 * - Role-based item filtering (items hidden when patron lacks required role)
 *
 * The mobile nav only displays on mobile devices (< md breakpoint).
 * On desktop, the AppDrawer component provides navigation instead.
 *
 * @returns {JSX.Element} MobileNav component with bottom navigation
 */
function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, patron } = useAuth();

  const visibleItems = useMemo(
    () =>
      NAVIGATION_ITEMS.filter(
        (item) => !item.requiredRole || hasMinimumRole(patron?.role, item.requiredRole)
      ),
    [patron?.role]
  );

  const getCurrentValue = () => {
    const index = visibleItems.findIndex((item) => item.path === location.pathname);
    return index >= 0 ? index : 0;
  };

  const [value, setValue] = useState(getCurrentValue());

  // Sync state with location changes (e.g., browser back/forward buttons)
  useEffect(() => {
    const index = visibleItems.findIndex((item) => item.path === location.pathname);
    setValue(index >= 0 ? index : 0);
  }, [location.pathname, visibleItems]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);

    const selectedItem = visibleItems[newValue];
    const authBlocked = selectedItem?.requiresAuth && !isAuthenticated;
    if (selectedItem && !selectedItem.disabled && !authBlocked) {
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
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <BottomNavigationAction
              key={item.id}
              label={item.label}
              icon={<Icon />}
              disabled={item.disabled || (item.requiresAuth && !isAuthenticated)}
              aria-label={item.ariaLabel}
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  );
}

export default MobileNav;
