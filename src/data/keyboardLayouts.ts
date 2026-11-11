import {
  KeyDefinition,
  KeyboardLayoutType,
  KeyboardSectionVisibility
} from '../types/hardware';

export const MAIN_ALPHANUMERIC_ROWS: KeyDefinition[][] = [
  [
    { code: 'Escape', label: 'ESC' },
    { code: '', label: '', gap: 'gap-fn' },
    { code: 'F1', label: 'F1' },
    { code: 'F2', label: 'F2' },
    { code: 'F3', label: 'F3' },
    { code: 'F4', label: 'F4' },
    { code: '', label: '', gap: 'gap-fn-sm' },
    { code: 'F5', label: 'F5' },
    { code: 'F6', label: 'F6' },
    { code: 'F7', label: 'F7' },
    { code: 'F8', label: 'F8' },
    { code: '', label: '', gap: 'gap-fn-sm' },
    { code: 'F9', label: 'F9' },
    { code: 'F10', label: 'F10' },
    { code: 'F11', label: 'F11' },
    { code: 'F12', label: 'F12' }
  ],
  [
    { code: 'Backquote', label: '~', sub: '`' },
    { code: 'Digit1', label: '!', sub: '1' },
    { code: 'Digit2', label: '@', sub: '2' },
    { code: 'Digit3', label: '#', sub: '3' },
    { code: 'Digit4', label: '$', sub: '4' },
    { code: 'Digit5', label: '%', sub: '5' },
    { code: 'Digit6', label: '^', sub: '6' },
    { code: 'Digit7', label: '&', sub: '7' },
    { code: 'Digit8', label: '*', sub: '8' },
    { code: 'Digit9', label: '(', sub: '9' },
    { code: 'Digit0', label: ')', sub: '0' },
    { code: 'Minus', label: '_', sub: '-' },
    { code: 'Equal', label: '+', sub: '=' },
    { code: 'Backspace', label: 'BACKSPACE', width: 'u-200' }
  ],
  [
    { code: 'Tab', label: 'TAB', width: 'u-150' },
    { code: 'KeyQ', label: 'Q' },
    { code: 'KeyW', label: 'W' },
    { code: 'KeyE', label: 'E' },
    { code: 'KeyR', label: 'R' },
    { code: 'KeyT', label: 'T' },
    { code: 'KeyY', label: 'Y' },
    { code: 'KeyU', label: 'U' },
    { code: 'KeyI', label: 'I' },
    { code: 'KeyO', label: 'O' },
    { code: 'KeyP', label: 'P' },
    { code: 'BracketLeft', label: '{', sub: '[' },
    { code: 'BracketRight', label: '}', sub: ']' },
    { code: 'Backslash', label: '|', sub: '\\', width: 'u-150' }
  ],
  [
    { code: 'CapsLock', label: 'CAPS', width: 'u-175' },
    { code: 'KeyA', label: 'A' },
    { code: 'KeyS', label: 'S' },
    { code: 'KeyD', label: 'D' },
    { code: 'KeyF', label: 'F' },
    { code: 'KeyG', label: 'G' },
    { code: 'KeyH', label: 'H' },
    { code: 'KeyJ', label: 'J' },
    { code: 'KeyK', label: 'K' },
    { code: 'KeyL', label: 'L' },
    { code: 'Semicolon', label: ':', sub: ';' },
    { code: 'Quote', label: '"', sub: "'" },
    { code: 'Enter', label: 'ENTER', width: 'u-225' }
  ],
  [
    { code: 'ShiftLeft', label: 'SHIFT', width: 'u-225' },
    { code: 'KeyZ', label: 'Z' },
    { code: 'KeyX', label: 'X' },
    { code: 'KeyC', label: 'C' },
    { code: 'KeyV', label: 'V' },
    { code: 'KeyB', label: 'B' },
    { code: 'KeyN', label: 'N' },
    { code: 'KeyM', label: 'M' },
    { code: 'Comma', label: '<', sub: ',' },
    { code: 'Period', label: '>', sub: '.' },
    { code: 'Slash', label: '?', sub: '/' },
    { code: 'ShiftRight', label: 'SHIFT', width: 'u-275' }
  ],
  [
    { code: 'ControlLeft', label: 'CTRL', width: 'u-125' },
    { code: 'MetaLeft', label: 'WIN', width: 'u-125' },
    { code: 'AltLeft', label: 'ALT', width: 'u-125' },
    { code: 'Space', label: 'SPACE', width: 'u-625' },
    { code: 'AltRight', label: 'ALT', width: 'u-125' },
    { code: 'MetaRight', label: 'WIN', width: 'u-125' },
    { code: 'ContextMenu', label: 'MENU', width: 'u-125' },
    { code: 'ControlRight', label: 'CTRL', width: 'u-125' }
  ]
];

