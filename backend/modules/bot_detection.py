"""
FAKE SHIELD - Social Bot Detection Module
Uses NetworkX for behavioral graph analysis and pattern detection
"""

import re
import math
import random
import networkx as nx
from datetime import datetime


# Build a persistent graph for session-level behavioral tracking
_behavior_graph = nx.DiGraph()
_analyzed_users = {}


def analyze_account(username: str) -> dict:
    """
    Analyze a social media account for bot behavior.
    Uses simulated behavioral metrics and NetworkX graph analysis.
    """
    # Simulate fetching account data (in production, would call social media APIs)
    account_data = _simulate_account_data(username)
    
    # Perform all detection checks
    results = {
        "username": username,
        "account_data": account_data,
        "bot_indicators": [],
        "human_indicators": [],
        "behavioral_scores": {},
        "risk_score": 0,
        "classification": "HUMAN",
        "confidence": 0,
        "network_analysis": {},
        "recommendations": [],
        "analyzed_by": "FAKE SHIELD Graph Intelligence Engine",
    }
    
    bot_score = 0
    
    # ── 1. Username pattern analysis ──────────────────────────────────
    username_score = _analyze_username(username)
    bot_score += username_score["score"]
    results["behavioral_scores"]["username_suspicion"] = username_score["score"]
    if username_score["flags"]:
        results["bot_indicators"].extend(username_score["flags"])
    
    # ── 2. Posting frequency analysis ─────────────────────────────────
    posts_per_hour = account_data["posts_per_hour"]
    if posts_per_hour > 30:
        bot_score += 35
        results["bot_indicators"].append(
            f"Extremely high posting rate: {posts_per_hour} posts/hour (human avg: 1-3)"
        )
        results["behavioral_scores"]["posting_frequency"] = 90
    elif posts_per_hour > 15:
        bot_score += 20
        results["bot_indicators"].append(
            f"Elevated posting rate: {posts_per_hour} posts/hour - potential automation"
        )
        results["behavioral_scores"]["posting_frequency"] = 65
    elif posts_per_hour > 8:
        bot_score += 8
        results["behavioral_scores"]["posting_frequency"] = 40
    else:
        results["human_indicators"].append(f"Normal posting frequency: {posts_per_hour} posts/hour")
        results["behavioral_scores"]["posting_frequency"] = 10
    
    # ── 3. Account age analysis ────────────────────────────────────────
    age_days = account_data["account_age_days"]
    if age_days < 7:
        bot_score += 25
        results["bot_indicators"].append(
            f"Very new account: {age_days} days old - high-frequency posting on new accounts is a major bot signal"
        )
        results["behavioral_scores"]["account_age"] = 85
    elif age_days < 30:
        bot_score += 10
        results["behavioral_scores"]["account_age"] = 50
    else:
        results["human_indicators"].append(f"Established account: {age_days} days old")
        results["behavioral_scores"]["account_age"] = 15
    
    # ── 4. Follower/Following ratio analysis ──────────────────────────
    followers = account_data["followers"]
    following = account_data["following"]
    
    if following > 0:
        ff_ratio = followers / following
    else:
        ff_ratio = 0
    
    if ff_ratio < 0.05 and following > 500:
        bot_score += 20
        results["bot_indicators"].append(
            f"Abnormal follower/following ratio: {ff_ratio:.3f} ({followers} followers, {following} following) - typical bot behavior"
        )
        results["behavioral_scores"]["ff_ratio"] = 80
    elif ff_ratio < 0.1 and following > 1000:
        bot_score += 10
        results["behavioral_scores"]["ff_ratio"] = 55
    else:
        results["human_indicators"].append(f"Normal follower ratio: {ff_ratio:.2f}")
        results["behavioral_scores"]["ff_ratio"] = 20
    
    # ── 5. Content repetition analysis ────────────────────────────────
    content_variety = account_data.get("content_variety_score", 50)
    if content_variety < 20:
        bot_score += 20
        results["bot_indicators"].append(
            f"Low content variety score: {content_variety}/100 - repetitive posting pattern detected"
        )
        results["behavioral_scores"]["content_variety"] = 85
    elif content_variety < 40:
        bot_score += 8
        results["behavioral_scores"]["content_variety"] = 50
    else:
        results["human_indicators"].append(f"Diverse content patterns detected")
        results["behavioral_scores"]["content_variety"] = 20
    
    # ── 6. Engagement authenticity ────────────────────────────────────
    engagement_rate = account_data.get("engagement_rate", 0)
    if engagement_rate < 0.001 and followers > 1000:
        bot_score += 15
        results["bot_indicators"].append(
            f"Suspiciously low engagement rate: {engagement_rate:.4f} - inflated follower count suspected"
        )
        results["behavioral_scores"]["engagement_authenticity"] = 80
    
    # ── 7. NetworkX Graph Analysis ────────────────────────────────────
    network_result = _run_network_analysis(username, account_data)
    bot_score += network_result["graph_bot_score"]
    results["network_analysis"] = network_result
    results["behavioral_scores"]["network_centrality"] = network_result["graph_bot_score"]
    
    if network_result["cluster_detected"]:
        results["bot_indicators"].append(
            f"Network cluster membership detected - connected to {network_result['connected_bots']} known bot accounts"
        )
    
    # ── 8. Final classification ────────────────────────────────────────
    bot_score = min(100, bot_score)
    results["risk_score"] = bot_score
    
    confidence = min(95, 50 + abs(bot_score - 50))
    results["confidence"] = confidence
    
    if bot_score >= 75:
        results["classification"] = "BOT"
        results["recommendations"] = [
            "Flag account for automated behavior review",
            "Investigate coordinated activity with related accounts",
            "Recommend platform reporting for Terms of Service violation",
            "Block from amplification algorithms",
        ]
    elif bot_score >= 50:
        results["classification"] = "SUSPICIOUS"
        results["recommendations"] = [
            "Monitor account activity for 48 hours",
            "Review recent post content for coordinated narratives",
            "Check for network connections to known bot accounts",
        ]
    elif bot_score >= 25:
        results["classification"] = "LIKELY_HUMAN"
        results["recommendations"] = [
            "Low risk - continue passive monitoring",
            "Review if bot score increases",
        ]
    else:
        results["classification"] = "HUMAN"
        results["recommendations"] = ["Account appears authentic - no action required"]
    
    if not results["human_indicators"]:
        results["human_indicators"] = ["Limited human behavioral signals detected"]
    
    return results


