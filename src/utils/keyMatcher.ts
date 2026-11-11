const KEY_NAME_TO_CODE_MAP: Record<string, string> = {
  Insert: 'Insert',
  Delete: 'Delete',
  Home: 'Home',
  End: 'End',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
  PrintScreen: 'PrintScreen',
  ScrollLock: 'ScrollLock',
  Pause: 'Pause',
  ContextMenu: 'ContextMenu',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Escape: 'Escape',
  Backspace: 'Backspace',
  Tab: 'Tab',
  CapsLock: 'CapsLock',
  NumLock: 'NumLock',
  Clear: 'Numpad5'
};

const LEGACY_CODE_ALIASES: Record<string, string> = {
  OSLeft: 'MetaLeft',
  OSRight: 'MetaRight',
  Help: 'Insert',
  IntlBackslash: 'Backslash',
  IntlRo: 'Slash',
  IntlYen: 'Backslash'
};

const KEYCODE_FALLBACK_MAP: Record<number, string> = {
  45: 'Insert',
  46: 'Delete',
  36: 'Home',
  35: 'End',
  33: 'PageUp',
  34: 'PageDown',
  44: 'PrintScreen',
  145: 'ScrollLock',
  19: 'Pause',
  93: 'ContextMenu'
};

/**
 * Resolves all matching canonical key codes for a KeyboardEvent.
 * Ensures that laptop Fn-layer combinations (e.g., Fn+Left = Home, Fn+Up = PageUp)
 * and non-standard firmware scan codes reliably trigger the target key on screen.
 */
export function resolveMatchedKeyCodes(e: KeyboardEvent): string[] {
  const matched = new Set<string>();

  if (e.code) {
    matched.add(e.code);
    if (LEGACY_CODE_ALIASES[e.code]) {
      matched.add(LEGACY_CODE_ALIASES[e.code]);
    }
  }

  if (e.key && KEY_NAME_TO_CODE_MAP[e.key]) {
    matched.add(KEY_NAME_TO_CODE_MAP[e.key]);
  }

  if (e.keyCode && KEYCODE_FALLBACK_MAP[e.keyCode]) {
    matched.add(KEYCODE_FALLBACK_MAP[e.keyCode]);
  }

  return Array.from(matched);
}
