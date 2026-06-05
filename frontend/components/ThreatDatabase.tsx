'use client';

import { useEffect, useState } from 'react';
import {
  Database, AlertTriangle, RefreshCw, Search, Filter,
  ExternalLink, Calendar, FileWarning, TrendingUp, Shield
} from 'lucide-react';
import { getThreatDatabase, ThreatEntry } from '@/lib/api';

export default function ThreatDatabase() {
  const [entries, setEntries] = useState<ThreatEntry[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getThreatDatabase({ limit: 50 });
      setEntries(data.entries);
      setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = entries.filter(e => {
    const matchSearch = !searchTerm ||
      e.indicator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSeverity = severityFilter === 'ALL' || e.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  const severityConfig = {
    CRITICAL: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', color: '#ef4444', dot: 'bg-red-400' },
    HIGH: { bg: 'rgba(234,88,12,0.10)', border: 'rgba(234,88,12,0.3)', color: '#f97316', dot: 'bg-orange-400' },
    MEDIUM: { bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.25)', color: '#eab308', dot: 'bg-yellow-400' },
  };

  const statusConfig = {
    Active: { color: '#ef4444', dot: 'bg-red-400', label: 'ACTIVE' },
    Monitoring: { color: '#f97316', dot: 'bg-orange-400', label: 'MONITORING' },
    Contained: { color: '#22c55e', dot: 'bg-green-400', label: 'CONTAINED' },
  };

  return (
    <div className="space-y-6">
      {/* Stats banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Threats', value: entries.length, color: '#60a5fa', icon: Database },
          { label: 'Critical', value: stats.critical_count || 0, color: '#ef4444', icon: AlertTriangle },
          { label: 'High', value: stats.high_count || 0, color: '#f97316', icon: TrendingUp },
          { label: 'Active', value: stats.active_count || 0, color: '#22c55e', icon: Shield },
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl p-3 flex items-center gap-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-none"
              style={{ background: `${color}18`, border: `1px solid ${color}30` }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <div className="text-lg font-black font-mono" style={{ color }}>{value}</div>
              <div className="text-xs text-white/35">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter bar */}
      <div className="flex gap-3">
        <div
          className="flex-1 flex items-center gap-2 px-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Search className="w-4 h-4 text-white/30 flex-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search domains, types, targets..."
            className="flex-1 bg-transparent text-white/70 text-sm placeholder-white/20 outline-none py-2.5"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-white/30 hover:text-white/60 text-xs">✕</button>
          )}
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                severityFilter === sev ? 'text-white font-bold' : 'text-white/40 hover:text-white/60'
              }`}
              style={
                severityFilter === sev
                  ? {
                      background: sev === 'CRITICAL' ? 'rgba(239,68,68,0.2)' : sev === 'HIGH' ? 'rgba(234,88,12,0.2)' : sev === 'MEDIUM' ? 'rgba(234,179,8,0.15)' : 'rgba(0,162,255,0.2)',
                    }
                  : {}
              }
            >
              {sev}
            </button>
          ))}
        </div>
        <button onClick={load} className="p-2.5 rounded-xl hover:bg-white/05 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <RefreshCw className={`w-4 h-4 text-white/40 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Results count */}
      <div className="text-xs text-white/30 font-mono">
        Showing {filtered.length} of {entries.length} threat indicators
      </div>

      {/* Threat entries */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <FileWarning className="w-8 h-8 text-white/15 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No threats match your filters</p>
          </div>
        ) : (
          filtered.map(entry => {
            const sev = severityConfig[entry.severity as keyof typeof severityConfig] || severityConfig.MEDIUM;
            const status = statusConfig[entry.status as keyof typeof statusConfig] || statusConfig.Monitoring;
            const isExpanded = expandedId === entry.id;

            return (
              <div
                key={entry.id}
                className="rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  background: isExpanded ? sev.bg : 'rgba(255,255,255,0.025)',
                  border: `1px solid ${isExpanded ? sev.border : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                {/* Main row */}
                <div
                  className="flex items-center gap-3 p-3.5 cursor-pointer hover:bg-white/02 transition-colors"
                  onClick={() => setExpandedId(p => p === entry.id ? null : entry.id)}
                >
                  {/* Severity indicator */}
                  <div className={`w-1.5 h-1.5 rounded-full flex-none ${sev.dot.replace('rgba', 'bg')} `} style={{ background: sev.color }} />

                  {/* Domain/indicator */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white/80 font-mono truncate">{entry.indicator}</span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded border flex-none"
                        style={{ background: sev.bg, color: sev.color, borderColor: sev.border }}
                      >
                        {entry.severity}
                      </span>
                    </div>
                    <div className="text-xs text-white/35 mt-0.5">
                      {entry.type} · {entry.target}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-1.5 flex-none">
                    <div className={`w-1.5 h-1.5 rounded-full ${entry.status === 'Active' ? 'animate-pulse' : ''}`} style={{ background: status.color }} />
                    <span className="text-xs font-mono" style={{ color: status.color }}>{status.label}</span>
                  </div>

                  {/* Risk score */}
                  <div className="flex-none text-right w-12">
                    <div className="text-base font-black font-mono" style={{ color: sev.color }}>{entry.risk_score}</div>
                    <div className="text-xs text-white/25">score</div>
                  </div>
                </div>

                {/* Expanded view */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs" style={{ borderTop: `1px solid ${sev.border}22` }}>
                    <div>
                      <span className="text-white/30 uppercase tracking-wider">First Seen</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-white/30" />
                        <span className="text-white/60 font-mono">{entry.first_seen}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-white/30 uppercase tracking-wider">Last Seen</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-white/30" />
                        <span className="text-white/60 font-mono">{entry.last_seen}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-white/30 uppercase tracking-wider">Reports</span>
                      <div className="flex items-center gap-1 mt-1">
                        <FileWarning className="w-3 h-3 text-white/30" />
                        <span className="text-white/60 font-mono">{entry.reports.toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-white/30 uppercase tracking-wider">Risk Bar</span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${entry.risk_score}%`, background: sev.color }}
                          />
                        </div>
                        <span className="font-mono" style={{ color: sev.color }}>{entry.risk_score}</span>
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-4">
                      <span className="text-white/30 uppercase tracking-wider">Threat ID</span>
                      <span className="ml-2 text-white/25 font-mono">{entry.id}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
