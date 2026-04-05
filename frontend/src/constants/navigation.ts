import type { SvgIconComponent } from '@mui/icons-material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';

export interface NavigationItem {
  id: string;
  label: string;
  icon: SvgIconComponent;
  path: string;
  disabled: boolean;
  ariaLabel: string;
  requiresAuth: boolean;
}

/**
 * Navigation items configuration for both desktop drawer and mobile bottom navigation
 *
 * This shared constant ensures consistent navigation across all navigation components
 * and follows the DRY principle by defining navigation items in one place.
 */
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'books',
    label: 'Books',
    icon: MenuBookIcon,
    path: '/',
    disabled: false,
    ariaLabel: 'Navigate to Books',
    requiresAuth: false,
  },
  {
    id: 'checkouts',
    label: 'Checkouts',
    icon: AssignmentReturnIcon,
    path: '/checkouts',
    disabled: false,
    ariaLabel: 'Navigate to Checkouts',
    requiresAuth: true,
  },
  {
    id: 'patrons',
    label: 'Patrons',
    icon: PeopleIcon,
    path: '/patrons',
    disabled: false,
    ariaLabel: 'Navigate to Patrons',
    requiresAuth: true,
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: AssessmentIcon,
    path: '/reports',
    disabled: true,
    ariaLabel: 'Reports (coming soon)',
    requiresAuth: false,
  },
];

/**
 * Desktop navigation drawer width in pixels
 */
export const DRAWER_WIDTH = 240;
