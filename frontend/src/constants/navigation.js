import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';

/**
 * Navigation items configuration for both desktop drawer and mobile bottom navigation
 *
 * This shared constant ensures consistent navigation across all navigation components
 * and follows the DRY principle by defining navigation items in one place.
 */
export const NAVIGATION_ITEMS = [
  {
    id: 'books',
    label: 'Books',
    icon: MenuBookIcon,
    path: '/',
    disabled: false,
    ariaLabel: 'Navigate to Books',
  },
  {
    id: 'patrons',
    label: 'Patrons',
    icon: PeopleIcon,
    path: '/patrons',
    disabled: true,
    ariaLabel: 'Patrons (coming soon)',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: AssessmentIcon,
    path: '/reports',
    disabled: true,
    ariaLabel: 'Reports (coming soon)',
  },
];

/**
 * Desktop navigation drawer width in pixels
 *
 * This constant is used by both AppDrawer and Layout components to ensure
 * consistent drawer width and proper content area calculation.
 */
export const DRAWER_WIDTH = 240;
