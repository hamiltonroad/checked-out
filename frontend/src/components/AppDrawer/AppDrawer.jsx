import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * AppDrawer component providing desktop navigation
 *
 * Features:
 * - Permanent drawer variant (always visible on desktop)
 * - 240px fixed width
 * - Navigation items: Books, Patrons, Reports
 * - Active route highlighting
 * - Responsive display (md+ breakpoint only)
 * - Keyboard accessible navigation
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

  const navigationItems = [
    {
      label: 'Books',
      icon: <MenuBookIcon />,
      path: '/',
      disabled: false,
    },
    {
      label: 'Patrons',
      icon: <PeopleIcon />,
      path: '/patrons',
      disabled: true,
    },
    {
      label: 'Reports',
      icon: <AssessmentIcon />,
      path: '/reports',
      disabled: true,
    },
  ];

  const handleNavigation = (path, disabled) => {
    if (!disabled) {
      navigate(path);
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          top: 64, // Account for AppBar height
          height: 'calc(100% - 64px)',
          borderRight: 1,
          borderColor: 'divider',
        },
      }}
    >
      <List>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                selected={isActive}
                disabled={item.disabled}
                onClick={() => handleNavigation(item.path, item.disabled)}
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
                  {item.icon}
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
