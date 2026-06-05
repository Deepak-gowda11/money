"""
FAKE SHIELD - FastAPI Backend Main Application
AI-Driven Social Network Intelligence System
"""

import os
import sys
import asyncio
import random
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add project root to path
sys.path.insert(0, os.path.dirname(__file__))

# Import modules
from modules.fake_news import classify_fake_news
from modules.cyber_threat import analyze_url
from modules.bot_detection import analyze_account
from data.mock_data import (
    generate_mock_alert,
    generate_mock_traffic_batch,
    get_threat_database_entries,
    get_network_nodes,
)

# ─────────────────────────────────────────────────────────────
# GLOBAL STATE - Live Alert Feed
# ─────────────────────────────────────────────────────────────
live_alerts: list = []
MAX_ALERTS = 100  # Keep last 100 alerts


async def populate_initial_alerts():
    """Seed the alert feed with initial data"""
    global live_alerts
    initial = generate_mock_traffic_batch(20)
    live_alerts.extend(initial)


async def background_alert_generator():
    """Continuously generate simulated live threat alerts"""
    global live_alerts
    await asyncio.sleep(2)  # Initial delay
    
    while True:
        try:
            # Generate 1-3 new alerts every 2-4 seconds
            count = random.randint(1, 3)
            new_alerts = generate_mock_traffic_batch(count)
            live_alerts.extend(new_alerts)
            
            # Keep only the last MAX_ALERTS entries
            if len(live_alerts) > MAX_ALERTS:
                live_alerts = live_alerts[-MAX_ALERTS:]
            
            await asyncio.sleep(random.uniform(2.0, 4.0))
        except Exception:
            await asyncio.sleep(3)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    await populate_initial_alerts()
    asyncio.create_task(background_alert_generator())
    yield
    # Cleanup on shutdown


# ─────────────────────────────────────────────────────────────
# FASTAPI APP INITIALIZATION
# ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="FAKE SHIELD API",
    description="AI-Driven Social Network Intelligence System for Fake News Detection, Cyber Threat Analysis, and Real-Time Alerts",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000")
cors_origins = [origin.strip() for origin in cors_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins + ["http://localhost:3001", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────
# REQUEST/RESPONSE MODELS
# ─────────────────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    text: Optional[str] = Field(None, description="Text content for fake news analysis")
    url: Optional[str] = Field(None, description="URL for cyber threat analysis")
    username: Optional[str] = Field(None, description="Social media username for bot detection")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Scientists discover miracle cure for all diseases!",
                "url": "https://paypa1.com/login",
                "username": "news_bot_3847",
            }
        }


class AnalysisResponse(BaseModel):
    request_id: str
    timestamp: str
    processing_time_ms: float
    modules_executed: list
    results: dict
    overall_threat_level: str
    overall_risk_score: float
    alert_triggered: bool
    alert_severity: Optional[str]
    summary: str


# ─────────────────────────────────────────────────────────────
# HELPER: Calculate overall risk
# ─────────────────────────────────────────────────────────────
def calculate_overall_risk(results: dict) -> tuple[float, str, bool, Optional[str]]:
    """Calculate aggregate risk score and threat level"""
    scores = []
    
    if "fake_news" in results:
        fn = results["fake_news"]
        if fn.get("classification") == "FAKE":
            scores.append(fn.get("confidence", 0))
        else:
            scores.append(100 - fn.get("confidence", 50))
    
    if "cyber_threat" in results:
        scores.append(results["cyber_threat"].get("risk_score", 0))
    
    if "bot_detection" in results:
        scores.append(results["bot_detection"].get("risk_score", 0))
    
    if not scores:
        return 0.0, "UNKNOWN", False, None
    
    avg_score = sum(scores) / len(scores)
    max_score = max(scores)
    
    # Weight toward maximum risk
    overall = (avg_score * 0.4 + max_score * 0.6)
    
    if overall >= 85:
        threat_level = "CRITICAL"
        alert_triggered = True
        alert_severity = "CRITICAL"
    elif overall >= 65:
        threat_level = "HIGH"
        alert_triggered = True
        alert_severity = "HIGH"
    elif overall >= 40:
        threat_level = "MEDIUM"
        alert_triggered = True
        alert_severity = "LOW"
    elif overall >= 20:
        threat_level = "LOW"
        alert_triggered = False
        alert_severity = None
    else:
        threat_level = "SAFE"
        alert_triggered = False
        alert_severity = None
    
    return round(overall, 2), threat_level, alert_triggered, alert_severity


# ─────────────────────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "FAKE SHIELD API",
        "status": "operational",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": {
            "analyze": "POST /api/analyze",
            "alerts": "GET /api/alerts",
            "threats": "GET /api/threats",
            "network": "GET /api/network",
            "health": "GET /api/health",
        }
    }


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "active_alerts": len(live_alerts),
        "gemini_configured": bool(
            os.getenv("GEMINI_API_KEY") and 
            os.getenv("GEMINI_API_KEY") != "your_gemini_api_key_here"
        ),
    }


