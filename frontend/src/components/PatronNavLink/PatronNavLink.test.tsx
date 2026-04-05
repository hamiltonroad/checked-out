import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PatronNavLink from './PatronNavLink';
import type { Patron } from '../../types';

const mockPatron: Patron = {
  id: 42,
  first_name: 'Alice',
  last_name: 'Smith',
  status: 'active',
};

function renderWithRouter(patron: Patron = mockPatron) {
  return render(
    <BrowserRouter>
      <PatronNavLink patron={patron} />
    </BrowserRouter>
  );
}

describe('PatronNavLink', () => {
  it('renders patron first name as visible text', () => {
    renderWithRouter();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders a person icon', () => {
    renderWithRouter();
    expect(screen.getByTestId('PersonIcon')).toBeInTheDocument();
  });

  it('links to the patron detail page with correct ID', () => {
    renderWithRouter();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/patrons/42');
  });

  it('icon and name are within the same clickable element', () => {
    renderWithRouter();
    const link = screen.getByRole('link');
    expect(link).toContainElement(screen.getByTestId('PersonIcon'));
    expect(link).toContainElement(screen.getByText('Alice'));
  });

  it('is keyboard focusable', () => {
    renderWithRouter();
    const link = screen.getByRole('link');
    link.focus();
    expect(link).toHaveFocus();
  });

  it('uses different patron IDs correctly', () => {
    const otherPatron: Patron = {
      id: 99,
      first_name: 'Bob',
      last_name: 'Jones',
      status: 'active',
    };
    renderWithRouter(otherPatron);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/patrons/99');
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('person icon has aria-hidden attribute', () => {
    renderWithRouter();
    const icon = screen.getByTestId('PersonIcon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});
