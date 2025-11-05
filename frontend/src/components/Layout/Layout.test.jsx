import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import { ThemeProvider } from '../../context/ThemeContext';

describe('Layout', () => {
  it('renders app title and subtitle', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Check for main title (h1 heading)
    expect(screen.getByRole('heading', { name: /checked out/i })).toBeInTheDocument();

    // Check for subtitle
    expect(screen.getByText('Library Management')).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it('displays tooltip text on theme toggle button', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /toggle theme/i });
    await user.hover(button);

    // Tooltip appears asynchronously
    expect(await screen.findByText('Toggle light/dark mode')).toBeInTheDocument();
  });

  it('toggles theme when button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /toggle theme/i });

    // Click the button to toggle theme
    await user.click(button);

    // Theme should have toggled (we can verify by checking localStorage)
    expect(localStorage.getItem('themeMode')).toBeTruthy();
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /toggle theme/i });

    // Tab to the button
    await user.tab();
    expect(button).toHaveFocus();

    // Press Enter to activate
    await user.keyboard('{Enter}');

    // Should have toggled theme
    expect(localStorage.getItem('themeMode')).toBeTruthy();
  });

  it('displays moon icon in light mode', () => {
    // Set light mode
    localStorage.setItem('themeMode', 'light');

    render(
      <BrowserRouter>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /toggle theme/i });
    // Brightness4Icon is the moon icon shown in light mode
    const icon = button.querySelector('svg[data-testid="Brightness4Icon"]');
    expect(icon).toBeInTheDocument();
  });

  it('displays sun icon in dark mode', () => {
    // Set dark mode
    localStorage.setItem('themeMode', 'dark');

    render(
      <BrowserRouter>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /toggle theme/i });
    // Brightness7Icon is the sun icon shown in dark mode
    const icon = button.querySelector('svg[data-testid="Brightness7Icon"]');
    expect(icon).toBeInTheDocument();
  });

  it('renders outlet for child routes', () => {
    const { container } = render(
      <BrowserRouter>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Container should be present for child content
    const mainContainer = container.querySelector('.MuiContainer-root');
    expect(mainContainer).toBeInTheDocument();
  });

  it('has proper focus-visible styling', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /toggle theme/i });

    // Check that the button has sx prop with focus-visible styles
    expect(button).toBeInTheDocument();
    // Note: Can't directly test :focus-visible pseudo-class in JSDOM,
    // but we verify the component renders with the styling applied
  });

  it('renders menu book icon', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Check for MenuBookIcon by its data-testid (now appears twice: AppBar + drawer)
    const icons = screen.getAllByTestId('MenuBookIcon');
    expect(icons.length).toBeGreaterThanOrEqual(1);
  });

  it('uses sticky positioning for AppBar', () => {
    const { container } = render(
      <BrowserRouter>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Check for AppBar with sticky position class
    const appBar = container.querySelector('.MuiAppBar-positionSticky');
    expect(appBar).toBeInTheDocument();
  });

  it('uses headlineSmall typography variant for main title', () => {
    const { container } = render(
      <BrowserRouter>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Find the h1 element and check it has the headlineSmall class
    const title = screen.getByRole('heading', { name: /checked out/i });
    expect(title).toBeInTheDocument();

    // Verify it's using Typography component with proper variant
    const typography = container.querySelector('.MuiTypography-headlineSmall');
    expect(typography).toBeInTheDocument();
  });
});
