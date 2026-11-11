/**
 * Mouse CPI / DPI & Polling Stability Estimator
 */
function classifyPollingRate(hz) {
  if (hz >= 900) return '1000Hz Gaming Grade';
  if (hz >= 450) return '500Hz High Rate';
  if (hz >= 220) return '250Hz Fast Office';
  if (hz >= 100) return '125Hz Standard';
  return 'Measuring...';
}

window.classifyPollingRate = classifyPollingRate;
