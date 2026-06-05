'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle, Shield, Globe, Bot, Zap, Activity, X } from 'lucide-react';
import { Alert, getAlerts } from '@/lib/api';

interface AlertCarouselProps {
  externalAlerts?: Alert[];
}

const severityConfig = {
  CRITICAL: {
    bg: 'rgba(220, 38, 38, 0.15)',
    border: 'rgba(220, 38, 38, 0.5)',
    badge: 'bg-red-500/20 text-red-300 border-red-500/40',
    dot: 'bg-red-400',
    icon: AlertTriangle,
    glow: 'rgba(220, 38, 38, 0.3)',
  },
  HIGH: {
    bg: 'rgba(234, 88, 12, 0.12)',
    border: 'rgba(234, 88, 12, 0.4)',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    dot: 'bg-orange-400',
    icon: Zap,
    glow: 'rgba(234, 88, 12, 0.25)',
  },
  LOW: {
    bg: 'rgba(59, 130, 246, 0.10)',
    border: 'rgba(59, 130, 246, 0.3)',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    dot: 'bg-blue-400',
    icon: Shield,
    glow: 'rgba(59, 130, 246, 0.15)',
  },
};

const typeIcons: Record<string, typeof Shield> = {
  FAKE_NEWS: Activity,
  PHISHING: Globe,
  BOT_NETWORK: Bot,
  CYBER_THREAT: AlertTriangle,
  DISINFORMATION: Shield,
  USER_ANALYSIS: Activity,
};

function AlertCard({ alert }: { alert: Alert }) {
  const config = severityConfig[alert.severity] || severityConfig.LOW;
  const TypeIcon = typeIcons[alert.type] || Shield;
  const SeverityIcon = config.icon;

  const timeStr = new Date(alert.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      className="flex-none w-80 rounded-xl p-4 cursor-pointer select-none transition-all duration-200 hover:scale-[1.02]"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        boxShadow: `0 4px 24px ${config.glow}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-none"
            style={{ background: config.bg, border: `1px solid ${config.border}` }}
          >
            <TypeIcon className="w-4 h-4" style={{ color: config.border.replace('0.', '1').replace('rgba(', 'rgb(').replace(', 0.', ', ').replace(')', ')') }} />
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${config.badge}`}>
            {alert.severity}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
          <span className="text-xs text-white/30 font-mono">{timeStr}</span>
        </div>
      </div>

      {/* Message */}
      <p className="text-white/80 text-xs leading-relaxed mb-3 line-clamp-3">
        {alert.message}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-white/30 text-xs font-mono">{alert.source}</span>
        <div className="flex items-center gap-1">
          <span className="text-white/40 text-xs">Risk:</span>
          <span
            className="text-xs font-bold font-mono"
            style={{ color: alert.risk_score >= 85 ? '#f87171' : alert.risk_score >= 65 ? '#fb923c' : '#60a5fa' }}
          >
            {alert.risk_score}
          </span>
        </div>
      </div>

      {/* Risk bar */}
      <div className="mt-2 w-full h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${alert.risk_score}%`,
            background: alert.risk_score >= 85
              ? 'linear-gradient(90deg, #ef4444, #f87171)'
              : alert.risk_score >= 65
              ? 'linear-gradient(90deg, #ea580c, #fb923c)'
              : 'linear-gradient(90deg, #2563eb, #60a5fa)',
          }}
        />
      </div>
    </div>
  );
}

export default function AlertCarousel({ externalAlerts = [] }: AlertCarouselProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const posRef = useRef(0);
  const speedRef = useRef(0.6);

  // Load initial alerts
  useEffect(() => {
    getAlerts(50).then(data => {
      setAlerts(data.alerts || []);
    }).catch(() => {});
  }, []);

  // Merge external alerts (from analysis)
  useEffect(() => {
    if (externalAlerts.length > 0) {
      setAlerts(prev => [...externalAlerts, ...prev].slice(0, 80));
    }
  }, [externalAlerts]);

  // Poll for new alerts every 3 seconds
  useEffect(() => {
    const poll = setInterval(() => {
      getAlerts(50).then(data => {
        setAlerts(data.alerts || []);
      }).catch(() => {});
    }, 3000);
    return () => clearInterval(poll);
  }, []);

  // Auto-scroll animation
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const animate = () => {
      if (!isPaused && el) {
        posRef.current += speedRef.current;
        const maxScroll = el.scrollWidth / 2;
        if (posRef.current >= maxScroll) {
          posRef.current = 0;
        }
        el.scrollLeft = posRef.current;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPaused]);

  // Duplicate alerts for seamless loop
  const displayAlerts = alerts.length > 0 ? [...alerts, ...alerts] : [];

  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-blue-300/70 uppercase tracking-widest font-medium">
            Live Threat Feed
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        </div>
        <button
          onClick={() => setIsPaused(p => !p)}
          className="text-xs text-white/30 hover:text-white/60 transition-colors px-2 py-1 rounded"
        >
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        {/* Edge fades */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, rgba(2,6,23,1) 0%, transparent 100%)' }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(-90deg, rgba(2,6,23,1) 0%, transparent 100%)' }}
        />

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-hidden"
          style={{ scrollBehavior: 'auto' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {displayAlerts.length > 0 ? (
            displayAlerts.map((alert, i) => (
              <AlertCard key={`${alert.id}-${i}`} alert={alert} />
            ))
          ) : (
            // Skeleton loader
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex-none w-80 h-36 rounded-xl animate-pulse"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
