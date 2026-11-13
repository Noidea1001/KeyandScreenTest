export type ModuleTab =
  | 'keyboard'
  | 'mouse'
  | 'screen'
  | 'media'
  | 'gamepad'
  | 'touch'
  | 'system'
  | 'history';

export type ThemeMode = 'dark' | 'light';

export type KeyboardOSMode = 'win' | 'mac';

export type KeyboardLayoutType =
  | 'full'
  | '96'
  | 'laptop'
  | 'tkl'
  | '75'
  | '65'
  | '60';

export type KeySizeMode = 'large' | 'compact';

export interface KeyDefinition {
  code: string;
  label: string;
  sub?: string;
  width?: string;
  extraClass?: string;
  gap?: string;
  empty?: boolean;
}

export interface KeyboardSectionVisibility {
  fnRow: boolean;
  sysTriad: boolean; // PRTSC, SCRLK, PAUSE
  navSixBlock: boolean; // INS, HOME, PGUP, DEL, END, PGDN
  arrowCluster: boolean;
  numpad: boolean;
  extraModifiers: boolean; // MetaRight, ContextMenu
}

export interface BatchRecord {
  id: number;
  module: string;
  details: string;
  status: 'PASS';
  timestamp: string;
}

export interface BatchMetadata {
  technician: string;
  assetTag: string;
}

export interface PassNotification {
  module: ModuleTab;
  title: string;
  description: string;
}

export interface ScreenTestPattern {
  name: string;
  background: string;
}
