#!/usr/bin/env python3
"""Search YouTube for remaining tools that have no video ID.
Lower frequency to avoid 429 rate limits.

Output: JSON with tool_id -> video_id mapping
"""

import json, sys, time, urllib.request, urllib.parse

API_KEY = "AIzaSyAoMzLT49HjP6fN6VYrwwXX9xMgpkKSwYw"
PROXY = "http://127.0.0.1:7890"
BASE_URL = "https://www.googleapis.com/youtube/v3/search"

REMAINING = [
    ("rapidapi", "RapidAPI"),
    ("dbeaver", "DBeaver"),
    ("mysql-workbench", "MySQL Workbench"),
    ("redisinsight", "RedisInsight"),
    ("studio-3t", "Studio 3T"),
    ("docker", "Docker"),
    ("kubernetes", "Kubernetes"),
    ("ansible", "Ansible"),
    ("helm", "Helm"),
    ("vagrant", "Vagrant"),
    ("packer", "Packer"),
    ("datadog", "Datadog"),
    ("sentry", "Sentry"),
    ("grafana", "Grafana"),
    ("prometheus", "Prometheus"),
    ("new-relic", "New Relic"),
    ("splunk", "Splunk"),
    ("elasticsearch", "Elasticsearch"),
    ("jaeger", "Jaeger"),
    ("opentelemetry", "OpenTelemetry"),
    ("chronosphere", "Chronosphere"),
    ("jest", "Jest"),
    ("selenium", "Selenium"),
    ("cypress", "Cypress"),
]

PRIORITY = ["Fireship", "ThePrimeagen", "The PrimeTime", "freeCodeCamp",
            "NetworkChuck", "TechWorld with Nana", "DevOps Toolbox",
            "Nick Chapsas", "Hussein Nasser", "Web Dev Simplified",
            "Traversy Media", "Academind", "Tech With Tim",
            "Programming with Mosh", "The Net Ninja",
            "Savage Reviews", "Paperclick", "Code Bless You"]


def api_search(query, max_results=5):
    params = urllib.parse.urlencode({
        "part": "snippet",
        "q": query,
        "order": "viewCount",
        "maxResults": max_results,
        "type": "video",
        "key": API_KEY,
    })
    url = f"{BASE_URL}?{params}"
    proxy_hdlr = urllib.request.ProxyHandler({"https": PROXY, "http": PROXY})
    opener = urllib.request.build_opener(proxy_hdlr)

    try:
        resp = opener.open(url, timeout=15)
        data = json.loads(resp.read())
        items = []
        for item in data.get("items", []):
            vid = item["id"]["videoId"]
            title = item["snippet"]["title"]
            channel = item["snippet"]["channelTitle"]
            items.append({"id": vid, "title": title, "channel": channel})
        return items
    except Exception as e:
        print(f"  [ERROR] {e}", file=sys.stderr)
        return []


def pick_best(tool_name, tool_id):
    queries = [
        f"{tool_name} review",
        f"{tool_name} vs alternative",
        f"best {tool_name} overview",
        f"{tool_name} tutorial",
    ]

    all_videos = {}
    seen_ids = set()

    for q in queries:
        results = api_search(q, 5)
        time.sleep(1.5)  # Rate limit buffer
        for v in results:
            if v["id"] not in seen_ids:
                seen_ids.add(v["id"])
                score = 0
                if v["channel"] in PRIORITY:
                    score += 10
                tl = v["title"].lower()
                if "review" in tl: score += 5
                if "vs" in tl or "versus" in tl: score += 4
                if "best" in tl: score += 3
                if "tutorial" in tl or "guide" in tl: score += 1
                if tool_name.lower().split()[0] in tl.split()[:3]:
                    score += 2
                all_videos[v["id"]] = {**v, "score": score}

    if not all_videos:
        # Last resort: single broader search
        results = api_search(f"{tool_name} 2026", 3)
        if results:
            all_videos[results[0]["id"]] = {**results[0], "score": 0}

    if not all_videos:
        return None
    return max(all_videos.values(), key=lambda v: v["score"])


def main():
    results = {}
    print(f"Searching {len(REMAINING)} remaining tools...")
    print("=" * 60)

    for i, (tool_id, tool_name) in enumerate(REMAINING):
        print(f"[{i+1}/{len(REMAINING)}] {tool_name}...", end=" ", flush=True)
        video = pick_best(tool_name, tool_id)

        if video:
            results[tool_id] = video["id"]
            print(f"✅ {video['channel']} — {video['title'][:60]}")
        else:
            results[tool_id] = ""
            print("❌ No video found")

    with open("youtube_remaining.json", "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n{'='*60}")
    print(f"Got: {sum(1 for v in results.values() if v)}/{len(REMAINING)}")
    print("Saved to: youtube_remaining.json")


if __name__ == "__main__":
    main()
