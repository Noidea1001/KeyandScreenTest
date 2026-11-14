import { ScreenTestPattern } from '../types/hardware';

export const DEAD_PIXEL_PATTERNS: ScreenTestPattern[] = [
  { name: 'Pure Red (Dead Subpixel Check)', background: '#ff0000' },
  { name: 'Pure Green (Dead Subpixel Check)', background: '#00ff00' },
  { name: 'Pure Blue (Dead Subpixel Check)', background: '#0000ff' },
  { name: 'Pure White (Dark Defect Check)', background: '#ffffff' },
  { name: 'Pure Black (Stuck Bright Pixel Check)', background: '#000000' },
  { name: 'Pure Yellow (Red + Green Channel)', background: '#ffff00' },
  { name: 'Pure Cyan (Green + Blue Channel)', background: '#00ffff' },
  { name: 'Pure Magenta (Red + Blue Channel)', background: '#ff00ff' }
];

export const UNIFORMITY_PATTERNS: ScreenTestPattern[] = [
  { name: 'Backlight Bleed Inspection (0% Black)', background: '#000000' },
  { name: 'Near-Black Uniformity (5% Grey)', background: '#0d0d0d' },
  { name: 'Dark Uniformity (15% Grey)', background: '#262626' },
  { name: 'Mid-Tone Uniformity (50% Grey)', background: '#808080' }
];

export const GRADIENT_PATTERNS: ScreenTestPattern[] = [
  {
    name: 'RGB Smooth Spectrum Ramp (Color Banding Check)',
    background: 'linear-gradient(90deg, #000000, #ef4444, #22c55e, #3b82f6, #ffffff)'
  },
  {
    name: 'Linear Greyscale Ramp (Luminance Stepping Check)',
    background: 'linear-gradient(90deg, #000000 0%, #ffffff 100%)'
  },
  {
    name: 'Subpixel Alignment & Sharpness Grid',
    background:
      'repeating-linear-gradient(0deg, #111 0px, #111 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #111 0px, #111 1px, #eee 1px, #eee 20px)'
  },
  {
    name: 'SMPTE Broadcast Color Bars',
    background:
      'linear-gradient(90deg, #c0c0c0 0% 14.28%, #c0c000 14.28% 28.56%, #00c0c0 28.56% 42.84%, #00c000 42.84% 57.12%, #c000c0 57.12% 71.4%, #c00000 71.4% 85.68%, #0000c0 85.68% 100%)'
  }
];