export const NAVIGATION_CLUSTER_ROWS: KeyDefinition[][] = [
  [
    { code: 'PrintScreen', label: 'PRTSC' },
    { code: 'ScrollLock', label: 'SCRLK' },
    { code: 'Pause', label: 'PAUSE' }
  ],
  [
    { code: 'Insert', label: 'INS' },
    { code: 'Home', label: 'HOME' },
    { code: 'PageUp', label: 'PGUP' }
  ],
  [
    { code: 'Delete', label: 'DEL' },
    { code: 'End', label: 'END' },
    { code: 'PageDown', label: 'PGDN' }
  ],
  [{ code: '', label: '', empty: true }],
  [
    { code: '', label: '', empty: true },
    { code: 'ArrowUp', label: 'UP' },
    { code: '', label: '', empty: true }
  ],
  [
    { code: 'ArrowLeft', label: 'LEFT' },
    { code: 'ArrowDown', label: 'DOWN' },
    { code: 'ArrowRight', label: 'RIGHT' }
  ]
];

export const NUMPAD_DEFINITIONS: KeyDefinition[] = [
  { code: 'NumLock', label: 'NUM' },
  { code: 'NumpadDivide', label: '/' },
  { code: 'NumpadMultiply', label: '*' },
  { code: 'NumpadSubtract', label: '-' },
  { code: 'Numpad7', label: '7', sub: 'HOME' },
  { code: 'Numpad8', label: '8', sub: 'UP' },
  { code: 'Numpad9', label: '9', sub: 'PGUP' },
  { code: 'NumpadAdd', label: '+', extraClass: 'key-tall' },
  { code: 'Numpad4', label: '4', sub: 'LEFT' },
  { code: 'Numpad5', label: '5' },
  { code: 'Numpad6', label: '6', sub: 'RIGHT' },
  { code: 'Numpad1', label: '1', sub: 'END' },
  { code: 'Numpad2', label: '2', sub: 'DOWN' },
  { code: 'Numpad3', label: '3', sub: 'PGDN' },
  { code: 'NumpadEnter', label: 'ENTER', extraClass: 'key-tall' },
  { code: 'Numpad0', label: '0', sub: 'INS', extraClass: 'key-wide' },
  { code: 'NumpadDecimal', label: '.', sub: 'DEL' }
];

export const NAV_SIX_BLOCK_CODES = new Set([
  'Insert',
  'Home',
  'PageUp',
  'Delete',
  'End',
  'PageDown'
]);

export const SYS_TRIAD_CODES = new Set(['PrintScreen', 'ScrollLock', 'Pause']);

export const EXTRA_MODIFIER_CODES = new Set(['MetaRight', 'ContextMenu']);

export function getDefaultSectionsForLayout(
  layout: KeyboardLayoutType
): KeyboardSectionVisibility {
  switch (layout) {
    case 'full':
      return {
        fnRow: true,
        sysTriad: true,
        navSixBlock: true,
        arrowCluster: true,
        numpad: true,
        extraModifiers: true
      };
    case '96':
      return {
        fnRow: true,
        sysTriad: false,
        navSixBlock: false,
        arrowCluster: true,
        numpad: true,
        extraModifiers: false
      };
    case 'laptop':
      return {
        fnRow: true,
        sysTriad: false,
        navSixBlock: false,
        arrowCluster: true,
        numpad: false,
        extraModifiers: false
      };
    case 'tkl':
      return {
        fnRow: true,
        sysTriad: true,
        navSixBlock: true,
        arrowCluster: true,
        numpad: false,
        extraModifiers: true
      };
    case '75':
      return {
        fnRow: true,
        sysTriad: false,
        navSixBlock: true,
        arrowCluster: true,
        numpad: false,
        extraModifiers: false
      };
    case '65':
      return {
        fnRow: false,
        sysTriad: false,
        navSixBlock: false,
        arrowCluster: true,
        numpad: false,
        extraModifiers: false
      };
    case '60':
      return {
        fnRow: false,
        sysTriad: false,
        navSixBlock: false,
        arrowCluster: false,
        numpad: false,
        extraModifiers: false
      };
  }
}

export function getTargetKeyCodes(
  sections: KeyboardSectionVisibility,
  excludedCodes: Set<string>
): string[] {
  const codes: string[] = [];

  MAIN_ALPHANUMERIC_ROWS.forEach((row, rIdx) => {
    if (!sections.fnRow && rIdx === 0) return;
    row.forEach((k) => {
      if (!k.code) return;
      if (!sections.extraModifiers && EXTRA_MODIFIER_CODES.has(k.code)) return;
      if (!excludedCodes.has(k.code)) {
        codes.push(k.code);
      }
    });
  });

  NAVIGATION_CLUSTER_ROWS.forEach((row) => {
    row.forEach((k) => {
      if (!k.code) return;
      if (SYS_TRIAD_CODES.has(k.code) && !sections.sysTriad) return;
      if (NAV_SIX_BLOCK_CODES.has(k.code) && !sections.navSixBlock) return;
      if (k.code.startsWith('Arrow') && !sections.arrowCluster) return;
      if (!excludedCodes.has(k.code)) {
        codes.push(k.code);
      }
    });
  });

  if (sections.numpad) {
    NUMPAD_DEFINITIONS.forEach((k) => {
      if (k.code && !excludedCodes.has(k.code)) {
        codes.push(k.code);
      }
    });
  }

  return codes;
}
