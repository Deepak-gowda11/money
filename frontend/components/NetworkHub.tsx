'use client';

import { useEffect, useState } from 'react';
import {
  Network, Bot, Users, AlertTriangle, Activity, TrendingUp,
  RefreshCw, Eye, Link2
} from 'lucide-react';
import { getNetworkData } from '@/lib/api';

interface NetworkNode {
  id: string;
  username: string;
  type: 'BOT' | 'SUSPICIOUS' | 'HUMAN';
  risk_score: number;
  posts_per_hour: number;
  followers: number;
  account_age_days: number;
  cluster: string;
}

interface NetworkStats {
  total_nodes: number;
  bot_count: number;
  suspicious_count: number;
  active_clusters: number;
  propagation_risk: number;
}

export default function NetworkHub() {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'BOT' | 'SUSPICIOUS'>('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getNetworkData() as any;
      setNodes(data.nodes || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredNodes = nodes.filter(n =>
    filterType === 'ALL' || n.type === filterType
  );

  const typeConfig = {
    BOT: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', label: 'Confirmed Bot' },
    SUSPICIOUS: { color: '#f97316', bg: 'rgba(234,88,12,0.12)', border: 'rgba(234,88,12,0.35)', label: 'Suspicious' },
    HUMAN: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', label: 'Human' },
  };

  const clusterColors: Record<string, string> = {
    'Alpha Network': '#ef4444',
    'Beta Network': '#f97316',
    'Unclassified': '#6b7280',
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Tracked Accounts', value: stats.total_nodes, color: '#60a5fa', icon: Users },
            { label: 'Confirmed Bots', value: stats.bot_count, color: '#ef4444', icon: Bot },
            { label: 'Suspicious', value: stats.suspicious_count, color: '#f97316', icon: AlertTriangle },
            { label: 'Active Clusters', value: stats.active_clusters, color: '#a855f7', icon: Network },
            { label: 'Propagation Risk', value: `${stats.propagation_risk}%`, color: '#f97316', icon: TrendingUp },
          ].map(({ label, value, color, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl p-3 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color }} />
              <div className="text-xl font-black font-mono" style={{ color }}>{value}</div>
              <div className="text-xs text-white/35 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Visual network graph placeholder / SVG */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(0,162,255,0.12)',
          minHeight: '220px',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Animated network visualization */}
          <svg width="100%" height="220" className="absolute inset-0">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Cluster Alpha */}
            {[
              [50, 80], [90, 50], [110, 100], [70, 130], [30, 120], [130, 70], [150, 110], [80, 155]
            ].map(([x, y], i) => (
              <g key={`a${i}`}>
                {i > 0 && (
                  <line x1={50} y1={80} x2={x} y2={y} stroke="rgba(239,68,68,0.25)" strokeWidth="1" />
                )}
                <circle cx={x} cy={y} r={i === 0 ? 12 : 7} fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth={i === 0 ? 2 : 1} filter="url(#glow)" />
                {i === 0 && <text x={x} y={y + 22} fill="rgba(239,68,68,0.7)" fontSize="9" textAnchor="middle" fontFamily="monospace">ALPHA</text>}
              </g>
            ))}
            {/* Cluster Beta (positioned on right) */}
            {[
              [280, 90], [250, 55], [310, 55], [330, 90], [260, 130], [310, 135]
            ].map(([x, y], i) => (
              <g key={`b${i}`}>
                {i > 0 && (
                  <line x1={280} y1={90} x2={x} y2={y} stroke="rgba(234,88,12,0.25)" strokeWidth="1" />
                )}
                <circle cx={x} cy={y} r={i === 0 ? 12 : 7} fill="rgba(234,88,12,0.2)" stroke="#f97316" strokeWidth={i === 0 ? 2 : 1} filter="url(#glow)" />
                {i === 0 && <text x={x} y={y + 22} fill="rgba(234,88,12,0.7)" fontSize="9" textAnchor="middle" fontFamily="monospace">BETA</text>}
              </g>
            ))}
            {/* Cross-cluster connection */}
            <line x1={150} y1={80} x2={250} y2={90} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4,4" />
            {/* Suspicious nodes */}
            {[[200, 160], [190, 50], [220, 90], [170, 120]].map(([x, y], i) => (
              <circle key={`s${i}`} cx={x} cy={y} r={6} fill="rgba(234,88,12,0.15)" stroke="#f97316" strokeWidth="1" opacity={0.6} />
            ))}
          </svg>
          <div className="relative z-10 text-center">
            <Network className="w-8 h-8 text-blue-400/30 mx-auto mb-2" />
            <p className="text-white/20 text-xs font-mono">BEHAVIORAL GRAPH NETWORK</p>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex gap-3">
          {Object.entries(typeConfig).map(([type, cfg]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
              <span className="text-xs text-white/40">{type}</span>
            </div>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={load}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-white/40 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/30 uppercase tracking-wider">Filter:</span>
        {(['ALL', 'BOT', 'SUSPICIOUS'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`text-xs px-3 py-1 rounded-full border transition-all duration-200 ${
              filterType === f
                ? 'text-white'
                : 'text-white/40 border-white/10 hover:text-white/60'
            }`}
            style={
              filterType === f
                ? {
                    background: f === 'BOT' ? 'rgba(239,68,68,0.2)' : f === 'SUSPICIOUS' ? 'rgba(234,88,12,0.2)' : 'rgba(0,162,255,0.2)',
                    borderColor: f === 'BOT' ? 'rgba(239,68,68,0.5)' : f === 'SUSPICIOUS' ? 'rgba(234,88,12,0.5)' : 'rgba(0,162,255,0.5)',
                  }
                : {}
            }
          >
            {f}
          </button>
        ))}
      </div>

      {/* Node data grid */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))
        ) : (
          filteredNodes.map(node => {
            const cfg = typeConfig[node.type];
            const clusterColor = clusterColors[node.cluster] || '#6b7280';
            return (
              <div
                key={node.id}
                className="rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                style={{
                  background: selectedNode?.id === node.id ? cfg.bg : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selectedNode?.id === node.id ? cfg.border : 'rgba(255,255,255,0.06)'}`,
                }}
                onClick={() => setSelectedNode(n => n?.id === node.id ? null : node)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-none"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                    >
                      <Bot className="w-4 h-4" style={{ color: cfg.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white/80 font-mono">@{node.username}</span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-md border"
                          style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                        >
                          {node.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-white/30">{node.posts_per_hour} posts/hr</span>
                        <span className="text-xs text-white/30">{node.followers} followers</span>
                        <span className="text-xs text-white/30">{node.account_age_days}d old</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-none">
                    <div className="text-sm font-bold font-mono" style={{ color: node.risk_score >= 80 ? '#ef4444' : node.risk_score >= 60 ? '#f97316' : '#eab308' }}>
                      {node.risk_score}
                    </div>
                    <div className="text-xs text-white/25">risk</div>
                    <div className="text-xs mt-1 font-mono" style={{ color: clusterColor }}>
                      {node.cluster}
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {selectedNode?.id === node.id && (
                  <div className="mt-3 pt-3 border-t border-white/08 grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-white/30">Posts/Hour</span>
                      <p className="text-white/70 font-mono">{node.posts_per_hour}</p>
                    </div>
                    <div>
                      <span className="text-white/30">Account Age</span>
                      <p className="text-white/70 font-mono">{node.account_age_days} days</p>
                    </div>
                    <div>
                      <span className="text-white/30">Followers</span>
                      <p className="text-white/70 font-mono">{node.followers}</p>
                    </div>
                    <div>
                      <span className="text-white/30">Cluster</span>
                      <p className="font-mono" style={{ color: clusterColor }}>{node.cluster}</p>
                    </div>
                    <div>
                      <span className="text-white/30">Node ID</span>
                      <p className="text-white/40 font-mono text-xs">{node.id}</p>
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
