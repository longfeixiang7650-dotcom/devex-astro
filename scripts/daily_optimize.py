#!/usr/bin/env python3
"""
Daily site optimization task for devex-tools.net.
1. Fill remaining YouTube video IDs (with rate limit retry)
2. Rebuild and deploy when new videos are found
3. Log progress

Run this as a cron job. It handles YouTube API rate limits gracefully.
"""

import json, time, urllib.request, urllib.parse, os, sys, re
from pathlib import Path

API_KEY = "AIzaSyAoMzLT49HjP6fN6VYrwwXX9xMgpkKSwYw"
PROXY = "http://127.0.0.1:7890"
BASE_URL = "https://www.googleapis.com/youtube/v3/search"

PROJECT_DIR = "/home/edi/devex-astro"
YOUTUBE_TS = f"{PROJECT_DIR}/src/data/youtube.ts"
LOG_FILE = f"{PROJECT_DIR}/optimization_log.json"

PRIORITY = ["Fireship", "ThePrimeagen", "The PrimeTime", "freeCodeCamp",
            "NetworkChuck", "TechWorld with Nana", "DevOps Toolbox",
            "Nick Chapsas", "Hussein Nasser", "Web Dev Simplified",
            "Traversy Media", "Academind", "Tech With Tim",
            "Programming with Mosh", "The Net Ninja",
            "Savage Reviews", "Paperclick", "Code Bless You",
            "IBM Technology", "Google Cloud Tech", "ByteByteGo"]


def log(msg):
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}")
    sys.stdout.flush()


def api_search(query, max_results=5):
    params = urllib.parse.urlencode({
        "part": "snippet", "q": query, "order": "viewCount",
        "maxResults": max_results, "type": "video", "key": API_KEY,
    })
    proxy_hdlr = urllib.request.ProxyHandler({"https": PROXY, "http": PROXY})
    opener = urllib.request.build_opener(proxy_hdlr)
    try:
        resp = opener.open(f"{BASE_URL}?{params}", timeout=15)
        data = json.loads(resp.read())
        if "error" in data:
            return None, data["error"]["message"]
        return [{"id": i["id"]["videoId"],
                 "title": i["snippet"]["title"],
                 "channel": i["snippet"]["channelTitle"]}
                for i in data.get("items", [])], None
    except Exception as e:
        return None, str(e)


def pick_best(tool_name):
    queries = [f"{tool_name} review", f"{tool_name} vs alternative",
               f"best {tool_name} overview", f"{tool_name} tutorial"]
    all_videos, seen_ids = {}, set()

    for q in queries:
        results, err = api_search(q, 5)
        if results is None:
            if "429" in str(err):
                return None, "RATE_LIMITED"
            continue
        time.sleep(2.0)
        for v in results:
            if v["id"] in seen_ids:
                continue
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
            if not any(w in tl for w in tool_name.lower().split()):
                score -= 5
            all_videos[v["id"]] = {**v, "score": score}

    if not all_videos:
        return None, "NO_RESULTS"
    return max(all_videos.values(), key=lambda v: v["score"]), None


def get_empty_tools():
    """Get list of tools with empty video IDs."""
    with open(YOUTUBE_TS) as f:
        content = f.read()
    entries = re.findall(r'"([a-z0-9_-]+)":\s+""', content)
    return entries


def set_video_id(tool_id, video_id, channel, title):
    """Update a tool's video ID in the TS file."""
    with open(YOUTUBE_TS) as f:
        content = f.read()
    
    old = f'"{tool_id}": ""'
    comment = f" // {channel} — {title[:50]}" if channel else ""
    new = f'"{tool_id}": "{video_id}"{comment}'
    
    if old in content:
        content = content.replace(old, new, 1)
        with open(YOUTUBE_TS, "w") as f:
            f.write(content)
        return True
    return False


def deploy():
    """Build and deploy to Vercel."""
    log("Building...")
    ret = os.system(f"cd {PROJECT_DIR} && npm run build 2>&1 | tail -3")
    if ret != 0:
        log("BUILD FAILED")
        return False
    
    log("Deploying to Vercel...")
    ret = os.system(f"cd {PROJECT_DIR} && bash ~/.hermes/scripts/vercel-deploy.sh {PROJECT_DIR} 2>&1 | tail -3")
    if ret != 0:
        log("DEPLOY FAILED")
        return False
    
    log("Deploy successful!")
    return True


def main():
    log("=== Daily Optimization: devex-tools.net ===")
    
    # Load previous run state
    state = {"batch": 0, "completed": 0, "rate_limited": False}
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE) as f:
                state = json.load(f)
        except: pass
    
    # If was rate limited last time, check if we can try again
    if state.get("rate_limited"):
        log("Previous run was rate limited. Waiting 2 minutes before retry...")
        time.sleep(120)
    
    # Get tools that still need videos
    empty_tools = get_empty_tools()
    log(f"Tools needing videos: {len(empty_tools)}")
    
    if not empty_tools:
        log("All tools have videos! Optimization complete.")
        # Reset state
        with open(LOG_FILE, "w") as f:
            json.dump({"batch": 0, "completed": len(get_empty_tools()), "rate_limited": False}, f)
        return
    
    # Process in small batches (3 per run to stay under rate limits)
    batch = empty_tools[:3]
    batch_num = state.get("batch", 0) + 1
    
    log(f"Batch {batch_num}: {', '.join(batch)}")
    
    any_updated = False
    for tool_id in batch:
        # Get proper tool name from the file
        # Map known IDs to display names
        name_map = {
            "eclipse-ide": "Eclipse IDE", "bitbucket": "Bitbucket",
            "apache-subversion": "Apache Subversion", "bamboo": "Bamboo",
            "drone-ci": "Drone CI", "rapidapi": "RapidAPI",
            "mysql-workbench": "MySQL Workbench", "redisinsight": "RedisInsight",
            "packer": "Packer", "sentry": "Sentry",
            "jaeger": "Jaeger", "opentelemetry": "OpenTelemetry",
            "chronosphere": "Chronosphere",
            "jest": "Jest", "selenium": "Selenium", "cypress": "Cypress",
        }
        tool_name = name_map.get(tool_id, tool_id.replace("-", " ").title())
        
        log(f"  Searching: {tool_name}...")
        video, err = pick_best(tool_name)
        
        if video is None:
            if err == "RATE_LIMITED":
                log("RATE LIMITED")
                with open(LOG_FILE, "w") as f:
                    json.dump({"batch": batch_num - 1, "completed": 0,
                               "rate_limited": True}, f)
                return
            log(f"No results")
            continue
        
        ok = set_video_id(tool_id, video["id"], video["channel"], video["title"])
        if ok:
            any_updated = True
            log(f"✅ {video['channel']} — {video['title'][:50]}")
        else:
            log(f"Failed to update {tool_id}")
    
    # Save state
    remaining = get_empty_tools()
    with open(LOG_FILE, "w") as f:
        json.dump({
            "batch": batch_num,
            "completed": len(empty_tools) - len(remaining),
            "rate_limited": False,
            "remaining": len(remaining),
            "total_with_video": 60 - len(remaining),
        }, f, indent=2)
    
    log(f"Remaining: {len(remaining)} tools")
    
    if any_updated:
        deploy()
    else:
        log("No updates to deploy")


if __name__ == "__main__":
    main()
