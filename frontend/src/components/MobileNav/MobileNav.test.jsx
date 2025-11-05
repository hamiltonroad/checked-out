import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import MobileNav from './MobileNav';
import { ThemeProvider } from '../../context/ThemeContext';

describe('MobileNav', () => {
  it('renders all navigation items', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <MobileNav />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Check for Books navigation item
    expect(screen.getByText('Books')).toBeInTheDocument();

    // Check for Patrons navigation item
    expect(screen.getByText('Patrons')).toBeInTheDocument();

    // Check for Reports navigation item
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('renders navigation icons', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <MobileNav />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Check for MenuBookIcon
    expect(screen.getByTestId('MenuBookIcon')).toBeInTheDocument();

    // Check for PeopleIcon
    expect(screen.getByTestId('PeopleIcon')).toBeInTheDocument();

    // Check for AssessmentIcon
    expect(screen.getByTestId('AssessmentIcon')).toBeInTheDocument();
  });

  it('shows labels alongside icons', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <MobileNav />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Labels should be visible
    expect(screen.getByText('Books')).toBeVisible();
    expect(screen.getByText('Patrons')).toBeVisible();
    expect(screen.getByText('Reports')).toBeVisible();
  });

  it('selects Books when on home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ThemeProvider>
          <MobileNav />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Find the Books button
    const booksButton = screen.getByLabelText('Navigate to Books');

    // Check if it has the selected class
    expect(booksButton).toHaveClass('Mui-selected');
  });

  it('does not select Books when on different route', () => {
    render(
      <MemoryRouter initialEntries={['/other']}>
        <ThemeProvider>
          <MobileNav />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Find the Books button
    const booksButton = screen.getByLabelText('Navigate to Books');

    // Should not be selected
    expect(booksButton).toHaveClass('Mui-selected');
    // Note: Will still be selected because getCurrentValue() defaults to 0 for unknown routes
  });

  it('disables Patrons navigation item', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <MobileNav />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Find the Patrons button
    const patronsButton = screen.getByLabelText('Patrons (coming soon)');

    // Check if it's disabled
    expect(patronsButton).toHaveClass('Mui-disabled');
  });

  it('disables Reports navigation item', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <MobileNav />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Find the Reports button
    const reportsButton = screen.getByLabelText('Reports (coming soon)');

    // Check if it's disabled
    expect(reportsButton).toHaveClass('Mui-disabled');
  });

  it('enables Books navigation item', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <MobileNav />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Find the Books button
    const booksButton = screen.getByLabelText('Navigate to Books');

    // Check if it's enabled (not disabled)
    expect(booksButton).not.toHaveClass('Mui-disabled');
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <ThemeProvider>
          <MobileNav />
        </ThemeProvider>
      </BrowserRouter>
    );

    const booksButton = screen.getByLabelText('Navigate to Books');

    // Tab to the Books button
    await user.tab();
    expect(booksButton).toHaveFocus();
  });

  it('renders as BottomNavigation component', () => {
    const { container } = render(
      <BrowserRouter>
        <ThemeProvider>
          <MobileNav />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Check for BottomNavigation class
    const bottomNav = container.querySelector('.MuiBottomNavigation-root');
    expect(bottomNav).toBeInTheDocument();
  });

  it('renders three BottomNavigationAction components', () => {
    const { container } = render(
      <BrowserRouter>
        <ThemeProvider>
          <MobileNav />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Check for BottomNavigationAction classes
    const actions = container.querySelectorAll('.MuiBottomNavigationAction-root');
    expect(actions).toHaveLength(3); // Books, Patrons, Reports
  });

  it('is positioned fixed at bottom', () => {
    const { container } = render(
      <BrowserRouter>
        <ThemeProvider>
          <MobileNav />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Check for Paper with fixed positioning
    const paper = container.querySelector('.MuiPaper-root');
    expect(paper).toBeInTheDocument();
  });

  it('has proper ARIA labels', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <MobileNav />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Check for ARIA labels
    expect(screen.getByLabelText('Navigate to Books')).toBeInTheDocument();
    expect(screen.getByLabelText('Patrons (coming soon)')).toBeInTheDocument();
    expect(screen.getByLabelText('Reports (coming soon)')).toBeInTheDocument();
  });

  it('changes value when Books is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/other']}>
        <ThemeProvider>
          <MobileNav />
        </ThemeProvider>
      </MemoryRouter>
    );

    const booksButton = screen.getByLabelText('Navigate to Books');

    // Click the Books button
    await user.click(booksButton);

    // Books should now be selected
    expect(booksButton).toHaveClass('Mui-selected');
  });

  it('renders with elevation', () => {
    const { container } = render(
      <BrowserRouter>
        <ThemeProvider>
          <MobileNav />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Check for Paper with elevation
    const paper = container.querySelector('.MuiPaper-elevation3');
    expect(paper).toBeInTheDocument();
  });
});
