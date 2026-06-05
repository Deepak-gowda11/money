'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, AlertTriangle, Zap, Shield, ChevronRight } from 'lucide-react';

export interface Notification {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'LOW';
  title: string;
  message: string;
  timestamp: Date;
  riskScore?: number;
}

interface NotificationToastProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const severityConfig = {
  CRITICAL: {
    bg: 'rgba(127, 0, 0, 0.95)',
    border: 'rgba(239, 68, 68, 0.8)',
    accent: '#ef4444',
    icon: AlertTriangle,
    iconBg: 'rgba(239, 68, 68, 0.2)',
    label: 'CRITICAL THREAT',
    glow: '0 0 40px rgba(239, 68, 68, 0.5), 0 8px 32px rgba(0,0,0,0.6)',
    barColor: '#ef4444',
  },
  HIGH: {
    bg: 'rgba(100, 40, 0, 0.95)',
    border: 'rgba(234, 88, 12, 0.8)',
    accent: '#f97316',
    icon: Zap,
    iconBg: 'rgba(234, 88, 12, 0.2)',
    label: 'HIGH ALERT',
    glow: '0 0 30px rgba(234, 88, 12, 0.4), 0 8px 32px rgba(0,0,0,0.6)',
    barColor: '#f97316',
  },
  LOW: {
    bg: 'rgba(10, 30, 80, 0.95)',
    border: 'rgba(59, 130, 246, 0.6)',
    accent: '#3b82f6',
    icon: Shield,
    iconBg: 'rgba(59, 130, 246, 0.15)',
    label: 'NOTICE',
    glow: '0 0 20px rgba(59, 130, 246, 0.3), 0 8px 32px rgba(0,0,0,0.5)',
    barColor: '#3b82f6',
  },
};

function ToastItem({ notification, onDismiss }: { notification: Notification; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(100);
  const config = severityConfig[notification.severity];
  const Icon = config.icon;

  const autoDismissDuration = notification.severity === 'CRITICAL' ? 8000 : notification.severity === 'HIGH' ? 6000 : 4500;

  useEffect(() => {
    // Mount animation
    requestAnimationFrame(() => setVisible(true));

    // Progress bar countdown
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p - (100 / (autoDismissDuration / 100));
        return next <= 0 ? 0 : next;
      });
    }, 100);

    // Auto-dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, autoDismissDuration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const handleDismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onDismiss(notification.id), 350);
  }, [notification.id, onDismiss]);

  return (
    <div
      className="relative overflow-hidden rounded-xl cursor-pointer w-96 max-w-full"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        boxShadow: config.glow,
        backdropFilter: 'blur(20px)',
        transform: visible && !leaving ? 'translateX(0) scale(1)' : leaving ? 'translateX(120%) scale(0.95)' : 'translateX(120%) scale(0.95)',
        opacity: visible && !leaving ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease',
      }}
      onClick={handleDismiss}
    >
      {/* Severity stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ background: `linear-gradient(180deg, ${config.accent}, ${config.accent}88)` }}
      />

      <div className="pl-4 pr-4 pt-3 pb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-none"
              style={{ background: config.iconBg }}
            >
              <Icon className="w-4 h-4" style={{ color: config.accent }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-xs font-black tracking-widest"
                  style={{ color: config.accent }}
                >
                  {config.label}
                </span>
                {notification.severity === 'CRITICAL' && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: config.accent, animation: 'pulse 1s infinite' }}
                  />
                )}
              </div>
              <span className="text-white/30 text-xs font-mono">
                {notification.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
          <button
            className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors"
            onClick={e => { e.stopPropagation(); handleDismiss(); }}
          >
            <X className="w-3.5 h-3.5 text-white/40" />
          </button>
        </div>

        {/* Title */}
        <h4 className="text-white text-sm font-bold mb-1 pr-2 leading-tight">
          {notification.title}
        </h4>

        {/* Message */}
        <p className="text-white/60 text-xs leading-relaxed mb-2">
          {notification.message}
        </p>

        {/* Risk score if present */}
        {notification.riskScore !== undefined && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/40 text-xs">Risk Score:</span>
            <span className="font-bold text-xs font-mono" style={{ color: config.accent }}>
              {notification.riskScore}/100
            </span>
          </div>
        )}
      </div>

      {/* Progress bar (auto-dismiss countdown) */}
      <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full transition-all duration-100"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${config.barColor}44, ${config.barColor})`,
          }}
        />
      </div>
    </div>
  );
}

export default function NotificationToast({ notifications, onDismiss }: NotificationToastProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[1000] flex flex-col gap-3 items-end pointer-events-none">
      {notifications.map(n => (
        <div key={n.id} className="pointer-events-auto">
          <ToastItem notification={n} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
