import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { describe, expect, it } from 'vitest';

// The shipped artifact is the subject, not the JSON it is generated from.
// Vitest runs from the package root.
const css = readFileSync(resolvePath(process.cwd(), 'css/tokens.css'), 'utf8');

type Declarations = Record<string, string>;

function block(selector: string): Declarations {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`no ${selector} block in tokens.css`);
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
  const declarations: Declarations = {};
  for (const [, name, value] of body.matchAll(/--([a-z-]+):\s*([^;]+);/g)) {
    declarations[name] = value.trim();
  }
  return declarations;
}

const root = block(':root');
const darkOverrides = block(":root[data-theme='dark']");
const systemOverrides = block(":root[data-theme='system']");
const modes: Record<string, Declarations> = {
  light: root,
  dark: { ...root, ...darkOverrides },
};

function resolve(declarations: Declarations, name: string): string {
  let value = declarations[name];
  for (let depth = 0; depth < 8 && value !== undefined; depth += 1) {
    const reference = /^var\(--([a-z-]+)\)$/.exec(value);
    if (!reference) return value;
    value = declarations[reference[1]];
  }
  throw new Error(`--${name} does not resolve to a color`);
}

function luminance(hex: string): number {
  const channels = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!channels) throw new Error(`${hex} is not a six-digit hex color`);
  const [r, g, b] = channels.slice(1).map((channel) => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Unrounded WCAG 2.x contrast ratio between two roles of one mode. */
function contrast(mode: Declarations, a: string, b: string): number {
  const [lighter, darker] = [
    luminance(resolve(mode, a)),
    luminance(resolve(mode, b)),
  ].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('shipped token contrast', () => {
  it('ships exactly the sixteen primitives', () => {
    const primitives = Object.values(root).filter((value) =>
      value.startsWith('#'),
    );
    expect(primitives).toHaveLength(16);
    expect(new Set(primitives).size).toBe(16);
  });

  it('gives system dark the same roles as explicit dark', () => {
    expect(systemOverrides).toEqual(darkOverrides);
    expect(Object.keys(darkOverrides)).toHaveLength(9);
  });

  it('recomputes the documented base-surface ratio', () => {
    expect(contrast(modes.light, 'on-surface', 'surface')).toBeCloseTo(
      15.32,
      2,
    );
  });

  describe.each(Object.keys(modes))('%s mode', (name) => {
    const mode = modes[name];

    it.each([
      ['on-surface', 'surface', 4.5],
      ['on-primary', 'primary', 4.5],
      ['on-primary-container', 'primary-container', 4.5],
      ['focus', 'surface', 3],
      // Disabled is both text (4.5) and a control boundary (3).
      ['disabled', 'surface', 4.5],
      ['error', 'surface', 4.5],
    ])('%s on %s is at least %d:1', (foreground, background, threshold) => {
      expect(contrast(mode, foreground, background)).toBeGreaterThanOrEqual(
        threshold,
      );
    });
  });
});
