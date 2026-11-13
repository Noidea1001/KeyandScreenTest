import { describe, it, expect } from 'vitest';
import { resolveMatchedKeyCodes } from '../keyMatcher';

function makeKeyEvent(
  overrides: Partial<Pick<KeyboardEvent, 'code' | 'key' | 'keyCode'>>
): KeyboardEvent {
  return {
    code: '',
    key: '',
    keyCode: 0,
    ...overrides
  } as KeyboardEvent;
}

describe('resolveMatchedKeyCodes', () => {
  it('resolves standard event.code values', () => {
    expect(resolveMatchedKeyCodes(makeKeyEvent({ code: 'KeyA', key: 'a' }))).toEqual([
      'KeyA'
    ]);
  });

  it('maps legacy OSLeft/OSRight and Intl aliases to canonical codes', () => {
    expect(resolveMatchedKeyCodes(makeKeyEvent({ code: 'OSLeft' }))).toEqual([
      'OSLeft',
      'MetaLeft'
    ]);
    expect(resolveMatchedKeyCodes(makeKeyEvent({ code: 'IntlBackslash' }))).toEqual([
      'IntlBackslash',
      'Backslash'
    ]);
  });

  it('resolves Fn-layer key names and fallback keyCodes', () => {
    expect(
      resolveMatchedKeyCodes(makeKeyEvent({ code: 'ArrowLeft', key: 'Home' }))
    ).toEqual(['ArrowLeft', 'Home']);
    expect(resolveMatchedKeyCodes(makeKeyEvent({ keyCode: 44 }))).toEqual([
      'PrintScreen'
    ]);
  });

  it('deduplicates when code, key, and keyCode resolve to the same target', () => {
    expect(
      resolveMatchedKeyCodes(
        makeKeyEvent({ code: 'Insert', key: 'Insert', keyCode: 45 })
      )
    ).toEqual(['Insert']);
  });
});
