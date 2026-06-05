"""Quick end-to-end test for FAKE SHIELD API"""
import urllib.request, json

BASE = "http://localhost:8000"

def test(name, path, method="GET", payload=None):
    try:
        if payload:
            data = json.dumps(payload).encode()
            req = urllib.request.Request(f"{BASE}{path}", data=data,
                  headers={"Content-Type": "application/json"}, method="POST")
        else:
            req = urllib.request.Request(f"{BASE}{path}")
        r = urllib.request.urlopen(req, timeout=10)
        result = json.loads(r.read())
        print(f"[PASS] {name}")
        return result
    except Exception as e:
        print(f"[FAIL] {name}: {e}")
        return None

print("\n=== FAKE SHIELD API Tests ===\n")

# 1. Health check
health = test("Health check", "/api/health")
if health:
    print(f"       Status: {health['status']}, Alerts: {health['active_alerts']}, Gemini: {health['gemini_configured']}")

# 2. Fake news analysis - FAKE
fake_result = test("Fake news analysis (FAKE)",
    "/api/analyze", "POST",
    {"text": "Scientists confirm that drinking bleach cures COVID-19! The government is hiding this miracle cure!"})
if fake_result:
    fn = fake_result["results"].get("fake_news", {})
    print(f"       Classification: {fn.get('classification')} ({fn.get('confidence')}% confidence)")
    print(f"       Overall Risk: {fake_result['overall_risk_score']} | Level: {fake_result['overall_threat_level']}")
    print(f"       Engine: {fn.get('analyzed_by')}")

# 3. Fake news analysis - REAL
real_result = test("Fake news analysis (REAL)",
    "/api/analyze", "POST",
    {"text": "A new peer-reviewed study published in Nature found that regular exercise reduces cardiovascular risk by 35%."})
if real_result:
    fn = real_result["results"].get("fake_news", {})
    print(f"       Classification: {fn.get('classification')} ({fn.get('confidence')}% confidence)")

# 4. URL cyber threat - MALICIOUS
url_result = test("URL analysis (Malicious)",
    "/api/analyze", "POST",
    {"url": "https://paypa1.com/login-secure-verify"})
if url_result:
    ct = url_result["results"].get("cyber_threat", {})
    print(f"       URL Classification: {ct.get('classification')} | Risk: {ct.get('risk_score')}")
    print(f"       Known Malicious: {ct.get('is_known_malicious')}")

# 5. Bot detection
bot_result = test("Bot detection (Bot account)",
    "/api/analyze", "POST",
    {"username": "news_bot_3847"})
if bot_result:
    bd = bot_result["results"].get("bot_detection", {})
    print(f"       Classification: {bd.get('classification')} | Risk: {bd.get('risk_score')}")

# 6. Alerts feed
alerts = test("Live alerts feed", "/api/alerts?limit=5")
if alerts:
    print(f"       Total alerts in feed: {alerts['total']}")
    if alerts['alerts']:
        a = alerts['alerts'][0]
        print(f"       Latest alert severity: {a['severity']} | Type: {a['type']}")

# 7. Threat database
threats = test("Threat intelligence DB", "/api/threats?limit=5")
if threats:
    print(f"       Total threats: {threats['total']} | Critical: {threats['stats'].get('critical_count')}")

# 8. Network data
network = test("Network graph data", "/api/network")
if network:
    stats = network.get("stats", {})
    print(f"       Nodes: {stats.get('total_nodes')} | Bots: {stats.get('bot_count')}")

# 9. Dashboard stats
stats = test("Dashboard statistics", "/api/stats")
if stats:
    print(f"       Threats tracked: {stats.get('total_threats_tracked')} | Active: {stats.get('active_threats')}")

print("\n=== All tests complete ===\n")
