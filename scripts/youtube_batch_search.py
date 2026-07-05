#!/usr/bin/env python3
"""Batch search YouTube for best review video per tool.

Picks the highest-viewed video from multiple search queries.
Outputs a JSON mapping of tool IDs to video IDs.
"""

import json, sys, time, urllib.request, urllib.parse

API_KEY = "AIzaSyAoMzLT49HjP6fN6VYrwwXX9xMgpkKSwYw"
PROXY = "http://127.0.0.1:7890"
BASE_URL = "https://www.googleapis.com/youtube/v3/search"

# Tools list (id + name)
TOOLS = [
    ("vscode", "Visual Studio Code"), ("intellij-idea", "IntelliJ IDEA"),
    ("sublime-text", "Sublime Text"), ("vim", "Vim"), ("eclipse-ide", "Eclipse IDE"),
    ("neovim", "Neovim"), ("webstorm", "WebStorm"), ("xcode", "Xcode"),
    ("android-studio", "Android Studio"), ("pycharm", "PyCharm"),
    ("github", "GitHub"), ("gitlab", "GitLab"), ("bitbucket", "Bitbucket"),
    ("sourceforge", "SourceForge"), ("apache-subversion", "Apache Subversion"),
    ("jenkins", "Jenkins"), ("github-actions", "GitHub Actions"),
    ("circleci", "CircleCI"), ("gitlab-ci-cd", "GitLab CI/CD"),
    ("travis-ci", "Travis CI"), ("teamcity", "TeamCity"),
    ("bamboo", "Bamboo"), ("argocd", "ArgoCD"), ("spinnaker", "Spinnaker"),
    ("drone-ci", "Drone CI"),
    ("postman", "Postman"), ("swagger", "Swagger"), ("insomnia", "Insomnia"),
    ("hoppscotch", "Hoppscotch"), ("apollo-graphql", "Apollo GraphQL"),
    ("rapidapi", "RapidAPI"),
    ("dbeaver", "DBeaver"), ("pgadmin", "pgAdmin"), ("mongodb-compass", "MongoDB Compass"),
    ("tableplus", "TablePlus"), ("datagrip", "DataGrip"),
    ("mysql-workbench", "MySQL Workbench"), ("redisinsight", "RedisInsight"),
    ("studio-3t", "Studio 3T"),
    ("docker", "Docker"), ("kubernetes", "Kubernetes"),
    ("terraform", "Terraform"), ("ansible", "Ansible"), ("helm", "Helm"),
    ("podman", "Podman"), ("vagrant", "Vagrant"), ("packer", "Packer"),
    ("datadog", "Datadog"), ("sentry", "Sentry"), ("grafana", "Grafana"),
    ("prometheus", "Prometheus"), ("new-relic", "New Relic"),
    ("splunk", "Splunk"), ("elasticsearch", "Elasticsearch"),
    ("jaeger", "Jaeger"), ("opentelemetry", "OpenTelemetry"),
    ("chronosphere", "Chronosphere"),
    ("jest", "Jest"), ("selenium", "Selenium"), ("cypress", "Cypress"),
]


def api_search(query, max_results=5):
    """Search YouTube API and return video items."""
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
        print(f"  [ERROR] API: {e}", file=sys.stderr)
        return []


def pick_best_video(tool_name, tool_id):
    """Try multiple search queries and pick the best one."""
    queries = [
        f"{tool_name} review",
        f"{tool_name} vs alternative",
        f"{tool_name} tutorial review 2026",
        f"best {tool_name} overview",
    ]
    
    # Priority channels (known tech reviewers)
    PRIORITY = ["Fireship", "ThePrimeagen", "The PrimeTime", "freeCodeCamp", 
                "NetworkChuck", "TechWorld with Nana", "Coderized", "DevOps Toolbox",
                "Java Brains", "Hussein Nasser", "Nick Chapsas", "Web Dev Simplified",
                "Traversy Media", "Academind", "CS Dojo", "Corey Schafer",
                "Tech With Tim", "Programming with Mosh", "The Net Ninja"]
    
    all_videos = {}
    seen_ids = set()
    
    for q in queries:
        results = api_search(q, 5)
        for v in results:
            if v["id"] not in seen_ids:
                seen_ids.add(v["id"])
                # Score: +10 if in priority channel, +5 if title has 'review' or 'vs'
                score = 0
                if v["channel"] in PRIORITY:
                    score += 10
                title_lower = v["title"].lower()
                if "review" in title_lower: score += 5
                if "vs" in title_lower or "versus" in title_lower: score += 4
                if "best" in title_lower: score += 3
                if "tutorial" in title_lower or "guide" in title_lower: score += 1
                # Boost if tool name is early in title
                if tool_name.lower().split()[0] in title_lower.split()[:3]:
                    score += 2
                all_videos[v["id"]] = {**v, "score": score}
    
    if not all_videos:
        return None
    
    # Sort by score descending, pick best
    best = max(all_videos.values(), key=lambda v: v["score"])
    return best


def main():
    results = {}
    
    print(f"Searching YouTube for {len(TOOLS)} tools...")
    print("=" * 60)
    
    for i, (tool_id, tool_name) in enumerate(TOOLS):
        print(f"[{i+1}/{len(TOOLS)}] {tool_name}...", end=" ", flush=True)
        video = pick_best_video(tool_name, tool_id)
        
        if video:
            results[tool_id] = video["id"]
            print(f"✅ {video['channel']} — {video['title'][:60]}")
        else:
            results[tool_id] = ""
            print("❌ No video found")
        
        # Rate limit: 1 request per second (API quota: 100 per search)
        time.sleep(1.2)
    
    # Save results
    output = {"_meta": {"generated_by": "youtube_batch_search.py", "api_key": API_KEY[:10] + "..."}, "videos": results}
    with open("youtube_video_ids.json", "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\n{'='*60}")
    print(f"Total: {sum(1 for v in results.values() if v)}/{len(results)} tools have videos")
    print(f"Saved to: youtube_video_ids.json")


if __name__ == "__main__":
    main()
