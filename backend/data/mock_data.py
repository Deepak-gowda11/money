"""
FAKE SHIELD - Mock Data & Simulation Engine
Provides realistic threat datasets and live traffic simulation
"""

import random
import time
from datetime import datetime, timedelta

# ─────────────────────────────────────────────────────────────
# MOCK MALICIOUS DOMAINS DATABASE
# ─────────────────────────────────────────────────────────────
MALICIOUS_DOMAINS = {
    "paypa1.com": {"type": "typosquatting", "target": "paypal.com", "risk": 95},
    "g00gle.com": {"type": "typosquatting", "target": "google.com", "risk": 92},
    "arnazon.com": {"type": "typosquatting", "target": "amazon.com", "risk": 94},
    "micros0ft.com": {"type": "typosquatting", "target": "microsoft.com", "risk": 91},
    "faceb00k.com": {"type": "typosquatting", "target": "facebook.com", "risk": 89},
    "login-secure-bank.tk": {"type": "phishing", "target": "banking", "risk": 98},
    "verify-account-now.ml": {"type": "phishing", "target": "generic", "risk": 97},
    "urgent-winner-prize.ga": {"type": "scam", "target": "generic", "risk": 96},
    "secure-update-required.cf": {"type": "phishing", "target": "generic", "risk": 95},
    "bitcoin-double.xyz": {"type": "scam", "target": "crypto", "risk": 99},
    "free-iphone-claim.info": {"type": "scam", "target": "generic", "risk": 93},
    "crypto-profit-now.biz": {"type": "scam", "target": "crypto", "risk": 97},
    "news-breaking-2024.ru": {"type": "disinformation", "target": "media", "risk": 85},
    "truth-uncensored.tk": {"type": "disinformation", "target": "media", "risk": 82},
    "realfacts-hidden.ml": {"type": "disinformation", "target": "media", "risk": 88},
    "govnt-exposed.xyz": {"type": "disinformation", "target": "politics", "risk": 86},
    "vaccine-danger-truth.info": {"type": "health_misinfo", "target": "health", "risk": 91},
    "5g-danger-exposed.biz": {"type": "health_misinfo", "target": "tech", "risk": 84},
    "election-fraud-proof.tk": {"type": "election_misinfo", "target": "politics", "risk": 90},
    "pandemic-hoax-truth.ml": {"type": "health_misinfo", "target": "health", "risk": 89},
}

# Suspicious URL patterns
PHISHING_PATTERNS = [
    r"login[-_]?secure",
    r"verify[-_]?account",
    r"update[-_]?info",
    r"confirm[-_]?identity",
    r"secure[-_]?banking",
    r"account[-_]?suspended",
    r"urgent[-_]?action",
    r"click[-_]?here[-_]?now",
    r"limited[-_]?time[-_]?offer",
    r"free[-_]?gift",
    r"winner[-_]?selected",
    r"password[-_]?reset",
    r"sign[-_]?in[-_]?required",
]

SUSPICIOUS_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".info", ".biz", ".ru", ".cn"]

# ─────────────────────────────────────────────────────────────
# MOCK FAKE NEWS CORPUS
# ─────────────────────────────────────────────────────────────
FAKE_NEWS_EXAMPLES = [
    "Scientists discover that drinking bleach cures all diseases!",
    "The moon landing was staged in a Hollywood studio - we have proof!",
    "5G towers are secretly spreading COVID-19 through radio waves!",
    "Microchips hidden in vaccines to track the population!",
    "Alien species confirmed to be controlling world governments!",
    "Drinking lemon juice will instantly kill cancer cells!",
    "The earth is actually flat - NASA is lying to us all!",
    "Ancient ruins discovered on Mars prove alien civilization existed!",
    "New study shows social media causes immediate psychosis in teenagers!",
    "Government secretly poisoning water supply with mind control chemicals!",
]

REAL_NEWS_EXAMPLES = [
    "NASA's James Webb telescope captures new images of distant galaxies.",
    "Scientists develop breakthrough cancer treatment with 78% success rate in trials.",
    "Global renewable energy capacity increased by 15% last year according to IEA.",
    "Tech companies announce new AI safety guidelines following industry summit.",
    "Medical researchers publish findings on new antibiotic resistant bacteria strain.",
    "Climate report shows Arctic ice levels at record low for third consecutive year.",
    "International trade agreement signed between 12 countries after five years of negotiations.",
    "New study confirms regular exercise reduces risk of heart disease by 35%.",
]

