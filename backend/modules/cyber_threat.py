"""
FAKE SHIELD - Cyber Threat Analysis Module
URL parsing, phishing detection, and heuristic pattern matching
"""

import re
import os
import random
from urllib.parse import urlparse, parse_qs
from data.mock_data import MALICIOUS_DOMAINS, PHISHING_PATTERNS, SUSPICIOUS_TLDS


def analyze_url(url: str) -> dict:
    """
    Comprehensive URL threat analysis using heuristics and database matching.
    Returns detailed threat assessment.
    """
    # Normalize URL
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    
    try:
        parsed = urlparse(url)
    except Exception:
        return _error_result(url, "Invalid URL format")
    
    domain = parsed.netloc.lower().replace("www.", "")
    path = parsed.path.lower()
    query_string = parsed.query.lower()
    full_url_lower = url.lower()
    
    results = {
        "url": url,
        "domain": domain,
        "protocol": parsed.scheme,
        "threat_indicators": [],
        "risk_score": 0,
        "classification": "SAFE",
        "threat_type": None,
        "is_known_malicious": False,
        "heuristic_flags": [],
        "recommendations": [],
        "analyzed_by": "FAKE SHIELD URL Intelligence Engine",
    }
    
    risk_score = 0
    
    # ── 1. Check against known malicious domain database ──────────────
    if domain in MALICIOUS_DOMAINS:
        entry = MALICIOUS_DOMAINS[domain]
        results["is_known_malicious"] = True
        results["threat_type"] = entry["type"].replace("_", " ").title()
        results["threat_indicators"].append(
            f"Domain '{domain}' found in FAKE SHIELD threat intelligence database"
        )
        risk_score += entry["risk"]
        results["heuristic_flags"].append(f"Blacklisted: {entry['type']} targeting {entry['target']}")
    
    # ── 2. Typosquatting detection ─────────────────────────────────────
    common_brands = {
        "paypal": "paypal.com", "google": "google.com", "amazon": "amazon.com",
        "microsoft": "microsoft.com", "apple": "apple.com", "facebook": "facebook.com",
        "instagram": "instagram.com", "twitter": "twitter.com", "netflix": "netflix.com",
        "linkedin": "linkedin.com", "youtube": "youtube.com", "gmail": "gmail.com",
        "ebay": "ebay.com", "walmart": "walmart.com", "chase": "chase.com",
    }
    
    for brand, legitimate_domain in common_brands.items():
        if brand in domain and domain != legitimate_domain:
            # Check for character substitution (0→o, 1→l, etc.)
            normalized = domain.replace("0", "o").replace("1", "l").replace("3", "e")
            if brand in normalized:
                results["threat_indicators"].append(
                    f"Typosquatting detected: '{domain}' appears to impersonate '{legitimate_domain}'"
                )
                results["heuristic_flags"].append(f"Brand impersonation: {brand.title()}")
                risk_score += 40
                if not results["threat_type"]:
                    results["threat_type"] = "Typosquatting"
    
    # ── 3. Suspicious TLD check ────────────────────────────────────────
    for tld in SUSPICIOUS_TLDS:
        if domain.endswith(tld):
            results["threat_indicators"].append(
                f"High-risk TLD detected: '{tld}' - commonly used in phishing campaigns"
            )
            results["heuristic_flags"].append(f"Suspicious TLD: {tld}")
            risk_score += 25
            break
    
    # ── 4. Phishing URL pattern matching ──────────────────────────────
    matched_patterns = []
    for pattern in PHISHING_PATTERNS:
        if re.search(pattern, full_url_lower):
            matched_patterns.append(pattern)
            risk_score += 20
    
    if matched_patterns:
        results["threat_indicators"].append(
            f"Phishing patterns detected in URL: {len(matched_patterns)} suspicious keyword patterns matched"
        )
        results["heuristic_flags"].append(f"Phishing keywords: {len(matched_patterns)} matches")
        if not results["threat_type"]:
            results["threat_type"] = "Phishing"
    
    # ── 5. Suspicious query parameters ────────────────────────────────
    sensitive_params = ["password", "passwd", "pwd", "token", "auth", "credentials", "secret", "key", "ssn", "cc", "cvv"]
    query_params = parse_qs(query_string)
    found_sensitive = [p for p in sensitive_params if p in query_string]
    
    if found_sensitive:
        results["threat_indicators"].append(
            f"Suspicious URL parameters detected: '{', '.join(found_sensitive)}' - potential credential harvesting"
        )
        results["heuristic_flags"].append(f"Sensitive params in URL: {', '.join(found_sensitive)}")
        risk_score += 30
    
    # ── 6. Excessive subdomains or length ──────────────────────────────
    subdomain_count = len(domain.split(".")) - 2
    if subdomain_count > 3:
        results["threat_indicators"].append(
            f"Unusual subdomain depth: {subdomain_count} levels - potential subdomain obfuscation"
        )
        risk_score += 15
    
    if len(url) > 150:
        results["threat_indicators"].append(
            f"Abnormally long URL ({len(url)} chars) - common in phishing to obscure destination"
        )
        risk_score += 10
    
    # ── 7. HTTP (non-HTTPS) on sensitive pages ─────────────────────────
    if parsed.scheme == "http" and any(kw in full_url_lower for kw in ["login", "account", "bank", "secure", "payment"]):
        results["threat_indicators"].append(
            "Non-encrypted HTTP connection on sensitive page - credentials at risk"
        )
        risk_score += 20
    
    # ── 8. IP address as hostname ──────────────────────────────────────
    ip_pattern = re.compile(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$")
    if ip_pattern.match(domain):
        results["threat_indicators"].append(
            "Direct IP address used as hostname - bypasses domain reputation checks"
        )
        risk_score += 35
        if not results["threat_type"]:
            results["threat_type"] = "Direct IP Access"
    
    # ── 9. Finalize classification ─────────────────────────────────────
    risk_score = min(100, risk_score)
    results["risk_score"] = risk_score
    
    if risk_score >= 80:
        results["classification"] = "MALICIOUS"
        results["recommendations"] = [
            "Do NOT visit this URL",
            "Report to your IT security team immediately",
            "Block domain at firewall level",
            "Notify users who may have accessed this link",
        ]
    elif risk_score >= 50:
        results["classification"] = "SUSPICIOUS"
        results["recommendations"] = [
            "Approach with extreme caution",
            "Verify legitimacy through official channels before visiting",
            "Do not enter any credentials",
            "Monitor for related phishing activity",
        ]
    elif risk_score >= 20:
        results["classification"] = "LOW_RISK"
        results["recommendations"] = [
            "Exercise caution - some risk indicators present",
            "Verify the domain reputation before sharing",
        ]
    else:
        results["classification"] = "SAFE"
        results["recommendations"] = [
            "No significant threat indicators detected",
            "Standard browsing precautions apply",
        ]
    
    if not results["threat_indicators"]:
        results["threat_indicators"] = ["No threat indicators detected"]
    
    return results


def _error_result(url: str, message: str) -> dict:
    return {
        "url": url,
        "domain": "unknown",
        "protocol": "unknown",
        "threat_indicators": [message],
        "risk_score": 0,
        "classification": "ERROR",
        "threat_type": "Analysis Error",
        "is_known_malicious": False,
        "heuristic_flags": [],
        "recommendations": ["Please provide a valid URL for analysis"],
        "analyzed_by": "FAKE SHIELD URL Intelligence Engine",
    }
