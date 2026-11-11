/**
 * System & Hardware Environment Inspector
 * Detects CPU Threads, Device Memory, WebGL GPU Renderer, and Battery Info
 */
function getSystemHardwareSummary() {
  const info = {
    cores: navigator.hardwareConcurrency || 'N/A',
    memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB+` : 'N/A',
    platform: navigator.platform || 'Unknown OS',
    gpu: 'Standard Display Adapter'
  };

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        info.gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch (e) {
    // Ignore WebGL lookup errors
  }

  return info;
}

window.getSystemHardwareSummary = getSystemHardwareSummary;
