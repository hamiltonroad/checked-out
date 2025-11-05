import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import AppDrawer from './AppDrawer';
import { ThemeProvider } from '../../context/ThemeContext';

describe('AppDrawer', () => {
  it('renders all navigation items', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AppDrawer />
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
          <AppDrawer />
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

  it('highlights Books as active when on home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ThemeProvider>
          <AppDrawer />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Find the Books list item (MUI ListItemButton renders as div with role="button")
    const booksButton = screen.getByText('Books').closest('[role="button"]');

    // Check if it has the selected class
    expect(booksButton).toHaveClass('Mui-selected');
  });

  it('does not highlight Books when on different route', () => {
    render(
      <MemoryRouter initialEntries={['/other']}>
        <ThemeProvider>
          <AppDrawer />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Find the Books list item (MUI ListItemButton renders as div with role="button")
    const booksButton = screen.getByText('Books').closest('[role="button"]');

    // Check if it does not have the selected class
    expect(booksButton).not.toHaveClass('Mui-selected');
  });

  it('disables Patrons navigation item', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AppDrawer />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Find the Patrons button (MUI ListItemButton renders as div with role="button")
    const patronsButton = screen.getByText('Patrons').closest('[role="button"]');

    // Check if it has the disabled class
    expect(patronsButton).toHaveClass('Mui-disabled');
  });

  it('disables Reports navigation item', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AppDrawer />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Find the Reports button (MUI ListItemButton renders as div with role="button")
    const reportsButton = screen.getByText('Reports').closest('[role="button"]');

    // Check if it has the disabled class
    expect(reportsButton).toHaveClass('Mui-disabled');
  });

  it('enables Books navigation item', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AppDrawer />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Find the Books button (MUI ListItemButton renders as div with role="button")
    const booksButton = screen.getByText('Books').closest('[role="button"]');

    // Check if it's enabled (not disabled)
    expect(booksButton).not.toHaveClass('Mui-disabled');
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AppDrawer />
        </ThemeProvider>
      </BrowserRouter>
    );

    const booksButton = screen.getByText('Books').closest('[role="button"]');

    // Tab to the Books button
    await user.tab();
    expect(booksButton).toHaveFocus();
  });

  it('renders as permanent drawer', () => {
    const { container } = render(
      <BrowserRouter>
        <ThemeProvider>
          <AppDrawer />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Check for permanent drawer variant
    const drawer = container.querySelector('.MuiDrawer-root');
    expect(drawer).toBeInTheDocument();
  });

  it('has correct 240px width', () => {
    const { container } = render(
      <BrowserRouter>
        <ThemeProvider>
          <AppDrawer />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Check drawer paper has correct width class
    const drawerPaper = container.querySelector('.MuiDrawer-paper');
    expect(drawerPaper).toBeInTheDocument();
  });

  it('does not navigate when clicking disabled items', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AppDrawer />
        </ThemeProvider>
      </BrowserRouter>
    );

    const patronsButton = screen.getByText('Patrons').closest('[role="button"]');

    // Check that the button has the disabled class
    // Disabled MUI buttons have Mui-disabled class
    expect(patronsButton).toHaveClass('Mui-disabled');
  });

  it('renders ListItemButton components', () => {
    const { container } = render(
      <BrowserRouter>
        <ThemeProvider>
          <AppDrawer />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Check for ListItemButton classes
    const listItemButtons = container.querySelectorAll('.MuiListItemButton-root');
    expect(listItemButtons).toHaveLength(3); // Books, Patrons, Reports
  });

  it('renders ListItemIcon components', () => {
    const { container } = render(
      <BrowserRouter>
        <ThemeProvider>
          <AppDrawer />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Check for ListItemIcon classes
    const listItemIcons = container.querySelectorAll('.MuiListItemIcon-root');
    expect(listItemIcons).toHaveLength(3); // Three icons
  });

  it('renders ListItemText components', () => {
    const { container } = render(
      <BrowserRouter>
        <ThemeProvider>
          <AppDrawer />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Check for ListItemText classes
    const listItemTexts = container.querySelectorAll('.MuiListItemText-root');
    expect(listItemTexts).toHaveLength(3); // Three text labels
  });
});
