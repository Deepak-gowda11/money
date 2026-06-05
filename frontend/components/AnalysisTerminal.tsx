'use client';

import { useState, useCallback } from 'react';
import {
  Terminal, Globe, Bot, FileText, Loader2, CheckCircle2,
  AlertTriangle, XCircle, ChevronDown, ChevronUp, Zap, Shield
} from 'lucide-react';
import { analyzeContent, AnalysisResult } from '@/lib/api';

interface AnalysisTerminalProps {
  onAlertTriggered?: (severity: 'CRITICAL' | 'HIGH' | 'LOW', message: string, riskScore: number) => void;
}

type InputMode = 'text' | 'url' | 'username';

const modeConfig = {
  text: { icon: FileText, label: 'Text / Article', placeholder: 'Paste news content, social media post, or any text to verify...' },
  url: { icon: Globe, label: 'URL / Domain', placeholder: 'https://example.com or domain.com' },
  username: { icon: Bot, label: 'Social Username', placeholder: '@username or social handle' },
};

function RiskBar({ score }: { score: number }) {
  const color = score >= 80 ? '#ef4444' : score >= 60 ? '#f97316' : score >= 35 ? '#eab308' : '#22c55e';
  const label = score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 35 ? 'MEDIUM' : 'LOW';
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/40">Risk Score</span>
        <span className="text-xs font-bold font-mono" style={{ color }}>
          {score}/100 — {label}
        </span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, ${color}66, ${color})`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}

function ClassificationBadge({ classification }: { classification: string }) {
  const configs: Record<string, { bg: string; text: string; border: string }> = {
    FAKE: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', border: 'rgba(239,68,68,0.4)' },
    REAL: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', border: 'rgba(34,197,94,0.4)' },
    MALICIOUS: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', border: 'rgba(239,68,68,0.4)' },
    SUSPICIOUS: { bg: 'rgba(234,88,12,0.15)', text: '#f97316', border: 'rgba(234,88,12,0.4)' },
    LOW_RISK: { bg: 'rgba(234,179,8,0.15)', text: '#eab308', border: 'rgba(234,179,8,0.4)' },
    SAFE: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', border: 'rgba(34,197,94,0.4)' },
    BOT: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', border: 'rgba(239,68,68,0.4)' },
    HUMAN: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', border: 'rgba(34,197,94,0.4)' },
    LIKELY_HUMAN: { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.3)' },
    ERROR: { bg: 'rgba(100,100,100,0.15)', text: '#9ca3af', border: 'rgba(100,100,100,0.4)' },
  };
  const cfg = configs[classification] || configs.ERROR;
  return (
    <span
      className="text-xs font-black tracking-widest px-2.5 py-1 rounded-lg border"
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      {classification}
    </span>
  );
}

function ResultSection({ result }: { result: AnalysisResult }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(p => p === section ? null : section);
  };

  const threatColor = {
    SAFE: '#22c55e', LOW: '#84cc16', MEDIUM: '#eab308',
    HIGH: '#f97316', CRITICAL: '#ef4444', UNKNOWN: '#6b7280',
  }[result.overall_threat_level] || '#6b7280';

  return (
    <div className="space-y-4 mt-4">
      {/* Overall summary */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'rgba(0, 162, 255, 0.06)',
          border: '1px solid rgba(0, 162, 255, 0.15)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-white">Overall Assessment</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Threat Level:</span>
            <span className="text-sm font-black tracking-widest" style={{ color: threatColor }}>
              {result.overall_threat_level}
            </span>
          </div>
        </div>
        <RiskBar score={result.overall_risk_score} />
        <p className="text-xs text-white/50 mt-2 font-mono">{result.summary}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {result.modules_executed.map(mod => (
            <span key={mod} className="text-xs px-2 py-0.5 rounded-full text-blue-300/60 bg-blue-500/10 border border-blue-500/20">
              {mod.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Fake News Result */}
      {result.results.fake_news && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <button
            className="w-full flex items-center justify-between p-4 text-left"
            style={{ background: 'rgba(255,255,255,0.03)' }}
            onClick={() => toggleSection('fake_news')}
          >
            <div className="flex items-center gap-2">
              <BrainIcon className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-white">Fake News Analysis</span>
              <ClassificationBadge classification={result.results.fake_news.classification} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 font-mono">
                {result.results.fake_news.confidence}% confidence
              </span>
              {expandedSection === 'fake_news' ? (
                <ChevronUp className="w-4 h-4 text-white/30" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/30" />
              )}
            </div>
          </button>
          {expandedSection === 'fake_news' && (
            <div className="p-4 pt-0 space-y-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <RiskBar score={result.results.fake_news.classification === 'FAKE' ? result.results.fake_news.confidence : 100 - result.results.fake_news.confidence} />
              <div>
                <p className="text-xs text-white/40 mb-1 uppercase tracking-wider">Verdict</p>
                <p className="text-sm text-white/80">{result.results.fake_news.verdict_summary}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1 uppercase tracking-wider">Reasoning</p>
                <p className="text-xs text-white/60 leading-relaxed">{result.results.fake_news.reasoning}</p>
              </div>
              {result.results.fake_news.red_flags.length > 0 && (
                <div>
                  <p className="text-xs text-red-400/70 mb-1.5 uppercase tracking-wider">Red Flags</p>
                  <ul className="space-y-1">
                    {result.results.fake_news.red_flags.map((flag, i) => (
                      <li key={i} className="text-xs text-red-300/70 flex items-start gap-1.5">
                        <AlertTriangle className="w-3 h-3 flex-none mt-0.5 text-red-400" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.results.fake_news.semantic_indicators.length > 0 && (
                <div>
                  <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wider">Semantic Indicators</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.results.fake_news.semantic_indicators.map((ind, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-md text-purple-300/70 bg-purple-500/10 border border-purple-500/20">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-white/25 font-mono">Analyzed by: {result.results.fake_news.analyzed_by}</p>
            </div>
          )}
        </div>
      )}

      {/* Cyber Threat Result */}
      {result.results.cyber_threat && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <button
            className="w-full flex items-center justify-between p-4 text-left"
            style={{ background: 'rgba(255,255,255,0.03)' }}
            onClick={() => toggleSection('cyber_threat')}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-white">URL Threat Analysis</span>
              <ClassificationBadge classification={result.results.cyber_threat.classification} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 font-mono">
                Score: {result.results.cyber_threat.risk_score}
              </span>
              {expandedSection === 'cyber_threat' ? (
                <ChevronUp className="w-4 h-4 text-white/30" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/30" />
              )}
            </div>
          </button>
          {expandedSection === 'cyber_threat' && (
            <div className="p-4 pt-0 space-y-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <RiskBar score={result.results.cyber_threat.risk_score} />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-white/30">Domain</span>
                  <p className="text-white/70 font-mono">{result.results.cyber_threat.domain}</p>
                </div>
                <div>
                  <span className="text-white/30">Protocol</span>
                  <p className="text-white/70 font-mono">{result.results.cyber_threat.protocol?.toUpperCase()}</p>
                </div>
                {result.results.cyber_threat.threat_type && (
                  <div>
                    <span className="text-white/30">Threat Type</span>
                    <p className="text-orange-300/80">{result.results.cyber_threat.threat_type}</p>
                  </div>
                )}
                <div>
                  <span className="text-white/30">Known Malicious</span>
                  <p className={result.results.cyber_threat.is_known_malicious ? 'text-red-400' : 'text-green-400'}>
                    {result.results.cyber_threat.is_known_malicious ? 'YES' : 'NO'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wider">Threat Indicators</p>
                <ul className="space-y-1">
                  {result.results.cyber_threat.threat_indicators.map((ind, i) => (
                    <li key={i} className="text-xs text-white/60 flex items-start gap-1.5">
                      <span className="text-orange-400 flex-none">•</span>
                      {ind}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wider">Recommendations</p>
                <ul className="space-y-1">
                  {result.results.cyber_threat.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-blue-300/70 flex items-start gap-1.5">
                      <span className="text-blue-400 flex-none">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bot Detection Result */}
      {result.results.bot_detection && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <button
            className="w-full flex items-center justify-between p-4 text-left"
            style={{ background: 'rgba(255,255,255,0.03)' }}
            onClick={() => toggleSection('bot_detection')}
          >
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">Bot Detection</span>
              <ClassificationBadge classification={result.results.bot_detection.classification} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 font-mono">
                {result.results.bot_detection.confidence}% confidence
              </span>
              {expandedSection === 'bot_detection' ? (
                <ChevronUp className="w-4 h-4 text-white/30" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/30" />
              )}
            </div>
          </button>
          {expandedSection === 'bot_detection' && (
            <div className="p-4 pt-0 space-y-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <RiskBar score={result.results.bot_detection.risk_score} />
              
              {/* Behavioral scores */}
              <div>
                <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Behavioral Scores</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {Object.entries(result.results.bot_detection.behavioral_scores).map(([key, score]) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-white/40 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-white/60 font-mono">{score}</span>
                      </div>
                      <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${score}%`,
                            background: score >= 70 ? '#ef4444' : score >= 50 ? '#f97316' : '#22c55e',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {result.results.bot_detection.bot_indicators.length > 0 && (
                <div>
                  <p className="text-xs text-red-400/70 mb-1.5 uppercase tracking-wider">Bot Indicators</p>
                  <ul className="space-y-1">
                    {result.results.bot_detection.bot_indicators.map((ind, i) => (
                      <li key={i} className="text-xs text-red-300/70 flex items-start gap-1.5">
                        <AlertTriangle className="w-3 h-3 flex-none mt-0.5 text-red-400" />
                        {ind}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.results.bot_detection.human_indicators.length > 0 && (
                <div>
                  <p className="text-xs text-green-400/70 mb-1.5 uppercase tracking-wider">Human Indicators</p>
                  <ul className="space-y-1">
                    {result.results.bot_detection.human_indicators.map((ind, i) => (
                      <li key={i} className="text-xs text-green-300/70 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 flex-none mt-0.5 text-green-400" />
                        {ind}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Network analysis */}
              {result.results.bot_detection.network_analysis && (
                <div>
                  <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wider">Network Analysis</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-white/30">Cluster</span>
                      <p className="text-white/60">{String(result.results.bot_detection.network_analysis.network_cluster || 'N/A')}</p>
                    </div>
                    <div>
                      <span className="text-white/30">Propagation Risk</span>
                      <p className={result.results.bot_detection.network_analysis.propagation_risk === 'HIGH' ? 'text-red-400' : 'text-green-400'}>
                        {String(result.results.bot_detection.network_analysis.propagation_risk || 'LOW')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21a48.31 48.31 0 01-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  );
}

export default function AnalysisTerminal({ onAlertTriggered }: AnalysisTerminalProps) {
  const [mode, setMode] = useState<InputMode>('text');
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisTime, setAnalysisTime] = useState<number | null>(null);

  const getCurrentInput = () => {
    if (mode === 'text') return inputText;
    if (mode === 'url') return inputUrl;
    return inputUsername;
  };

  const setCurrentInput = (value: string) => {
    if (mode === 'text') setInputText(value);
    else if (mode === 'url') setInputUrl(value);
    else setInputUsername(value);
  };

  const handleAnalyze = useCallback(async () => {
    const input = getCurrentInput().trim();
    if (!input) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const startTime = Date.now();

    try {
      const request: Record<string, string> = {};
      if (mode === 'text') request.text = input;
      else if (mode === 'url') request.url = input;
      else request.username = input;

      const data = await analyzeContent(request);
      setResult(data);
      setAnalysisTime(Date.now() - startTime);

      // Trigger notification if threat detected
      if (data.alert_triggered && onAlertTriggered && data.alert_severity) {
        onAlertTriggered(
          data.alert_severity as 'CRITICAL' | 'HIGH' | 'LOW',
          data.summary,
          data.overall_risk_score,
        );
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Is the backend running?');
    } finally {
      setIsAnalyzing(false);
    }
  }, [mode, inputText, inputUrl, inputUsername, onAlertTriggered]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && mode !== 'text') {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const config = modeConfig[mode];
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {(Object.entries(modeConfig) as [InputMode, typeof modeConfig.text][]).map(([key, cfg]) => {
          const ModeIcon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => { setMode(key); setResult(null); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === key ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
              style={
                mode === key
                  ? { background: 'rgba(0,162,255,0.15)', boxShadow: '0 0 20px rgba(0,162,255,0.15)', border: '1px solid rgba(0,162,255,0.3)', color: '#60a5fa' }
                  : {}
              }
            >
              <ModeIcon className="w-4 h-4" />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Input area */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(0,162,255,0.2)', boxShadow: '0 0 30px rgba(0,162,255,0.05)' }}
      >
        {/* Top bar */}
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{ background: 'rgba(0,162,255,0.06)', borderBottom: '1px solid rgba(0,162,255,0.1)' }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          <span className="ml-2 text-xs text-blue-300/50 font-mono">
            FAKE SHIELD :: {mode.toUpperCase()} ANALYSIS TERMINAL
          </span>
        </div>

        {mode === 'text' ? (
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={config.placeholder}
            rows={5}
            className="w-full bg-transparent text-white/80 text-sm placeholder-white/20 resize-none outline-none px-4 py-3 font-mono"
            style={{ background: 'rgba(0,0,0,0.2)' }}
          />
        ) : (
          <input
            type="text"
            value={mode === 'url' ? inputUrl : inputUsername}
            onChange={e => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={config.placeholder}
            className="w-full bg-transparent text-white/80 text-sm placeholder-white/20 outline-none px-4 py-4 font-mono"
            style={{ background: 'rgba(0,0,0,0.2)' }}
          />
        )}

        {/* Character count for text mode */}
        {mode === 'text' && inputText && (
          <div className="absolute bottom-2 right-3 text-xs text-white/20 font-mono">
            {inputText.length} chars
          </div>
        )}
      </div>

      {/* Quick test examples */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-white/30">Quick test:</span>
        {mode === 'text' && [
          { label: '⚠️ Fake', val: 'Scientists confirm that drinking bleach cures COVID-19! The government is hiding this miracle cure!' },
          { label: '✅ Real', val: 'A new peer-reviewed study published in Nature found that exercise reduces cardiovascular risk by 35%.' },
        ].map(({ label, val }) => (
          <button key={label} onClick={() => setInputText(val)} className="text-xs px-2 py-1 rounded-md text-blue-300/60 bg-blue-500/10 hover:bg-blue-500/20 transition-colors border border-blue-500/20">
            {label}
          </button>
        ))}
        {mode === 'url' && [
          { label: '🔴 Phishing', val: 'https://paypa1.com/login-secure-verify' },
          { label: '🟢 Safe', val: 'https://google.com' },
        ].map(({ label, val }) => (
          <button key={label} onClick={() => setInputUrl(val)} className="text-xs px-2 py-1 rounded-md text-blue-300/60 bg-blue-500/10 hover:bg-blue-500/20 transition-colors border border-blue-500/20">
            {label}
          </button>
        ))}
        {mode === 'username' && [
          { label: '🤖 Bot', val: 'news_bot_3847' },
          { label: '👤 Human', val: 'john_doe_2024' },
        ].map(({ label, val }) => (
          <button key={label} onClick={() => setInputUsername(val)} className="text-xs px-2 py-1 rounded-md text-blue-300/60 bg-blue-500/10 hover:bg-blue-500/20 transition-colors border border-blue-500/20">
            {label}
          </button>
        ))}
      </div>

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || !getCurrentInput().trim()}
        className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          background: isAnalyzing
            ? 'rgba(0,162,255,0.1)'
            : 'linear-gradient(135deg, rgba(0,100,220,0.8) 0%, rgba(0,162,255,0.7) 100%)',
          border: '1px solid rgba(0,162,255,0.4)',
          boxShadow: isAnalyzing ? 'none' : '0 4px 24px rgba(0,162,255,0.3)',
          color: isAnalyzing ? 'rgba(0,162,255,0.6)' : 'white',
        }}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing with AI...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Run Analysis
          </>
        )}
      </button>

      {/* Error state */}
      {error && (
        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <XCircle className="w-4 h-4 text-red-400 flex-none mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-300 mb-1">Analysis Failed</p>
            <p className="text-xs text-red-300/70">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-300/80 font-medium">Analysis Complete</span>
            </div>
            {analysisTime && (
              <span className="text-xs text-white/30 font-mono">{analysisTime}ms</span>
            )}
          </div>
          <ResultSection result={result} />
        </>
      )}
    </div>
  );
}
