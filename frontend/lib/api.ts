/**
 * FAKE SHIELD - API Client
 * Handles all communication with the FastAPI backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface AnalyzeRequest {
  text?: string;
  url?: string;
  username?: string;
}

export interface AnalysisResult {
  request_id: string;
  timestamp: string;
  processing_time_ms: number;
  modules_executed: string[];
  results: {
    fake_news?: FakeNewsResult;
    cyber_threat?: CyberThreatResult;
    bot_detection?: BotDetectionResult;
  };
  overall_threat_level: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  overall_risk_score: number;
  alert_triggered: boolean;
  alert_severity?: 'LOW' | 'HIGH' | 'CRITICAL' | null;
  summary: string;
}

export interface FakeNewsResult {
  classification: 'REAL' | 'FAKE';
  confidence: number;
  reasoning: string;
  red_flags: string[];
  semantic_indicators: string[];
  verdict_summary: string;
  analyzed_by: string;
}

export interface CyberThreatResult {
  url: string;
  domain: string;
  protocol: string;
  threat_indicators: string[];
  risk_score: number;
  classification: 'SAFE' | 'LOW_RISK' | 'SUSPICIOUS' | 'MALICIOUS' | 'ERROR';
  threat_type: string | null;
  is_known_malicious: boolean;
  heuristic_flags: string[];
  recommendations: string[];
  analyzed_by: string;
}

export interface BotDetectionResult {
  username: string;
  account_data: Record<string, number | boolean>;
  bot_indicators: string[];
  human_indicators: string[];
  behavioral_scores: Record<string, number>;
  risk_score: number;
  classification: 'BOT' | 'SUSPICIOUS' | 'LIKELY_HUMAN' | 'HUMAN';
  confidence: number;
  network_analysis: Record<string, unknown>;
  recommendations: string[];
  analyzed_by: string;
}

export interface Alert {
  id: string;
  timestamp: string;
  type: string;
  severity: 'LOW' | 'HIGH' | 'CRITICAL';
  message: string;
  source: string;
  risk_score: number;
}

export interface ThreatEntry {
  id: string;
  indicator: string;
  type: string;
  target: string;
  risk_score: number;
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  first_seen: string;
  last_seen: string;
  status: string;
  reports: number;
}

export interface DashboardStats {
  total_threats_tracked: number;
  active_threats: number;
  alerts_today: number;
  critical_alerts: number;
  high_alerts: number;
  domains_blacklisted: number;
  bot_networks_identified: number;
  fake_news_reports: number;
  system_uptime_hours: number;
  threat_intelligence_score: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function analyzeContent(request: AnalyzeRequest): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function getAlerts(limit = 30, offset = 0): Promise<{ alerts: Alert[]; total: number }> {
  const response = await fetch(`${API_BASE}/api/alerts?limit=${limit}&offset=${offset}`);
  if (!response.ok) throw new Error('Failed to fetch alerts');
  return response.json();
}

export async function getLatestAlerts(sinceId?: string, limit = 10): Promise<{ alerts: Alert[]; count: number }> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (sinceId) params.set('since_id', sinceId);
  const response = await fetch(`${API_BASE}/api/alerts/latest?${params}`);
  if (!response.ok) throw new Error('Failed to fetch latest alerts');
  return response.json();
}

export async function getThreatDatabase(params?: {
  limit?: number;
  severity?: string;
  type_filter?: string;
}): Promise<{ entries: ThreatEntry[]; total: number; stats: Record<string, number> }> {
  const query = new URLSearchParams();
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.severity) query.set('severity', params.severity);
  if (params?.type_filter) query.set('type_filter', params.type_filter);
  const response = await fetch(`${API_BASE}/api/threats?${query}`);
  if (!response.ok) throw new Error('Failed to fetch threat database');
  return response.json();
}

export async function getNetworkData(): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_BASE}/api/network`);
  if (!response.ok) throw new Error('Failed to fetch network data');
  return response.json();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE}/api/stats`);
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

export async function checkHealth(): Promise<{ status: string; gemini_configured: boolean }> {
  const response = await fetch(`${API_BASE}/api/health`);
  if (!response.ok) throw new Error('Backend unavailable');
  return response.json();
}
