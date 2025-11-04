import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import ErrorIcon from '@mui/icons-material/Error';
import PropTypes from 'prop-types';

const STATUS_CONFIG = {
  available: {
    label: 'Available',
    color: 'success',
    icon: <CheckCircleIcon />,
  },
  checked_out: {
    label: 'Checked Out',
    color: 'warning',
    icon: <EventBusyIcon />,
  },
  overdue: {
    label: 'Overdue',
    color: 'error',
    icon: <ErrorIcon />,
  },
};

/**
 * StatusChip displays book availability status with colored chips and icons
 * @param {Object} props - Component props
 * @param {string} props.status - Status value ('available', 'checked_out', 'overdue')
 * @param {string} props.size - Chip size ('small' or 'medium')
 */
function StatusChip({ status, size = 'small' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.available;
  return <Chip label={config.label} color={config.color} size={size} icon={config.icon} />;
}

StatusChip.propTypes = {
  status: PropTypes.oneOf(['available', 'checked_out', 'overdue']).isRequired,
  size: PropTypes.oneOf(['small', 'medium']),
};

export default StatusChip;