def _analyze_username(username: str) -> dict:
    """Analyze username for bot-typical patterns"""
    score = 0
    flags = []
    
    # Check for number-heavy suffix (e.g., user123456)
    trailing_numbers = re.search(r'\d{4,}$', username)
    if trailing_numbers:
        score += 15
        flags.append(f"Username ends with {len(trailing_numbers.group())} digits - common bot pattern")
    
    # Check for underscore-number patterns
    if re.search(r'[_\-]\d+[_\-]?\d*', username):
        score += 10
        flags.append("Username contains numeric separators - generated name pattern")
    
    # Check for word repetitions (bot_bot, news_news)
    words = re.split(r'[_\-\d]', username.lower())
    words = [w for w in words if len(w) > 2]
    if len(words) != len(set(words)) and words:
        score += 8
        flags.append("Repeated words in username - synthetic name pattern")
    
    # Check for common bot keywords
    bot_keywords = ["bot", "auto", "spam", "news", "info", "real", "truth", "official", "spread", "viral"]
    for kw in bot_keywords:
        if kw in username.lower():
            score += 8
            flags.append(f"Bot-associated keyword in username: '{kw}'")
            break
    
    # Very short or very long username
    if len(username) > 20:
        score += 5
        flags.append(f"Unusually long username: {len(username)} characters")
    
    # All lowercase with no distinguishing features
    if username.islower() and not any(c in username for c in '_- '):
        score += 5
    
    return {"score": min(40, score), "flags": flags}