# ─────────────────────────────────────────────────────────────
# MOCK SOCIAL MEDIA BOT PROFILES
# ─────────────────────────────────────────────────────────────
BOT_ACCOUNTS = [
    {"username": "news_bot_3847", "posts_per_hour": 45, "account_age_days": 3, "followers": 12, "following": 2340},
    {"username": "info_spreader99", "posts_per_hour": 38, "account_age_days": 7, "followers": 45, "following": 4521},
    {"username": "real_human_1847362", "posts_per_hour": 52, "account_age_days": 1, "followers": 8, "following": 1823},
    {"username": "truthnews_bot_alpha", "posts_per_hour": 29, "account_age_days": 14, "followers": 231, "following": 3942},
    {"username": "xX_news_master_Xx", "posts_per_hour": 41, "account_age_days": 5, "followers": 23, "following": 5012},
]

HUMAN_ACCOUNTS = [
    {"username": "john_doe_2024", "posts_per_hour": 2, "account_age_days": 1247, "followers": 342, "following": 285},
    {"username": "sarah_journalist", "posts_per_hour": 4, "account_age_days": 2156, "followers": 8920, "following": 412},
    {"username": "tech_enthusiast_mike", "posts_per_hour": 1, "account_age_days": 890, "followers": 156, "following": 203},
]

# ─────────────────────────────────────────────────────────────
# SIMULATED LIVE ALERT GENERATOR
# ─────────────────────────────────────────────────────────────
ALERT_TEMPLATES = [
    {
        "type": "FAKE_NEWS",
        "severity": "CRITICAL",
        "templates": [
            "CRITICAL: Viral health misinformation detected - 'miracle cure' claims spreading across 47 accounts",
            "CRITICAL: Election interference narrative identified - coordinated posting from {n} bot accounts",
            "CRITICAL: Dangerous medical advice trending - immediate takedown recommended",
        ]
    },
    {
        "type": "PHISHING",
        "severity": "HIGH",
        "templates": [
            "HIGH: New phishing domain registered: {domain} targeting banking users",
            "HIGH: Typosquatting attack detected mimicking {brand} - {n} users potentially exposed",
            "HIGH: Credential harvesting campaign identified - suspicious redirect chain detected",
        ]
    },
    {
        "type": "BOT_NETWORK",
        "severity": "HIGH",
        "templates": [
            "HIGH: Coordinated bot network detected - {n} accounts posting identical content",
            "HIGH: Automated disinformation campaign active - propagation rate: {rate}%/hr",
            "HIGH: Bot cluster identified amplifying fake news - network size: {n} nodes",
        ]
    },
    {
        "type": "CYBER_THREAT",
        "severity": "CRITICAL",
        "templates": [
            "CRITICAL: Active phishing campaign targeting financial institutions - {n} domains flagged",
            "CRITICAL: Malware distribution via social media links detected",
            "CRITICAL: Mass account takeover attempt identified from {n} IPs",
        ]
    },
    {
        "type": "DISINFORMATION",
        "severity": "LOW",
        "templates": [
            "LOW: Low-confidence misinformation detected in forum post - monitoring active",
            "LOW: Suspicious narrative pattern identified - flagged for review",
            "LOW: New unverified claim circulating - fact-checking in progress",
        ]
    },
]

BRANDS = ["PayPal", "Google", "Amazon", "Microsoft", "Apple", "Netflix", "Facebook"]
DOMAINS_POOL = list(MALICIOUS_DOMAINS.keys())


def generate_mock_alert() -> dict:
    """Generate a realistic simulated threat alert"""
    template_group = random.choice(ALERT_TEMPLATES)
    template = random.choice(template_group["templates"])
    
    # Fill template variables
    message = template.format(
        n=random.randint(12, 347),
        domain=random.choice(DOMAINS_POOL),
        brand=random.choice(BRANDS),
        rate=random.randint(23, 89),
    )
    
    return {
        "id": f"alert_{int(time.time() * 1000)}_{random.randint(100, 999)}",
        "timestamp": datetime.utcnow().isoformat(),
        "type": template_group["type"],
        "severity": template_group["severity"],
        "message": message,
        "source": random.choice(["Network Monitor", "NLP Engine", "Bot Detector", "URL Scanner", "Graph Analyzer"]),
        "risk_score": random.randint(
            65 if template_group["severity"] == "LOW" else 
            75 if template_group["severity"] == "HIGH" else 90,
            100
        ),
    }


def generate_mock_traffic_batch(size: int = 5) -> list:
    """Generate a batch of simulated internet traffic entries"""
    return [generate_mock_alert() for _ in range(size)]


