import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import PersonIcon from '@mui/icons-material/Person';
import { Link } from 'react-router-dom';
import type { Patron } from '../../types';

interface PatronNavLinkProps {
  patron: Patron;
}

/**
 * Clickable patron avatar + name link for the navbar.
 * Navigates to the patron's detail page (/patrons/:id).
 *
 * On desktop (sm+): shows icon + patron first name.
 * On mobile (xs): shows icon only (name hidden).
 *
 * @param {PatronNavLinkProps} props
 * @returns {JSX.Element} Patron navigation link
 */
function PatronNavLink({ patron }: PatronNavLinkProps) {
  return (
    <ButtonBase
      component={Link}
      to={`/patrons/${patron.id}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.5,
        borderRadius: 1,
        textDecoration: 'none',
        color: 'inherit',
        '&:hover': {
          bgcolor: 'action.hover',
        },
        '&:focus-visible': {
          outline: 2,
          outlineStyle: 'solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      <PersonIcon aria-hidden fontSize="small" />
      <Typography variant="bodyMedium" sx={{ display: { xs: 'none', sm: 'inline' } }}>
        {patron.first_name}
      </Typography>
    </ButtonBase>
  );
}

export default PatronNavLink;
