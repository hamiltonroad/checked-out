import { createTheme } from '@mui/material/styles';
import lightPalette from './palette.js';
import typography from './typography.js';

const theme = createTheme({
  palette: lightPalette,
  typography,
  spacing: 8,
});

export default theme;
