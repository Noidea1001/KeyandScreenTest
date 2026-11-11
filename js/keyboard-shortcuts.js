/**
 * Global Hardware Tester Shortcut Helper
 * Triple-Esc triggers instant module reset for rapid batch testing
 */
function isTripleEscapeShortcut(timestamps, now = Date.now(), windowMs = 900) {
  const recent = timestamps.filter((t) => now - t < windowMs);
  recent.push(now);
  return {
    triggered: recent.length >= 3,
    updatedTimestamps: recent.length >= 3 ? [] : recent
  };
}

window.isTripleEscapeShortcut = isTripleEscapeShortcut;