@app.post("/api/analyze", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_content(request: AnalyzeRequest):
    """
    Main analysis endpoint - runs all enabled modules concurrently.
    
    Accepts any combination of:
    - text: for fake news classification
    - url: for cyber threat analysis  
    - username: for bot detection
    """
    import time
    
    if not request.text and not request.url and not request.username:
        raise HTTPException(
            status_code=422,
            detail="At least one of 'text', 'url', or 'username' must be provided"
        )
    
    start_time = time.time()
    request_id = f"req_{int(start_time * 1000)}_{random.randint(1000, 9999)}"
    
    results = {}
    modules_executed = []
    tasks = []
    
    # ── Build concurrent tasks ────────────────────────────────────────
    async def run_fake_news():
        if request.text:
            modules_executed.append("fake_news_classifier")
            results["fake_news"] = await classify_fake_news(request.text)
    
    async def run_cyber_threat():
        if request.url:
            modules_executed.append("cyber_threat_analyzer")
            results["cyber_threat"] = analyze_url(request.url)
    
    async def run_bot_detection():
        if request.username:
            modules_executed.append("bot_detection_engine")
            results["bot_detection"] = analyze_account(request.username)
    
    # Run all modules concurrently
    await asyncio.gather(
        run_fake_news(),
        run_cyber_threat(),
        run_bot_detection(),
    )
    
    processing_time = (time.time() - start_time) * 1000
    
    # Calculate overall risk
    overall_risk, threat_level, alert_triggered, alert_severity = calculate_overall_risk(results)
    
    # Build summary
    summaries = []
    if "fake_news" in results:
        fn = results["fake_news"]
        summaries.append(f"Content classified as {fn['classification']} ({fn['confidence']}% confidence)")
    if "cyber_threat" in results:
        ct = results["cyber_threat"]
        summaries.append(f"URL analyzed: {ct['classification']} (risk: {ct['risk_score']}/100)")
    if "bot_detection" in results:
        bd = results["bot_detection"]
        summaries.append(f"Account '{bd['username']}' classified as {bd['classification']} ({bd['risk_score']}/100)")
    
    summary = " | ".join(summaries) if summaries else "Analysis complete"
    
    # Add to live alerts if threat detected
    if alert_triggered:
        alert = {
            "id": f"user_alert_{request_id}",
            "timestamp": datetime.utcnow().isoformat(),
            "type": "USER_ANALYSIS",
            "severity": alert_severity,
            "message": f"USER ANALYSIS: {summary}",
            "source": "Analysis Terminal",
            "risk_score": overall_risk,
        }
        live_alerts.append(alert)
    
    return AnalysisResponse(
        request_id=request_id,
        timestamp=datetime.utcnow().isoformat(),
        processing_time_ms=round(processing_time, 2),
        modules_executed=modules_executed,
        results=results,
        overall_threat_level=threat_level,
        overall_risk_score=overall_risk,
        alert_triggered=alert_triggered,
        alert_severity=alert_severity,
        summary=summary,
    )


@app.get("/api/alerts", tags=["Live Feed"])
async def get_alerts(limit: int = 30, offset: int = 0):
    """Get the live alert feed with pagination"""
    total = len(live_alerts)
    
    # Return most recent alerts first
    sorted_alerts = list(reversed(live_alerts))
    paginated = sorted_alerts[offset:offset + limit]
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "alerts": paginated,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/alerts/latest", tags=["Live Feed"])
async def get_latest_alerts(since_id: Optional[str] = None, limit: int = 10):
    """Get the latest alerts since a given alert ID"""
    if not since_id:
        latest = list(reversed(live_alerts))[:limit]
    else:
        # Find alerts newer than since_id
        found_idx = None
        for i, alert in enumerate(live_alerts):
            if alert["id"] == since_id:
                found_idx = i
                break
        
        if found_idx is not None:
            latest = live_alerts[found_idx + 1:][-limit:]
        else:
            latest = list(reversed(live_alerts))[:limit]
    
    return {
        "alerts": list(reversed(latest)),
        "count": len(latest),
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/threats", tags=["Intelligence"])
async def get_threat_database(
    limit: int = 50,
    severity: Optional[str] = None,
    type_filter: Optional[str] = None,
):
    """Get the threat intelligence database with optional filtering"""
    entries = get_threat_database_entries()
    
    if severity:
        entries = [e for e in entries if e["severity"].upper() == severity.upper()]
    
    if type_filter:
        entries = [e for e in entries if type_filter.lower() in e["type"].lower()]
    
    return {
        "total": len(entries),
        "entries": entries[:limit],
        "stats": {
            "critical_count": sum(1 for e in entries if e["severity"] == "CRITICAL"),
            "high_count": sum(1 for e in entries if e["severity"] == "HIGH"),
            "medium_count": sum(1 for e in entries if e["severity"] == "MEDIUM"),
            "active_count": sum(1 for e in entries if e["status"] == "Active"),
        },
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/network", tags=["Intelligence"])
async def get_network_data():
    """Get network graph data for visualization"""
    return {
        **get_network_nodes(),
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/stats", tags=["Dashboard"])
async def get_dashboard_stats():
    """Get aggregate dashboard statistics"""
    threats = get_threat_database_entries()
    
    critical_alerts = sum(1 for a in live_alerts if a.get("severity") == "CRITICAL")
    high_alerts = sum(1 for a in live_alerts if a.get("severity") == "HIGH")
    
    return {
        "total_threats_tracked": len(threats),
        "active_threats": sum(1 for t in threats if t["status"] == "Active"),
        "alerts_today": len(live_alerts),
        "critical_alerts": critical_alerts,
        "high_alerts": high_alerts,
        "domains_blacklisted": 20,
        "bot_networks_identified": 2,
        "fake_news_reports": 47,
        "system_uptime_hours": random.randint(12, 720),
        "threat_intelligence_score": 94,
        "timestamp": datetime.utcnow().isoformat(),
    }


# ─────────────────────────────────────────────────────────────
# RUN DEVELOPMENT SERVER
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info",
    )
