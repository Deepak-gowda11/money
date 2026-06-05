'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Shield, Terminal, Network, Database,
  AlertTriangle, CheckCircle2, Activity,
  Zap, Globe, Bot, Brain, Server,
  TrendingUp, Eye, Bell, Settings, RefreshCw,
  ChevronRight, Wifi
} from 'lucide-react';

import IntroOverlay from '@/components/IntroOverlay';
import AlertCarousel from '@/components/AlertCarousel';
import NotificationToast, { Notification } from '@/components/NotificationToast';
import AnalysisTerminal from '@/components/AnalysisTerminal';
import NetworkHub from '@/components/NetworkHub';
import ThreatDatabase from '@/components/ThreatDatabase';
import { getDashboardStats, checkHealth, Alert as ApiAlert } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────
type TabId = 'analysis' | 'network' | 'threats';

interface BackendStatus {
  connected: boolean;
  geminiConfigured: boolean;
  alertCount: number;
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon: Icon, change }: {
  label: string;
  value: string | number;
  color: string;
  icon: React.ElementType;
  change?: string;
}) {
  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden hover-lift"
      style={{
        background: 'rgba(7,13,26,0.8)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Accent glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}
          >
            <Icon className="w-4.5 h-4.5" style={{ color }} />
          </div>
          {change && (
            <span className="text-xs font-mono" style={{ color }}>+{change}</span>
          )}
        </div>
        <div className="text-2xl font-black font-display" style={{ color }}>{value}</div>
        <div className="text-xs text-white/40 mt-1 font-medium">{label}</div>
      </div>
    </div>
  );
}

// ─── Tab Button ──────────────────────────────────────────────────────────────
function TabButton({ id, activeTab, label, icon: Icon, onClick, badge }: {
  id: TabId;
  activeTab: TabId;
  label: string;
  icon: React.ElementType;
  onClick: (id: TabId) => void;
  badge?: number;
}) {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative ${
        isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
      }`}
      style={
        isActive
          ? {
              background: 'rgba(14,165,233,0.12)',
              border: '1px solid rgba(14,165,233,0.3)',
              boxShadow: '0 0 24px rgba(14,165,233,0.12)',
            }
          : {
              background: 'transparent',
              border: '1px solid transparent',
            }
      }
    >
      <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : ''}`} />
      {label}
      {badge !== undefined && badge > 0 && (
        <span
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-black flex items-center justify-center"
          style={{ background: '#ef4444', fontSize: '9px' }}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
function Header({ status, notifCount }: { status: BackendStatus; notifCount: number }) {
  const now = new Date();
  const [time, setTime] = useState(now.toLocaleTimeString('en-US', { hour12: false }));

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour12: false })), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        background: 'rgba(2,4,9,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.3), rgba(124,58,237,0.3))',
            border: '1px solid rgba(14,165,233,0.4)',
            boxShadow: '0 0 20px rgba(14,165,233,0.25)',
          }}
        >
          <Shield className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <div className="text-sm font-black tracking-widest text-gradient-blue">FAKE SHIELD</div>
          <div className="text-xs text-white/30 tracking-widest font-mono">INTELLIGENCE SYSTEM</div>
        </div>
      </div>

      {/* Center — live status */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${status.connected ? 'bg-green-400' : 'bg-red-400'}`}
            style={{ animation: 'statusPulse 2s ease-in-out infinite' }}
          />
          <span className="text-xs text-white/40 font-mono">
            {status.connected ? 'API CONNECTED' : 'API OFFLINE'}
          </span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-1.5">
          <Brain className={`w-3.5 h-3.5 ${status.geminiConfigured ? 'text-purple-400' : 'text-white/20'}`} />
          <span className={`text-xs font-mono ${status.geminiConfigured ? 'text-purple-300/70' : 'text-white/25'}`}>
            {status.geminiConfigured ? 'GEMINI ACTIVE' : 'GEMINI UNCONFIGURED'}
          </span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <span className="text-xs text-white/30 font-mono">{time} UTC</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <Bell className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs font-bold text-red-300">{notifCount}</span>
        </div>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 transition-colors cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Settings className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('analysis');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    connected: false,
    geminiConfigured: false,
    alertCount: 0,
  });
  const [newAlerts, setNewAlerts] = useState<ApiAlert[]>([]);
  const notifIdCounter = useRef(0);

  // ── Load stats ─────────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data as unknown as Record<string, number>);
    } catch {}
  }, []);

  // ── Check backend health ───────────────────────────────────────────────────
  const checkBackend = useCallback(async () => {
    try {
      const health = await checkHealth();
      setBackendStatus(prev => ({
        ...prev,
        connected: true,
        geminiConfigured: health.gemini_configured,
      }));
    } catch {
      setBackendStatus(prev => ({ ...prev, connected: false }));
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadStats(), checkBackend()]);
    };
    init();
    const interval = setInterval(() => {
      loadStats();
      checkBackend();
    }, 10000);
    return () => clearInterval(interval);
  }, [loadStats, checkBackend]);

  // ── Notification system ────────────────────────────────────────────────────
  const addNotification = useCallback((
    severity: 'CRITICAL' | 'HIGH' | 'LOW',
    title: string,
    message: string,
    riskScore?: number,
  ) => {
    const id = `notif_${++notifIdCounter.current}_${Date.now()}`;
    const notif: Notification = {
      id,
      severity,
      title,
      message,
      timestamp: new Date(),
      riskScore,
    };
    setNotifications(prev => [notif, ...prev].slice(0, 5));
    setBackendStatus(prev => ({ ...prev, alertCount: prev.alertCount + 1 }));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // ── Analysis alert handler ─────────────────────────────────────────────────
  const handleAnalysisAlert = useCallback((
    severity: 'CRITICAL' | 'HIGH' | 'LOW',
    message: string,
    riskScore: number,
  ) => {
    const titles: Record<string, string> = {
      CRITICAL: '🚨 Critical Threat Detected',
      HIGH: '⚠️ High-Risk Content Flagged',
      LOW: 'ℹ️ Low-Level Alert',
    };
    addNotification(severity, titles[severity] || 'Threat Detected', message, riskScore);
  }, [addNotification]);

  // ── Tab config ─────────────────────────────────────────────────────────────
  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'analysis', label: 'Analysis Terminal', icon: Terminal },
    { id: 'network', label: 'Network Hub', icon: Network },
    { id: 'threats', label: 'Threat Database', icon: Database },
  ];

  return (
    <>
      {/* Cinematic intro */}
      {showIntro && <IntroOverlay onComplete={() => setShowIntro(false)} />}

      {/* Notification toasts */}
      <NotificationToast notifications={notifications} onDismiss={dismissNotification} />

      {/* Main layout */}
      <div className="min-h-screen bg-mesh">
        {/* Header */}
        <Header status={backendStatus} notifCount={notifications.length} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

          {/* ── Hero Banner ───────────────────────────────────────────────── */}
          <section
            className="relative rounded-2xl overflow-hidden p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(7,13,26,0.9) 0%, rgba(14,30,60,0.8) 100%)',
              border: '1px solid rgba(14,165,233,0.2)',
              boxShadow: '0 0 60px rgba(14,165,233,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #0ea5e9, transparent 70%)' }}
              />
              <div
                className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-8"
                style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }}
              />
              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: 'linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-green-300/70 font-mono uppercase tracking-widest">
                    System Operational
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-2">
                  <span className="text-gradient-blue">AI-Driven Intelligence</span>
                  <br />
                  <span className="text-white/90">for the Open Web</span>
                </h1>
                <p className="text-white/50 text-sm leading-relaxed max-w-lg">
                  Real-time fake news detection, cyber threat analysis, and social bot identification
                  powered by Gemini AI and behavioral graph analysis.
                </p>
              </div>

              {/* Quick stats summary */}
              <div className="flex flex-col gap-2 flex-none">
                {[
                  { label: 'Threats Tracked', value: stats.total_threats_tracked || 25, color: '#60a5fa' },
                  { label: 'Active Alerts', value: stats.alerts_today || 0, color: '#f87171' },
                  { label: 'Intelligence Score', value: `${stats.threat_intelligence_score || 94}%`, color: '#4ade80' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-white/35 text-right">{label}</div>
                    <div className="text-sm font-black font-mono" style={{ color }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Stats Grid ────────────────────────────────────────────────── */}
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Threats Tracked', value: stats.total_threats_tracked || 25, color: '#60a5fa', icon: Database },
                { label: 'Active Threats', value: stats.active_threats || 18, color: '#f87171', icon: AlertTriangle },
                { label: 'Alerts Today', value: stats.alerts_today || 0, color: '#fb923c', icon: Bell },
                { label: 'Domains Flagged', value: stats.domains_blacklisted || 20, color: '#a78bfa', icon: Globe },
                { label: 'Bot Networks', value: stats.bot_networks_identified || 2, color: '#34d399', icon: Bot },
                { label: 'Fake Reports', value: stats.fake_news_reports || 47, color: '#f472b6', icon: Eye },
              ].map(props => (
                <StatCard key={props.label} {...props} />
              ))}
            </div>
          </section>

          {/* ── Live Alert Carousel ────────────────────────────────────────── */}
          <section
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(7,13,26,0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <AlertCarousel externalAlerts={newAlerts} />
          </section>

          {/* ── Navigation Tabs ───────────────────────────────────────────── */}
          <section>
            <div className="flex gap-2 flex-wrap">
              {tabs.map(tab => (
                <TabButton
                  key={tab.id}
                  id={tab.id}
                  activeTab={activeTab}
                  label={tab.label}
                  icon={tab.icon}
                  onClick={setActiveTab}
                />
              ))}
            </div>
          </section>

          {/* ── Tab Content ───────────────────────────────────────────────── */}
          <section
            className="rounded-2xl p-6 tab-content"
            style={{
              background: 'rgba(7,13,26,0.7)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(20px)',
              minHeight: '500px',
            }}
            key={activeTab}
          >
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {activeTab === 'analysis' && (
                <>
                  <Terminal className="w-5 h-5 text-sky-400" />
                  <div>
                    <h2 className="text-base font-bold text-white">Analysis Terminal</h2>
                    <p className="text-xs text-white/40">Submit text, URLs, or usernames for AI-powered threat analysis</p>
                  </div>
                </>
              )}
              {activeTab === 'network' && (
                <>
                  <Network className="w-5 h-5 text-purple-400" />
                  <div>
                    <h2 className="text-base font-bold text-white">Network Investigation Hub</h2>
                    <p className="text-xs text-white/40">Visualize bot networks, coordinated activity, and propagation graphs</p>
                  </div>
                </>
              )}
              {activeTab === 'threats' && (
                <>
                  <Database className="w-5 h-5 text-orange-400" />
                  <div>
                    <h2 className="text-base font-bold text-white">Threat Intelligence Database</h2>
                    <p className="text-xs text-white/40">Browse flagged domains, fake news reports, and phishing indicators</p>
                  </div>
                </>
              )}
            </div>

            {/* Tab panels */}
            {activeTab === 'analysis' && (
              <AnalysisTerminal onAlertTriggered={handleAnalysisAlert} />
            )}
            {activeTab === 'network' && <NetworkHub />}
            {activeTab === 'threats' && <ThreatDatabase />}
          </section>

          {/* ── Footer ────────────────────────────────────────────────────── */}
          <footer className="pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/20 font-mono">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-sky-400/40" />
              <span>FAKE SHIELD v1.0.0 — AI INTELLIGENCE PLATFORM</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${backendStatus.connected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span>{backendStatus.connected ? 'Backend Online' : 'Backend Offline'}</span>
              </div>
              <span>·</span>
              <span>API: http://localhost:8000</span>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
