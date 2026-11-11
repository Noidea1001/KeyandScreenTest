export type ModuleTab =
  | 'keyboard'
  | 'mouse'
  | 'screen'
  | 'media'
  | 'gamepad'
  | 'history';

export type KeyboardLayoutType = 'full' | 'tkl' | '75' | '60';

export interface KeyDefinition {
  code: string;
  label: string;
  sub?: string;
  width?: string;
  extraClass?: string;
  gap?: string;
  empty?: boolean;
}

export interface BatchRecord {
  id: number;
  module: string;
  details: string;
  status: 'PASS';
  timestamp: string;
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