def get_threat_database_entries() -> list:
    """Return the mock threat intelligence database"""
    entries = []
    
    base_time = datetime.utcnow()
    for i, (domain, info) in enumerate(MALICIOUS_DOMAINS.items()):
        entries.append({
            "id": f"threat_{i+1:04d}",
            "indicator": domain,
            "type": info["type"].replace("_", " ").title(),
            "target": info["target"].title(),
            "risk_score": info["risk"],
            "severity": "CRITICAL" if info["risk"] >= 95 else "HIGH" if info["risk"] >= 85 else "MEDIUM",
            "first_seen": (base_time - timedelta(days=random.randint(1, 180))).strftime("%Y-%m-%d"),
            "last_seen": (base_time - timedelta(hours=random.randint(0, 48))).strftime("%Y-%m-%d %H:%M"),
            "status": random.choice(["Active", "Active", "Active", "Monitoring", "Contained"]),
            "reports": random.randint(3, 847),
        })
    
    # Add some fake news entries
    fake_news_domains = [
        ("deepfake-videos-real.tk", "Deepfake Media", "Media", 88),
        ("conspiracy-truth-hub.ml", "Disinformation", "Politics", 84),
        ("antivax-science.info", "Health Misinformation", "Health", 92),
        ("election-stolen-proof.xyz", "Election Misinformation", "Politics", 87),
        ("covid-bioweapon-truth.biz", "Health Misinformation", "Health", 90),
    ]
    
    for i, (domain, type_, target, risk) in enumerate(fake_news_domains):
        entries.append({
            "id": f"threat_fn_{i+1:04d}",
            "indicator": domain,
            "type": type_,
            "target": target,
            "risk_score": risk,
            "severity": "CRITICAL" if risk >= 95 else "HIGH" if risk >= 85 else "MEDIUM",
            "first_seen": (base_time - timedelta(days=random.randint(1, 90))).strftime("%Y-%m-%d"),
            "last_seen": (base_time - timedelta(hours=random.randint(0, 24))).strftime("%Y-%m-%d %H:%M"),
            "status": random.choice(["Active", "Active", "Monitoring"]),
            "reports": random.randint(12, 1247),
        })
    
    return sorted(entries, key=lambda x: x["risk_score"], reverse=True)


def get_network_nodes() -> dict:
    """Return mock network graph data for visualization"""
    nodes = []
    edges = []
    
    # Bot network cluster 1
    for i in range(8):
        nodes.append({
            "id": f"bot_cluster_a_{i}",
            "username": f"auto_news_{random.randint(1000, 9999)}",
            "type": "BOT",
            "risk_score": random.randint(75, 95),
            "posts_per_hour": random.randint(20, 60),
            "followers": random.randint(5, 50),
            "account_age_days": random.randint(1, 14),
            "cluster": "Alpha Network",
        })
        if i > 0:
            edges.append({"source": f"bot_cluster_a_0", "target": f"bot_cluster_a_{i}", "weight": random.uniform(0.7, 1.0)})
    
    # Bot network cluster 2
    for i in range(6):
        nodes.append({
            "id": f"bot_cluster_b_{i}",
            "username": f"info_spread_{random.randint(100, 999)}x",
            "type": "BOT",
            "risk_score": random.randint(80, 98),
            "posts_per_hour": random.randint(30, 55),
            "followers": random.randint(8, 120),
            "account_age_days": random.randint(2, 21),
            "cluster": "Beta Network",
        })
        if i > 0:
            edges.append({"source": f"bot_cluster_b_0", "target": f"bot_cluster_b_{i}", "weight": random.uniform(0.6, 0.95)})
    
    # Cross-cluster connections
    edges.append({"source": "bot_cluster_a_0", "target": "bot_cluster_b_0", "weight": 0.45})
    
    # Suspicious accounts
    for i in range(4):
        nodes.append({
            "id": f"suspicious_{i}",
            "username": f"real_person_{random.randint(10000, 99999)}",
            "type": "SUSPICIOUS",
            "risk_score": random.randint(55, 74),
            "posts_per_hour": random.randint(12, 25),
            "followers": random.randint(50, 500),
            "account_age_days": random.randint(14, 60),
            "cluster": "Unclassified",
        })
    
    return {
        "nodes": nodes,
        "edges": edges,
        "stats": {
            "total_nodes": len(nodes),
            "bot_count": 14,
            "suspicious_count": 4,
            "active_clusters": 2,
            "propagation_risk": 87,
        }
    }
