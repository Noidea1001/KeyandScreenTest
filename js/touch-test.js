/**
 * Multi-Touch Screen & Digitizer Diagnostic Helper
 * Tracks simultaneous touch points for touchscreen laptops & monitors
 */
class TouchScreenDiag {
  constructor() {
    this.maxTouchPoints = navigator.maxTouchPoints || 0;
    this.activeTouches = 0;
  }

  isTouchSupported() {
    return this.maxTouchPoints > 0 || 'ontouchstart' in window;
  }
}

window.TouchScreenDiag = new TouchScreenDiag();
