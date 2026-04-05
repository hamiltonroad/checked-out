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

export { AVAILABILITY_FILTERS, AVAILABILITY_FILTER_LABELS, GENRE_OPTIONS, RATING_FILTER_OPTIONS };
export type { RatingFilterOption };
