import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import type { Patron, PatronStatus } from '../../types';

const STATUS_COLOR_MAP: Record<PatronStatus, 'success' | 'warning' | 'error'> = {
  active: 'success',
  suspended: 'warning',
  inactive: 'error',
};

const STATUS_LABEL_MAP: Record<PatronStatus, string> = {
  active: 'Active',
  suspended: 'Suspended',
  inactive: 'Inactive',
};

interface PatronTableProps {
  patrons: Patron[];
  onRowClick: (patronId: number) => void;
}

/**
 * PatronTable displays a desktop table view of patrons with name, card number, and status.
 */
function PatronTable({ patrons, onRowClick }: PatronTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Card Number</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {patrons.map((patron) => (
            <TableRow
              key={patron.id}
              hover
              onClick={() => onRowClick(patron.id)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>
                {patron.last_name}, {patron.first_name}
              </TableCell>
              <TableCell>{patron.card_number}</TableCell>
              <TableCell>
                <Chip
                  label={STATUS_LABEL_MAP[patron.status]}
                  color={STATUS_COLOR_MAP[patron.status]}
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default PatronTable;
