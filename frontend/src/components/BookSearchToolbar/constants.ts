// Availability filter constants
const AVAILABILITY_FILTERS: Record<string, string> = {
  ALL: 'all',
  AVAILABLE: 'available',
  CHECKED_OUT: 'checked_out',
} as const;

const AVAILABILITY_FILTER_LABELS: Record<string, string> = {
  [AVAILABILITY_FILTERS.ALL]: 'All Books',
  [AVAILABILITY_FILTERS.AVAILABLE]: 'Available',
  [AVAILABILITY_FILTERS.CHECKED_OUT]: 'Checked Out',
};

export { AVAILABILITY_FILTERS, AVAILABILITY_FILTER_LABELS };
