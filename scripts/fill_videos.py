#!/usr/bin/env python3
"""Fill remaining YouTube video IDs for devex-tools.net.
Runs in small batches to avoid 429 rate limits.
Checks existing IDs first, only searches empty ones.
"""

import json, time, urllib.request, urllib.parse, os

API_KEY = "AIzaSyAoMzLT49HjP6fN6VYrwwXX9xMgpkKSwYw"
PROXY = "http://127.0.0.1:7890"
BASE_URL = "https://www.googleapis.com/youtube/v3/search"
VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"

# Current youtube.ts file
YOUTUBE_TS = "/home/edi/devex-astro/src/data/youtube.ts"

PRIORITY = ["Fireship", "ThePrimeagen", "The PrimeTime", "freeCodeCamp",
            "NetworkChuck", "TechWorld with Nana", "DevOps Toolbox",
            "Nick Chapsas", "Hussein Nasser", "Web Dev Simplified",
            "Traversy Media", "Academind", "Tech With Tim",
            "Programming with Mosh", "The Net Ninja",
            "Savage Reviews", "Paperclick", "Code Bless You",
            "IBM Technology", "Google Cloud Tech", "AWS Online Tech Talks",
            "ByteByteGo", "Continuous Delivery"]


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
        if "error" in data:
            return None, data["error"]["message"]
        items = []
        for item in data.get("items", []):
            items.append({
                "id": item["id"]["videoId"],
                "title": item["snippet"]["title"],
                "channel": item["snippet"]["channelTitle"],
            })
        return items, None
    except Exception as e:
        return None, str(e)


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
        results, err = api_search(q, 5)
        if results is None:
            if "429" in str(err):
                return None, "RATE_LIMITED"
            continue
        time.sleep(1.8)
        for v in results:
            if v["id"] not in seen_ids:
                seen_ids.add(v["id"])
                score = 0
                if v["channel"] in PRIORITY:
                    score += 10
                tl = v["title"].lower()
                # Strong negative for irrelevant matches
                if tool_name.lower() in ["docker", "kubernetes", "jenkins", "terraform", "ansible", "helm"]:
                    if "vs" in tl: score += 6
                if "review" in tl: score += 5
                if "vs" in tl or "versus" in tl: score += 4
                if "best" in tl: score += 3
                if "tutorial" in tl or "guide" in tl: score += 1
                if tool_name.lower().split()[0] in tl.split()[:3]:
                    score += 2
                # Penalize if tool name not in title at all
                tool_words = tool_name.lower().split()
                if not any(w in tl for w in tool_words):
                    score -= 5
                all_videos[v["id"]] = {**v, "score": score}

    if not all_videos:
        return None, "NO_RESULTS"

    best = max(all_videos.values(), key=lambda v: v["score"])
    return best, None


def read_current_youtube_ts():
    """Parse current youtube.ts to get existing video IDs."""
    with open(YOUTUBE_TS) as f:
        content = f.read()
    
    videos = {}
    import re
    for m in re.finditer(r'"([^"]+)":\s*"([^"]*)"', content):
        tool_id, video_id = m.groups()
        if not video_id.startswith("TODO") and video_id:
            videos[tool_id] = video_id
    return videos


def write_youtube_ts(videos):
    """Write updated youtube.ts preserving comments."""
    content = """/**
 * YouTube video IDs for devex-tools.net tools.
 * Each video is the best available review/tutorial for the tool.
 * 
 * To update: run scripts/youtube_fill_remaining.py
 * Empty string = fallback to "Watch on YouTube" search link
 */
export const YOUTUBE_VIDEOS: Record<string, string> = {\n"""
    
    # Tool order from original file
    tool_order = [
        ("vscode", "IDEs & Code Editors"),
        ("intellij-idea", ""), ("sublime-text", ""), ("vim", ""),
        ("eclipse-ide", ""), ("neovim", ""), ("webstorm", ""),
        ("xcode", ""), ("android-studio", ""), ("pycharm", ""),
        ("", "Version Control"),
        ("github", ""), ("gitlab", ""), ("bitbucket", ""),
        ("sourceforge", ""), ("apache-subversion", ""),
        ("", "CI/CD"),
        ("jenkins", ""), ("github-actions", ""), ("circleci", ""),
        ("gitlab-ci-cd", ""), ("travis-ci", ""), ("teamcity", ""),
        ("bamboo", ""), ("argocd", ""), ("spinnaker", ""), ("drone-ci", ""),
        ("", "API Development"),
        ("postman", ""), ("swagger", ""), ("insomnia", ""),
        ("hoppscotch", ""), ("apollo-graphql", ""), ("rapidapi", ""),
        ("", "Database Tools"),
        ("dbeaver", ""), ("pgadmin", ""), ("mongodb-compass", ""),
        ("tableplus", ""), ("datagrip", ""), ("mysql-workbench", ""),
        ("redisinsight", ""), ("studio-3t", ""),
        ("", "Container & Orchestration"),
        ("docker", ""), ("kubernetes", ""), ("terraform", ""),
        ("ansible", ""), ("helm", ""), ("podman", ""), ("vagrant", ""),
        ("packer", ""),
        ("", "Monitoring & Debugging"),
        ("datadog", ""), ("sentry", ""), ("grafana", ""),
        ("prometheus", ""), ("new-relic", ""), ("splunk", ""),
        ("elasticsearch", ""), ("jaeger", ""), ("opentelemetry", ""),
        ("chronosphere", ""),
        ("", "Test Automation"),
        ("jest", ""), ("selenium", ""), ("cypress", ""),
    ]
    
    for tool_id, section in tool_order:
        if not tool_id:
            content += f"\n  // {section}\n"
            continue
        vid = videos.get(tool_id, "")
        if vid:
            content += f'  "{tool_id}": "{vid}",\n'
        else:
            content += f'  "{tool_id}": "",\n'
    
    content += "};\n"
    
    with open(YOUTUBE_TS, "w") as f:
        f.write(content)
    
    print(f"  Written to {YOUTUBE_TS}")


