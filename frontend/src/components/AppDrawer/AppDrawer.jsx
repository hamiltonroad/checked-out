import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAVIGATION_ITEMS, DRAWER_WIDTH } from '../../constants/navigation';

/**
 * AppDrawer component providing desktop navigation
 *
 * Features:
 * - Permanent drawer variant (always visible on desktop)
 * - Fixed width using DRAWER_WIDTH constant
 * - Navigation items from shared NAVIGATION_ITEMS constant
 * - Active route highlighting
 * - Responsive display (md+ breakpoint only)
 * - Keyboard accessible navigation
 * - Uses theme tokens for AppBar height
 *
 * The drawer only displays on desktop (md breakpoint and above).
 * On mobile devices, the MobileNav component provides navigation instead.
 *
 * @returns {JSX.Element} AppDrawer component with navigation items
 *
 * @example
 * // Used in Layout.jsx
 * <Layout>
 *   <AppBar>...</AppBar>
 *   <AppDrawer />
 *   <Container>...</Container>
 * </Layout>
 */
function AppDrawer() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          top: (theme) => `${theme.mixins.toolbar.minHeight}px`,
          height: (theme) => `calc(100% - ${theme.mixins.toolbar.minHeight}px)`,
          borderRight: 1,
          borderColor: 'divider',
        },
      }}
    >
      <List>
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={isActive}
                disabled={item.disabled}
                onClick={() => !item.disabled && navigate(item.path)}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                  },
                  '&.Mui-selected:hover': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'primary.main' : 'inherit',
                  }}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}

// AppDrawer has no props - it uses routing context (useLocation, useNavigate)
AppDrawer.propTypes = {};

export default AppDrawer;
