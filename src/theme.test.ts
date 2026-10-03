import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyTheme, createPaintThemeCache, isThemeMode } from './theme.js';

const key = 'catalog.web.paint-theme.v1';
const theme = () => document.documentElement.dataset.theme;

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe('theme', () => {
  it('applies the mode attribute to the document element', () => {
    applyTheme('dark');
    expect(theme()).toBe('dark');
  });

  it('recognizes only the three theme modes', () => {
    expect(['system', 'light', 'dark'].every(isThemeMode)).toBe(true);
    expect([null, undefined, '', 'Dark', 'sepia', 1].some(isThemeMode)).toBe(
      false,
    );
  });

  it('restores a cached value from the given storage key', () => {
    const paintTheme = createPaintThemeCache(key);
    paintTheme.cache('light');
    expect(window.localStorage.getItem(key)).toBe('light');
    paintTheme.restore();
    expect(theme()).toBe('light');
  });

  it('falls back to system when nothing or garbage is cached', () => {
    const paintTheme = createPaintThemeCache(key);
    paintTheme.restore();
    expect(theme()).toBe('system');
    window.localStorage.setItem(key, 'sepia');
    applyTheme('dark');
    paintTheme.restore();
    expect(theme()).toBe('system');
  });

  it('falls back to system when storage throws on read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    createPaintThemeCache(key).restore();
    expect(theme()).toBe('system');
  });

  it('does not throw when storage throws on write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    expect(() => createPaintThemeCache(key).cache('dark')).not.toThrow();
  });
});
