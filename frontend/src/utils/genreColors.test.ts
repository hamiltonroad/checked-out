import { describe, it, expect } from 'vitest';
import { getGenreStyle } from './genreColors';

const KNOWN_GENRES = [
  'Fiction',
  'Science Fiction',
  'Mystery',
  'Fantasy',
  'Biography',
  'History',
  'Science',
  'Self-Help',
  'Philosophy',
  'Horror',
  'Poetry',
];

describe('getGenreStyle', () => {
  it.each(KNOWN_GENRES)('should return a non-default mapping for "%s"', (genre) => {
    const style = getGenreStyle(genre);

    expect(style.bgColor).not.toBe('grey.200');
    expect(style.iconColor).not.toBe('grey.600');
    expect(style.Icon).toBeDefined();
  });

  it('should return default mapping for unknown genre', () => {
    const style = getGenreStyle('Unknown Genre');

    expect(style.bgColor).toBe('grey.200');
    expect(style.iconColor).toBe('grey.600');
  });

  it('should return default mapping for undefined genre', () => {
    const style = getGenreStyle(undefined);

    expect(style.bgColor).toBe('grey.200');
    expect(style.iconColor).toBe('grey.600');
  });

  it('should return default mapping for null genre', () => {
    const style = getGenreStyle(null);

    expect(style.bgColor).toBe('grey.200');
    expect(style.iconColor).toBe('grey.600');
  });

  it('should return object with bgColor, iconColor, and Icon properties', () => {
    const style = getGenreStyle('Fiction');

    expect(style).toHaveProperty('bgColor');
    expect(style).toHaveProperty('iconColor');
    expect(style).toHaveProperty('Icon');
    expect(typeof style.bgColor).toBe('string');
    expect(typeof style.iconColor).toBe('string');
    expect(typeof style.Icon).toBe('object');
  });
});
