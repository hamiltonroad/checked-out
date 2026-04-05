import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import { ThemeProvider } from '../../context/ThemeContext';

const mockLogout = vi.fn().mockResolvedValue(undefined);

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: false,
    patron: null,
    logout: mockLogout,
    loading: false,
  })),
}));

import { useAuth } from '../../hooks/useAuth';

const mockUseAuth = vi.mocked(useAuth);

function renderLayout() {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <Layout />
      </ThemeProvider>
    </BrowserRouter>
  );
}

describe('Layout', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      patron: null,
      logout: mockLogout,
      loading: false,
      login: vi.fn(),
      clearAuth: vi.fn(),
    });
  });

  it('renders app title and subtitle', () => {
    renderLayout();
    expect(screen.getByRole('heading', { name: /checked out/i })).toBeInTheDocument();
    expect(screen.getByText(/Library Management/)).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    renderLayout();
    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it('displays tooltip text on theme toggle button', async () => {
    const user = userEvent.setup();
    renderLayout();

    const button = screen.getByRole('button', { name: /toggle theme/i });
    await user.hover(button);

    expect(await screen.findByText('Toggle light/dark mode')).toBeInTheDocument();
  });

  it('toggles theme when button is clicked', async () => {
    const user = userEvent.setup();
    renderLayout();

    const button = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(button);

    expect(localStorage.getItem('themeMode')).toBeTruthy();
  });

  it('displays moon icon in light mode', () => {
    localStorage.setItem('themeMode', 'light');
    renderLayout();

    const button = screen.getByRole('button', { name: /toggle theme/i });
    const icon = button.querySelector('svg[data-testid="Brightness4Icon"]');
    expect(icon).toBeInTheDocument();
  });

  it('displays sun icon in dark mode', () => {
    localStorage.setItem('themeMode', 'dark');
    renderLayout();

    const button = screen.getByRole('button', { name: /toggle theme/i });
    const icon = button.querySelector('svg[data-testid="Brightness7Icon"]');
    expect(icon).toBeInTheDocument();
  });

  it('renders outlet for child routes', () => {
    const { container } = renderLayout();
    const mainContainer = container.querySelector('.MuiContainer-root');
    expect(mainContainer).toBeInTheDocument();
  });

  it('renders menu book icon', () => {
    renderLayout();
    const icons = screen.getAllByTestId('MenuBookIcon');
    expect(icons.length).toBeGreaterThanOrEqual(1);
  });

  it('uses sticky positioning for AppBar', () => {
    const { container } = renderLayout();
    const appBar = container.querySelector('.MuiAppBar-positionSticky');
    expect(appBar).toBeInTheDocument();
  });

  it('uses headlineSmall typography variant for main title', () => {
    const { container } = renderLayout();
    const title = screen.getByRole('heading', { name: /checked out/i });
    expect(title).toBeInTheDocument();

    const typography = container.querySelector('.MuiTypography-headlineSmall');
    expect(typography).toBeInTheDocument();
  });

  it('shows Log in button when unauthenticated', () => {
    renderLayout();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  describe('when authenticated', () => {
    const mockPatron = {
      id: 7,
      first_name: 'Dana',
      last_name: 'Park',
      status: 'active' as const,
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        patron: mockPatron,
        logout: mockLogout,
        loading: false,
        login: vi.fn(),
        clearAuth: vi.fn(),
      });
    });

    it('renders patron name as a link to patron detail page', () => {
      renderLayout();
      const link = screen.getByRole('link', { name: /dana/i });
      expect(link).toHaveAttribute('href', '/patrons/7');
    });

    it('renders person icon in navbar', () => {
      renderLayout();
      expect(screen.getByTestId('PersonIcon')).toBeInTheDocument();
    });

    it('renders Log out button', () => {
      renderLayout();
      expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
    });

    it('does not render Log in button', () => {
      renderLayout();
      expect(screen.queryByRole('button', { name: /log in/i })).not.toBeInTheDocument();
    });
  });
});
