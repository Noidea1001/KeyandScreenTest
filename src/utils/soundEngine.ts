class SoundEngine {
  public enabled = true;
  private ctx: AudioContext | null = null;

  private init(): void {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playKeyClick(isFirstPress = false): void {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isFirstPress ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isFirstPress ? 520 : 380, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);

    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playPassFanfare(): void {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    });
  }

  public playSpeakerTest(panValue = 0, mode: 'tone' | 'sweep' = 'tone'): void {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    if (panner) {
      panner.pan.setValueAtTime(panValue, now);
    }

    if (mode === 'sweep') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 1.4);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.45);
      osc.start(now);
      osc.stop(now + 1.5);
    } else {
      osc.type = 'sine';
      const toneFreq = panValue < 0 ? 440 : panValue > 0 ? 554.37 : 659.25;
      osc.frequency.setValueAtTime(toneFreq, now);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.start(now);
      osc.stop(now + 0.7);
    }

    if (panner) {
      osc.connect(panner);
      panner.connect(gain);
    } else {
      osc.connect(gain);
    }
    gain.connect(this.ctx.destination);
  }

  public playFrequencyTone(hz: number, waveform: OscillatorType = 'sine'): void {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = waveform;
    osc.frequency.setValueAtTime(hz, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.76);
  }
}

export const soundEngine = new SoundEngine();
