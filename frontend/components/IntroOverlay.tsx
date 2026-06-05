'use client';

import { useEffect, useState, useRef } from 'react';
import { Shield, Zap, Brain, Globe, Lock, AlertTriangle } from 'lucide-react';

interface IntroOverlayProps {
  onComplete: () => void;
}

const bootMessages = [
  'Initializing FAKE SHIELD Neural Engine...',
  'Loading threat intelligence database...',
  'Connecting to AI classification modules...',
  'Calibrating phishing pattern detectors...',
  'Bootstrapping graph analysis network...',
  'Establishing secure API connections...',
  'System armed and operational.',
];

export default function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let prog = 0;
    let msgIdx = 0;

    intervalRef.current = setInterval(() => {
      prog += Math.random() * 8 + 4;
      if (prog >= 100) {
        prog = 100;
        clearInterval(intervalRef.current!);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => {
            setVisible(false);
            onComplete();
          }, 800);
        }, 600);
      }

      setProgress(Math.min(100, prog));

      const newMsgIdx = Math.floor((prog / 100) * bootMessages.length);
      if (newMsgIdx !== msgIdx && newMsgIdx < bootMessages.length) {
        msgIdx = newMsgIdx;
        setCurrentMessage(msgIdx);
      }
    }, 180);

    return () => clearInterval(intervalRef.current!);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-800 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at center, #0a0f1e 0%, #020409 70%, #000000 100%)',
      }}
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 162, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 162, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            animation: 'gridPan 20s linear infinite',
          }}
        />
        {/* Animated radial glow blobs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(0, 162, 255, 0.6) 0%, transparent 70%)',
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(99, 0, 255, 0.6) 0%, transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-10 max-w-lg w-full px-8">
        {/* Logo animation */}
        <div className="relative flex items-center justify-center">
          {/* Outer rotating ring */}
          <div
            className="absolute w-40 h-40 rounded-full border-2 border-blue-500/30"
            style={{ animation: 'spin 8s linear infinite' }}
          />
          <div
            className="absolute w-32 h-32 rounded-full border border-blue-400/20"
            style={{ animation: 'spin 5s linear infinite reverse' }}
          />
          {/* Shield icon */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(0,162,255,0.3) 0%, rgba(0,100,200,0.1) 100%)',
              boxShadow: '0 0 60px rgba(0, 162, 255, 0.5), 0 0 120px rgba(0, 162, 255, 0.2)',
              animation: 'shieldPulse 2s ease-in-out infinite',
            }}
          >
            <Shield className="w-12 h-12 text-blue-400" />
          </div>
          {/* Orbiting dots */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-blue-400"
              style={{
                width: '80px',
                height: '80px',
                animation: `orbit${i} 3s linear infinite`,
                transformOrigin: 'center',
              }}
            />
          ))}
        </div>

        {/* Title */}
        <div className="text-center">
          <h1
            className="text-5xl font-black tracking-widest text-transparent bg-clip-text mb-2"
            style={{
              backgroundImage: 'linear-gradient(135deg, #00a2ff 0%, #7b61ff 50%, #00d4ff 100%)',
              textShadow: 'none',
              letterSpacing: '0.15em',
            }}
          >
            FAKE SHIELD
          </h1>
          <p className="text-blue-400/60 text-sm tracking-[0.3em] uppercase font-medium">
            AI · Intelligence · Security
          </p>
        </div>

        {/* Feature badges */}
        <div className="flex gap-4 flex-wrap justify-center">
          {[
            { icon: Brain, label: 'AI Analysis' },
            { icon: Globe, label: 'Threat Intel' },
            { icon: Lock, label: 'Bot Detection' },
            { icon: AlertTriangle, label: 'Real-time Alerts' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-blue-300/80"
              style={{
                background: 'rgba(0, 162, 255, 0.08)',
                border: '1px solid rgba(0, 162, 255, 0.2)',
              }}
            >
              <Icon className="w-3 h-3" />
              {label}
            </div>
          ))}
        </div>

        {/* Boot sequence log */}
        <div
          className="w-full rounded-xl p-4 font-mono text-xs"
          style={{
            background: 'rgba(0, 162, 255, 0.04)',
            border: '1px solid rgba(0, 162, 255, 0.15)',
          }}
        >
          {bootMessages.slice(0, currentMessage + 1).map((msg, i) => (
            <div
              key={i}
              className={`py-0.5 transition-opacity duration-300 ${
                i === currentMessage ? 'text-blue-300' : 'text-blue-500/40'
              }`}
            >
              <span className="text-blue-500/60 mr-2">{'>'}</span>
              {msg}
              {i === currentMessage && (
                <span
                  className="inline-block w-2 h-3.5 bg-blue-400 ml-1 align-middle"
                  style={{ animation: 'blink 1s step-end infinite' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="flex justify-between text-xs text-blue-400/50 mb-2 font-mono">
            <span>SYSTEM INITIALIZATION</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(0, 162, 255, 0.1)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #0066ff 0%, #00a2ff 50%, #00d4ff 100%)',
                boxShadow: '0 0 12px rgba(0, 162, 255, 0.8)',
              }}
            />
          </div>
        </div>

        {/* Version info */}
        <div className="text-center text-blue-500/30 text-xs font-mono tracking-widest">
          <span>FAKE SHIELD v1.0.0 — CLASSIFIED SYSTEM</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gridPan {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        @keyframes shieldPulse {
          0%, 100% { box-shadow: 0 0 60px rgba(0, 162, 255, 0.5), 0 0 120px rgba(0, 162, 255, 0.2); }
          50% { box-shadow: 0 0 80px rgba(0, 162, 255, 0.8), 0 0 160px rgba(0, 162, 255, 0.4); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
