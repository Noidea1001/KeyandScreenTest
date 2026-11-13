import { describe, it, expect } from 'vitest';
import {
  getDefaultSectionsForLayout,
  getTargetKeyCodes
} from '../keyboardLayouts';

describe('keyboardLayouts', () => {
  it('returns 104 target keys for full layout with no exclusions', () => {
    const sections = getDefaultSectionsForLayout('full');
    const codes = getTargetKeyCodes(sections, new Set());
    expect(codes.length).toBe(104);
  });

  it('omits numpad, nav/fn sections, and extra modifiers for 60% layout', () => {
    const sections = getDefaultSectionsForLayout('60');
    const codes = getTargetKeyCodes(sections, new Set());
    expect(codes).not.toContain('F1');
    expect(codes).not.toContain('ArrowUp');
    expect(codes).not.toContain('Numpad1');
    expect(codes).not.toContain('MetaRight');
    expect(codes.length).toBe(59);
  });

  it('excludes right-clicked custom keys from target codes', () => {
    const sections = getDefaultSectionsForLayout('tkl');
    const allTkl = getTargetKeyCodes(sections, new Set());
    const filtered = getTargetKeyCodes(sections, new Set(['Pause', 'ScrollLock']));
    expect(filtered.length).toBe(allTkl.length - 2);
    expect(filtered).not.toContain('Pause');
    expect(filtered).not.toContain('ScrollLock');
  });
});
