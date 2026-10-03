export type ThemeMode = 'system' | 'light' | 'dark';

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function applyTheme(mode: ThemeMode): void {
  document.documentElement.dataset.theme = mode;
}

export type PaintThemeCache = {
  restore(): void;
  cache(mode: ThemeMode): void;
};

/**
 * The cache is only a first-paint hint stored under the consumer's own key
 * (`<app>.web.paint-theme.v1`). The consumer's saved preference always
 * replaces it once it is loaded.
 */
export function createPaintThemeCache(storageKey: string): PaintThemeCache {
  return {
    restore() {
      try {
        const cached = window.localStorage.getItem(storageKey);
        applyTheme(isThemeMode(cached) ? cached : 'system');
      } catch {
        applyTheme('system');
      }
    },
    cache(mode) {
      try {
        window.localStorage.setItem(storageKey, mode);
      } catch {
        // Rendering remains correct when storage is unavailable.
      }
    },
  };
}
