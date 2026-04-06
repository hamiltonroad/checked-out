import type { SvgIconComponent } from '@mui/icons-material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ScienceIcon from '@mui/icons-material/Science';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PsychologyIcon from '@mui/icons-material/Psychology';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import CreateIcon from '@mui/icons-material/Create';

interface GenreStyle {
  bgColor: string;
  iconColor: string;
  Icon: SvgIconComponent;
}

const DEFAULT_STYLE: GenreStyle = {
  bgColor: 'grey.200',
  iconColor: 'grey.600',
  Icon: MenuBookIcon,
};

const GENRE_MAP: Record<string, GenreStyle> = {
  Fiction: { bgColor: 'info.light', iconColor: 'info.dark', Icon: MenuBookIcon },
  'Science Fiction': {
    bgColor: 'primary.light',
    iconColor: 'primary.dark',
    Icon: RocketLaunchIcon,
  },
  Mystery: { bgColor: 'secondary.light', iconColor: 'secondary.dark', Icon: SearchIcon },
  Fantasy: { bgColor: 'success.light', iconColor: 'success.dark', Icon: AutoAwesomeIcon },
  Biography: { bgColor: 'tertiary.light', iconColor: 'tertiary.dark', Icon: PersonIcon },
  History: { bgColor: 'warning.light', iconColor: 'warning.dark', Icon: AccountBalanceIcon },
  Science: { bgColor: 'info.light', iconColor: 'info.dark', Icon: ScienceIcon },
  'Self-Help': { bgColor: 'success.light', iconColor: 'success.dark', Icon: LightbulbIcon },
  Philosophy: { bgColor: 'secondary.light', iconColor: 'secondary.dark', Icon: PsychologyIcon },
  Horror: { bgColor: 'error.light', iconColor: 'error.dark', Icon: WhatshotIcon },
  Poetry: { bgColor: 'tertiary.light', iconColor: 'tertiary.dark', Icon: CreateIcon },
};

/**
 * Returns genre-based styling for book card placeholders.
 * Maps genre strings to MUI theme palette color paths and icon components.
 */
export function getGenreStyle(genre?: string | null): GenreStyle {
  if (!genre) return DEFAULT_STYLE;
  return GENRE_MAP[genre] ?? DEFAULT_STYLE;
}
