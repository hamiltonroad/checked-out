import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Alert,
  Fade,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { useNavigate } from 'react-router-dom';
import { usePatrons } from '../hooks/usePatrons';
import type { Patron } from '../types';
import EmptyState from '../components/EmptyState';
import PatronListPageSkeleton from '../components/PatronListPageSkeleton';
import PatronTable from '../components/PatronTable';
import PatronCard from '../components/PatronCard';

const STATUS_FILTER_OPTIONS = ['all', 'active', 'inactive', 'suspended'] as const;
const STATUS_FILTER_LABELS: Record<string, string> = {
  all: 'All Statuses',
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
};

const SUMMARY_CARDS = [
  { label: 'Total Patrons', color: 'primary.main', filter: null },
  { label: 'Active', color: 'success.main', filter: 'active' as const },
  { label: 'Inactive', color: 'error.main', filter: 'inactive' as const },
];

/** PatronListPage displays a searchable, filterable list of library patrons. */
function PatronListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const queryParams = statusFilter === 'all' ? {} : { status: statusFilter };
  const { data, isLoading, error } = usePatrons(queryParams);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const patrons: Patron[] = data?.data || [];
  const filteredPatrons = useMemo(() => {
    if (!debouncedSearchTerm) return patrons;
    const term = debouncedSearchTerm.toLowerCase();
    return patrons.filter(
      (p) =>
        p.first_name.toLowerCase().includes(term) ||
        p.last_name.toLowerCase().includes(term) ||
        (p.card_number && p.card_number.toLowerCase().includes(term))
    );
  }, [patrons, debouncedSearchTerm]);

  const summaryCounts = useMemo(() => {
    const total = patrons.length;
    const active = patrons.filter((p) => p.status === 'active').length;
    const inactive = patrons.filter((p) => p.status === 'inactive').length;
    return { total, active, inactive };
  }, [patrons]);

  const getSummaryCount = (filter: string | null): number => {
    if (filter === 'active') return summaryCounts.active;
    if (filter === 'inactive') return summaryCounts.inactive;
    return summaryCounts.total;
  };
  const handleRowClick = (patronId: number) => navigate(`/patrons/${patronId}`);

  if (isLoading) return <PatronListPageSkeleton />;
  if (error) {
    return (
      <Alert severity="error">Error loading patrons: {error.message || 'Unknown error'}</Alert>
    );
  }

  return (
    <Container>
      <Fade in timeout={300}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Patrons
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse and manage library patrons
          </Typography>
        </Box>
      </Fade>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {SUMMARY_CARDS.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" sx={{ color: card.color, fontWeight: 700 }}>
                  {getSummaryCount(card.filter)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Fade in timeout={400}>
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Box
            sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}
          >
            <TextField
              fullWidth
              placeholder="Search by name or card number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 160 }}
              aria-label="Filter by status"
            >
              {STATUS_FILTER_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {STATUS_FILTER_LABELS[option]}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Paper>
      </Fade>
      {filteredPatrons.length === 0 && (
        <Fade in timeout={500}>
          <div>
            <EmptyState
              icon={
                debouncedSearchTerm ? (
                  <SearchOffIcon sx={{ fontSize: 'inherit' }} />
                ) : (
                  <PeopleIcon sx={{ fontSize: 'inherit' }} />
                )
              }
              title={debouncedSearchTerm ? 'No patrons match your search' : 'No patrons found'}
              message={
                debouncedSearchTerm
                  ? `No patrons found matching "${debouncedSearchTerm}"`
                  : 'No patrons are currently in the system.'
              }
            />
          </div>
        </Fade>
      )}
      {filteredPatrons.length > 0 && !isMobile && (
        <Fade in timeout={500}>
          <div>
            <PatronTable patrons={filteredPatrons} onRowClick={handleRowClick} />
          </div>
        </Fade>
      )}
      {filteredPatrons.length > 0 && isMobile && (
        <Fade in timeout={500}>
          <Stack spacing={2}>
            {filteredPatrons.map((patron) => (
              <PatronCard key={patron.id} patron={patron} onClick={handleRowClick} />
            ))}
          </Stack>
        </Fade>
      )}
    </Container>
  );
}

export default PatronListPage;
