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

const AVAILABILITY_OPTIONS = [
  { value: AVAILABILITY_FILTERS.ALL, label: AVAILABILITY_FILTER_LABELS[AVAILABILITY_FILTERS.ALL] },
  {
    value: AVAILABILITY_FILTERS.AVAILABLE,
    label: AVAILABILITY_FILTER_LABELS[AVAILABILITY_FILTERS.AVAILABLE],
  },
  {
    value: AVAILABILITY_FILTERS.CHECKED_OUT,
    label: AVAILABILITY_FILTER_LABELS[AVAILABILITY_FILTERS.CHECKED_OUT],
  },
];

// Genre options matching seeded data
const GENRE_OPTIONS: string[] = [
  'Biography',
  'Fantasy',
  'Fiction',
  'History',
  'Horror',
  'Mystery',
  'Philosophy',
  'Poetry',
  'Science',
  'Science Fiction',
  'Self-Help',
];

// Format filter options matching Copy model enum
interface FormatOption {
  value: string;
  label: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  { value: 'physical', label: 'Physical' },
  { value: 'kindle', label: 'Kindle' },
];

// Rating filter options
interface RatingFilterOption {
  value: number;
  label: string;
}

const RATING_FILTER_OPTIONS: RatingFilterOption[] = [
  { value: 0, label: 'Any Rating' },
  { value: 1, label: '1+ Stars' },
  { value: 2, label: '2+ Stars' },
  { value: 3, label: '3+ Stars' },
  { value: 4, label: '4+ Stars' },
];

// Layout constants for filter rows
const FILTER_ROW_SX = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: 2,
  mb: 1.5,
};
const FILTER_CONTROL_SX = { minWidth: { xs: '100%', sm: 200 } };

export {
  AVAILABILITY_FILTERS,
  AVAILABILITY_FILTER_LABELS,
  AVAILABILITY_OPTIONS,
  GENRE_OPTIONS,
  FORMAT_OPTIONS,
  RATING_FILTER_OPTIONS,
  FILTER_ROW_SX,
  FILTER_CONTROL_SX,
};
export type { RatingFilterOption, FormatOption };
