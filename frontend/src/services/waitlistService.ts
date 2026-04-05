import api from './api';
import type { WaitlistEntryData } from '../types';

const waitlistService = {
  /**
   * Join the waitlist for a book+format
   */
  async joinWaitlist(bookId: number, format: string): Promise<WaitlistEntryData> {
    const response = await api.post('/waitlist', { book_id: bookId, format });
    return response.data.data;
  },

  /**
   * Leave the waitlist for a book+format
   */
  async leaveWaitlist(bookId: number, format: string) {
    const response = await api.delete('/waitlist', { data: { book_id: bookId, format } });
    return response.data.data;
  },

  /**
   * Get the waitlist for a book, optionally filtered by format
   */
  async getBookWaitlist(bookId: number, format?: string): Promise<WaitlistEntryData[]> {
    const params = format ? { format } : {};
    const response = await api.get(`/books/${bookId}/waitlist`, { params });
    return response.data.data;
  },

  /**
   * Get a patron's waitlist entries
   */
  async getPatronWaitlist(patronId: number): Promise<WaitlistEntryData[]> {
    const response = await api.get(`/patrons/${patronId}/waitlist`);
    return response.data.data;
  },
};

export default waitlistService;
