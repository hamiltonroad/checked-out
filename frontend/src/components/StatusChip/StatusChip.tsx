import { Chip } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import ErrorIcon from '@mui/icons-material/Error';
import type { BookStatus, ChipSize } from '../../types';

interface StatusConfig {
  label: string;
  color: 'success' | 'warning' | 'error';
  IconComponent: SvgIconComponent;
}

const STATUS_CONFIG: Record<BookStatus, StatusConfig> = {
  available: {
    label: 'Available',
    color: 'success',
    IconComponent: CheckCircleIcon,
  },
  checked_out: {
    label: 'Checked Out',
    color: 'warning',
    IconComponent: EventBusyIcon,
  },
  overdue: {
    label: 'Overdue',
    color: 'error',
    IconComponent: ErrorIcon,
  },
};

interface StatusChipProps {
  status: BookStatus;
  size?: ChipSize;
}

/**
 * StatusChip displays book availability status with colored chips and icons
 */
function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.available;
  const { IconComponent } = config;
  return <Chip label={config.label} color={config.color} size={size} icon={<IconComponent />} />;
}

export default StatusChip;