def _simulate_account_data(username: str) -> dict:
    """Simulate fetching account data (would be replaced by real API calls)"""
    # Use username to create deterministic but varied data
    seed = sum(ord(c) for c in username)
    rng = random.Random(seed)
    
    # Check if username matches known bot/human patterns
    username_lower = username.lower()
    
    is_bot_like = any([
        re.search(r'\d{4,}', username_lower),
        any(kw in username_lower for kw in ["bot", "auto", "spam", "spread"]),
        len(username) > 18,
    ])
    
    if is_bot_like:
        return {
            "posts_per_hour": rng.randint(20, 60),
            "account_age_days": rng.randint(1, 21),
            "followers": rng.randint(5, 200),
            "following": rng.randint(500, 5000),
            "total_posts": rng.randint(500, 5000),
            "content_variety_score": rng.randint(5, 30),
            "engagement_rate": round(rng.uniform(0.0001, 0.005), 5),
            "avg_post_interval_seconds": rng.randint(30, 180),
            "identical_post_ratio": round(rng.uniform(0.4, 0.9), 2),
            "profile_picture": rng.choice([False, False, True]),  # Often no profile pic
            "bio_present": rng.choice([False, False, True]),
        }
    else:
        return {
            "posts_per_hour": rng.randint(0, 8),
            "account_age_days": rng.randint(90, 2000),
            "followers": rng.randint(50, 10000),
            "following": rng.randint(50, 800),
            "total_posts": rng.randint(50, 3000),
            "content_variety_score": rng.randint(45, 95),
            "engagement_rate": round(rng.uniform(0.01, 0.08), 5),
            "avg_post_interval_seconds": rng.randint(3600, 86400),
            "identical_post_ratio": round(rng.uniform(0.0, 0.1), 2),
            "profile_picture": True,
            "bio_present": rng.choice([True, True, False]),
        }


def _run_network_analysis(username: str, account_data: dict) -> dict:
    """Use NetworkX to analyze network behavioral patterns"""
    global _behavior_graph, _analyzed_users
    
    # Add user to graph
    _behavior_graph.add_node(username, **{
        "posts_per_hour": account_data["posts_per_hour"],
        "age_days": account_data["account_age_days"],
        "followers": account_data["followers"],
    })
    
    # Simulate connecting to related accounts based on posting patterns
    high_freq_accounts = [
        user for user, data in _analyzed_users.items()
        if data.get("posts_per_hour", 0) > 20
    ]
    
    cluster_detected = False
    connected_bots = 0
    
    # Connect accounts with similar high-frequency behavior
    if account_data["posts_per_hour"] > 20 and high_freq_accounts:
        for related in high_freq_accounts[:3]:
            _behavior_graph.add_edge(username, related, weight=0.8)
            connected_bots += 1
        cluster_detected = True
    
    # Calculate graph metrics
    graph_score = 0
    
    if username in _behavior_graph and len(_behavior_graph) > 1:
        try:
            # Degree centrality (how many connections)
            centrality = nx.degree_centrality(_behavior_graph)
            user_centrality = centrality.get(username, 0)
            
            if user_centrality > 0.3:
                graph_score += 20
            
            # Check for clique membership (coordinated groups)
            cliques = list(nx.find_cliques(_behavior_graph.to_undirected()))
            user_cliques = [c for c in cliques if username in c and len(c) > 2]
            
            if user_cliques:
                graph_score += 15 * len(user_cliques)
                cluster_detected = True
                
        except Exception:
            pass
    
    # Store for future comparisons
    _analyzed_users[username] = account_data
    
    return {
        "graph_bot_score": min(35, graph_score),
        "cluster_detected": cluster_detected,
        "connected_bots": connected_bots,
        "graph_size": len(_behavior_graph.nodes),
        "graph_edges": len(_behavior_graph.edges),
        "network_cluster": "Alpha Bot Network" if cluster_detected else "Isolated",
        "propagation_risk": "HIGH" if cluster_detected else "LOW",
    }
