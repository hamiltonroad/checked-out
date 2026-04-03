import api from './api';

export interface CopyAvailability {
  id: number;
  copy_number: number;
  format: string;
  barcode: string | null;
  asin: string | null;
}

export interface AvailableCopiesResponse {
  success: boolean;
  message: string;
  data: {
    copies: CopyAvailability[];
    totalCopies: number;
  };
}

const copyService = {
  /**
   * Get available copies for a specific book
   */
  async getAvailableByBook(bookId: number): Promise<AvailableCopiesResponse> {
    const response = await api.get(`/copies/book/${bookId}/available`);
    return response.data;
  },
};

export default copyService;
