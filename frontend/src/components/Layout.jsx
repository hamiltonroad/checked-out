import { AppBar, Toolbar, Typography, Container, IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Outlet } from 'react-router-dom';
import { useThemeMode } from '../context/ThemeContext';

/**
 * Layout component providing app structure with header and main content area
 */
function Layout() {
  const { mode, toggleMode } = useThemeMode();

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Checked Out - Library Management
          </Typography>
          <Tooltip title="Toggle light/dark mode">
            <IconButton onClick={toggleMode} color="inherit" aria-label="toggle theme">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </>
  );
}

export default Layout;