def main():
    current = read_current_youtube_ts()
    
    # Tools that need videos
    needing = {
        "eclipse-ide": "Eclipse IDE",
        "jenkins": "Jenkins",
        "bamboo": "Bamboo CI/CD",
        "spinnaker": "Spinnaker CI/CD", 
        "drone-ci": "Drone CI",
        "rapidapi": "RapidAPI",
        "dbeaver": "DBeaver",
        "mysql-workbench": "MySQL Workbench",
        "redisinsight": "RedisInsight",
        "studio-3t": "Studio 3T",
        "docker": "Docker",
        "kubernetes": "Kubernetes",
        "terraform": "Terraform",
        "ansible": "Ansible",
        "helm": "Helm",
        "vagrant": "Vagrant",
        "packer": "Packer",
        "datadog": "Datadog",
        "sentry": "Sentry",
        "grafana": "Grafana",
        "prometheus": "Prometheus",
        "new-relic": "New Relic",
        "splunk": "Splunk",
        "elasticsearch": "Elasticsearch",
        "jaeger": "Jaeger",
        "opentelemetry": "OpenTelemetry",
        "chronosphere": "Chronosphere",
        "jest": "Jest",
        "selenium": "Selenium",
        "cypress": "Cypress",
        "apache-subversion": "Apache Subversion",
    }
    
    # Re-check existing known-good ones
    known_good = {
        "vscode": "AdygBbbEnco",
        "intellij-idea": "gJrjgg1KVL4",
        "sublime-text": "-6ikAMmu3Nc",
        "vim": "AsoaYO_TDKw",
        "neovim": "7xFOxIrHyHE",
        "webstorm": "h55emgImrLk",
        "xcode": "8PhdfcX9tG0",
        "android-studio": "L0AUi4Qn7g8",
        "pycharm": "eXinDi55iOk",
        "github": "R8_veQiYBjI",
        "gitlab": "qP8kir2GUgo",
        "bitbucket": "",
        "sourceforge": "f3POJdp79Mc",
        "github-actions": "JSuS-zXMVwE",
        "circleci": "1HpEagsIY2o",
        "gitlab-ci-cd": "qP8kir2GUgo",
        "travis-ci": "JsEd6dpLGbs",
        "teamcity": "Byk9XQtaNzY",
        "argocd": "MeU5_k9ssrs",
        "postman": "CLG0ha_a0q8",
        "swagger": "8yI4gD1HruY",
        "insomnia": "ged7dQmnmlQ",
        "hoppscotch": "tibdI9KnQec",
        "apollo-graphql": "eIQh02xuVw4",
        "pgadmin": "n2Fluyr3lbc",
        "mongodb-compass": "-bt_y4Loofg",
        "tableplus": "BW-YO9fqFho",
        "datagrip": "BW-YO9fqFho",
        "podman": "e6Q-P-60qis",
    }
    
    # Merge: known good take priority
    all_videos = {**known_good}
    
    print(f"Known good: {sum(1 for v in all_videos.values() if v)} videos")
    print(f"Needing fill: {len(needing)} tools")
    print("=" * 60)
    
    # Process in batches
    batch_size = 3  # Small batches to avoid 429
    batch = []
    batch_num = 0
    
    for tool_id, tool_name in needing.items():
        batch.append((tool_id, tool_name))
        if len(batch) >= batch_size:
            batch_num += 1
            print(f"\n--- Batch {batch_num} ---")
            for tid, tname in batch:
                print(f"  {tname}...", end=" ", flush=True)
                video, err = pick_best(tname, tid)
                if video is None:
                    if err == "RATE_LIMITED":
                        print(f"⏸ RATE LIMITED. Saving and stopping.")
                        all_videos[tid] = ""
                    else:
                        print(f"❌ {err}")
                        all_videos[tid] = ""
                else:
                    print(f"✅ {video['channel']} — {video['title'][:50]}")
                    all_videos[tid] = video["id"]
            
            write_youtube_ts({**known_good, **all_videos})
            
            if err == "RATE_LIMITED":
                return
            
            # Longer pause between batches
            print("  Cooling down 5s...")
            time.sleep(5)
            batch = []
    
    # Final write
    write_youtube_ts(all_videos)
    print(f"\n{'='*60}")
    print(f"Final: {sum(1 for v in all_videos.values() if v)}/{len(all_videos)} tools have videos")


if __name__ == "__main__":
    main()
