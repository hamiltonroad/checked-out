import type { ComponentType } from 'react';

/**
 * Shared TypeScript types for the Checked Out frontend application
 */

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  data: {
    books: T[];
    pagination: PaginationData;
  };
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// Domain Types
// ============================================================================

export interface Author {
  first_name: string;
  last_name: string;
}

export interface Book {
  id: number;
  title: string;
  isbn?: string;
  publisher?: string;
  publication_year?: number;
  genre?: string;
  status: 'available' | 'checked_out' | 'overdue';
  has_profanity?: boolean;
  average_rating?: number | string;
  total_ratings?: number;
  authors: Author[];
}

export interface Patron {
  id: number;
  first_name: string;
  last_name: string;
  card_number?: string;
  email?: string;
}

export type PatronStatus = 'active' | 'inactive' | 'suspended';

export interface PatronDetail {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  card_number: string;
  status: PatronStatus;
}

export interface PatronCheckout {
  id: number;
  bookTitle: string;
  author: string;
  checkoutDate: string;
  dueDate: string;
  returnedAt: string | null;
  status: 'checked_out' | 'returned';
}

export interface Checkout {
  id: number;
  patronId: number;
  patronName: string;
  bookTitle: string;
  checkoutDate: string;
  returnDate?: string | null;
}

export interface CurrentCheckout {
  id: number;
  patronId: number;
  patronName: string;
  bookTitle: string;
  checkoutDate: string;
  dueDate: string | null;
  daysUntilDue: number | null;
  returnDate: null;
}

export type DueSeverity = 'error' | 'warning' | null;

export interface Rating {
  id: number;
  rating: number;
  review_text?: string;
  created_at: string;
  patron?: {
    first_name: string;
    last_name: string;
  };
}

export interface RatingStatsData {
  average_rating?: number | string;
  total_ratings?: number;
  distribution?: Record<number, number>;
}

export interface ExistingRating {
  rating: number;
  review_text?: string;
}

// ============================================================================
// UI Types
// ============================================================================

export type BookStatus = 'available' | 'checked_out' | 'overdue';

export type ChipSize = 'small' | 'medium';

export type IconSize = 'small' | 'medium' | 'large';

export type RatingSize = 'small' | 'medium' | 'large';

export type ThemeMode = 'light' | 'dark';

export interface NavigationItem {
  id: string;
  label: string;
  icon: ComponentType;
  path: string;
  disabled: boolean;
  ariaLabel: string;
}

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

export interface FieldError {
  field: string;
  message: string;
}
