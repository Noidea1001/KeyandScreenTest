/**
 * Audio Frequency & Decibel Level Estimation Helper
 */
function calculateAudioLevelPercent(frequencyData) {
  if (!frequencyData || frequencyData.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < frequencyData.length; i++) {
    total += frequencyData[i];
  }
  const avg = total / frequencyData.length;
  return Math.min(100, Math.round((avg / 128) * 100));
}

window.calculateAudioLevelPercent = calculateAudioLevelPercent;
