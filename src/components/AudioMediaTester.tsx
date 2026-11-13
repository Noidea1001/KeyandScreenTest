import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  Mic,
  Camera,
  Check,
  Play,
  Waves
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface AudioMediaTesterProps {
  resetSignal: number;
  onActivity: () => void;
  onPass: (title: string, description: string) => void;
}

export const AudioMediaTester: React.FC<AudioMediaTesterProps> = ({
  resetSignal,
  onActivity,
  onPass
}) => {
  const [verifiedParts, setVerifiedParts] = useState<Set<string>>(new Set());
  const [micVolume, setMicVolume] = useState<number>(0);
  const [micLoopback, setMicLoopback] = useState<boolean>(false);
  const [micStatus, setMicStatus] = useState<string>('Idle — Click Start to test microphone');
  const [cameraStatus, setCameraStatus] = useState<string>('Idle — Click Start to test camera');

  const micCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const micLoopbackGainRef = useRef<GainNode | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasTriggeredPassRef = useRef<boolean>(false);

  const resetMediaState = useCallback(() => {
    setVerifiedParts(new Set());
    hasTriggeredPassRef.current = false;
  }, []);

  useEffect(() => {
    resetMediaState();
  }, [resetSignal, resetMediaState]);

  useEffect(() => {
    if (verifiedParts.size === 3 && !hasTriggeredPassRef.current) {
      hasTriggeredPassRef.current = true;
      onPass(
        'Audio, Microphone & Camera Verified — PASS',
        'Stereo speaker channels, microphone input signal, and video capture stream verified'
      );
    }
  }, [verifiedParts, onPass]);

  const markPartVerified = (part: string) => {
    onActivity();
    soundEngine.playKeyClick(true);
    setVerifiedParts((prev) => new Set(prev).add(part));
  };

  const startMicrophoneTest = async () => {
    onActivity();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStatus('Active — Capturing real-time audio spectrum');
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const loopbackGain = audioCtx.createGain();
      loopbackGain.gain.value = micLoopback ? 0.8 : 0;
      source.connect(loopbackGain);
      loopbackGain.connect(audioCtx.destination);
      micLoopbackGainRef.current = loopbackGain;

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      const drawLoop = () => {
        const canvas = micCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        analyser.getByteFrequencyData(buffer);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let sum = 0;
        const barWidth = (canvas.width / buffer.length) * 2;
        let x = 0;

        for (let i = 0; i < buffer.length; i++) {
          const val = buffer[i];
          sum += val;
          const barHeight = (val / 255) * canvas.height;
          ctx.fillStyle = '#10b981';
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }

        const pct = Math.min(100, Math.round((sum / buffer.length / 128) * 100));
        setMicVolume(pct);
        requestAnimationFrame(drawLoop);
      };
      drawLoop();
    } catch {
      setMicStatus('Permission denied or no microphone hardware detected');
    }
  };

  const toggleMicLoopback = () => {
    onActivity();
    const next = !micLoopback;
    setMicLoopback(next);
    if (micLoopbackGainRef.current) {
      micLoopbackGainRef.current.gain.value = next ? 0.8 : 0;
    }
  };

  const startCameraTest = async () => {
    onActivity();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (!videoRef.current) return;
          setCameraStatus(
            `Active — ${videoRef.current.videoWidth}x${videoRef.current.videoHeight} Stream`
          );
        };
      }
    } catch {
      setCameraStatus('Permission denied or no camera device detected');
    }
  };

  return (
    <section className="module-panel active">
      <div className="media-grid">
        {/* Speaker Channel Card */}
        <div
          className={`diagnostic-card ${
            verifiedParts.has('speaker') ? 'done' : ''
          }`}
        >
          <div>
            <div className="card-header-inline">
              <Volume2 size={18} />
              <h3 className="card-title">Speaker & Stereo Channel Verification</h3>
            </div>
            <p className="card-desc">
              Test left channel, right channel, stereo phase balance, and low-to-high frequency response sweep.
            </p>
            <div className="speaker-btn-grid">
              <button
                className="btn"
                onClick={() => soundEngine.playSpeakerTest(-1, 'tone')}
              >
                <Play size={14} />
                <span>Left Channel (L)</span>
              </button>
              <button
                className="btn"
                onClick={() => soundEngine.playSpeakerTest(1, 'tone')}
              >
                <Play size={14} />
                <span>Right Channel (R)</span>
              </button>
              <button
                className="btn"
                onClick={() => soundEngine.playSpeakerTest(0, 'tone')}
              >
                <Play size={14} />
                <span>Center Stereo (L+R)</span>
              </button>
              <button
                className="btn"
                onClick={() => soundEngine.playSpeakerTest(0, 'sweep')}
              >
                <Waves size={14} />
                <span>Frequency Sweep</span>
              </button>
            </div>
          </div>
          <button
            className="btn"
            onClick={() => markPartVerified('speaker')}
          >
            <Check size={14} />
            <span>Confirm Audio Output OK</span>
          </button>
        </div>

        {/* Microphone Card */}
        <div
          className={`diagnostic-card ${verifiedParts.has('mic') ? 'done' : ''}`}
        >
          <div>
            <div className="card-header-inline">
              <Mic size={18} />
              <h3 className="card-title">Microphone Input & Spectrum Analyzer</h3>
            </div>
            <p className="card-desc">
              Verify audio capture sensitivity and inspect real-time frequency response.
            </p>
            <canvas
              ref={micCanvasRef}
              className="visualizer-canvas"
              width={400}
              height={110}
            />
            <div className="media-meta-row">
              <span>
                Input Level: <strong className="text-green">{micVolume}%</strong>
              </span>
              <span>{micStatus}</span>
            </div>
          </div>
          <div className="card-actions">
            <button className="btn btn-primary" onClick={startMicrophoneTest}>
              <Mic size={14} />
              <span>Start Microphone</span>
            </button>
            <button
              className={`btn ${micLoopback ? 'btn-primary' : 'btn-secondary'}`}
              onClick={toggleMicLoopback}
              title="Route microphone input to speakers (use headphones to avoid feedback)"
            >
              <Volume2 size={14} />
              <span>{micLoopback ? 'Loopback: ON' : 'Loopback: OFF'}</span>
            </button>
            <button className="btn" onClick={() => markPartVerified('mic')}>
              <Check size={14} />
              <span>Confirm Microphone OK</span>
            </button>
          </div>
        </div>

        {/* Camera Card */}
        <div
          className={`diagnostic-card ${
            verifiedParts.has('webcam') ? 'done' : ''
          }`}
        >
          <div>
            <div className="card-header-inline">
              <Camera size={18} />
              <h3 className="card-title">Video Capture & Sensor Diagnostic</h3>
            </div>
            <p className="card-desc">
              Inspect webcam sensor clarity, framing, and native hardware resolution.
            </p>
            <video ref={videoRef} id="webcamVideo" autoPlay playsInline muted />
            <div className="media-meta-row">
              <span>{cameraStatus}</span>
            </div>
          </div>
          <div className="card-actions">
            <button className="btn btn-primary" onClick={startCameraTest}>
              <Camera size={14} />
              <span>Start Camera</span>
            </button>
            <button className="btn" onClick={() => markPartVerified('webcam')}>
              <Check size={14} />
              <span>Confirm Camera OK</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
