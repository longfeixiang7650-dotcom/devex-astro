#!/usr/bin/env python3
"""Batch fill all remaining 16 YouTube videos with fresh API key.
No rate limiting expected since this is a brand new key.
"""
import json, time, urllib.request, urllib.parse, re

API_KEY = "AIzaSyDekygOiwMTuDgQZSy5NljxPpmPWK5lmfI"
PROXY = "http://127.0.0.1:7890"
BASE = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_TS = "/home/edi/devex-astro/src/data/youtube.ts"

PRIORITY = ["Fireship","ThePrimeagen","The PrimeTime","freeCodeCamp",
            "NetworkChuck","TechWorld with Nana","DevOps Toolbox",
            "Nick Chapsas","Hussein Nasser","Web Dev Simplified",
            "Traversy Media","Tech With Tim","Programming with Mosh",
            "IBM Technology","Google Cloud Tech","ByteByteGo"]

REMAINING = [
    ("eclipse-ide","Eclipse IDE"),
    ("bitbucket","Bitbucket"),
    ("apache-subversion","Apache Subversion"),
    ("bamboo","Bamboo"),
    ("drone-ci","Drone CI"),
    ("rapidapi","RapidAPI"),
    ("mysql-workbench","MySQL Workbench"),
    ("redisinsight","RedisInsight"),
    ("packer","Packer"),
    ("sentry","Sentry"),
    ("jaeger","Jaeger"),
    ("opentelemetry","OpenTelemetry"),
    ("chronosphere","Chronosphere"),
    ("jest","Jest"),
    ("selenium","Selenium"),
    ("cypress","Cypress"),
]

def api_search(query, max_results=5):
    params = urllib.parse.urlencode({"part":"snippet","q":query,"order":"viewCount","maxResults":max_results,"type":"video","key":API_KEY})
    proxy = urllib.request.ProxyHandler({"https":PROXY,"http":PROXY})
    opener = urllib.request.build_opener(proxy)
    try:
        resp = opener.open(f"{BASE}?{params}", timeout=15)
        data = json.loads(resp.read())
        if "error" in data:
            return None, data["error"]["message"]
        return [{"id":i["id"]["videoId"],"title":i["snippet"]["title"],"channel":i["snippet"]["channelTitle"]} for i in data.get("items",[])], None
    except Exception as e:
        return None, str(e)

def pick_best(tool_name):
    queries = [f"{tool_name} review", f"{tool_name} vs alternative", f"best {tool_name} overview", f"{tool_name} tutorial"]
    all_v, seen = {}, set()
    for q in queries:
        results, err = api_search(q, 5)
        if results is None:
            if "429" in str(err): return None, "RATE_LIMITED"
            continue
        time.sleep(1.2)
        for v in results:
            if v["id"] in seen: continue
            seen.add(v["id"])
            score = 10 if v["channel"] in PRIORITY else 0
            tl = v["title"].lower()
            if "review" in tl: score += 5
            if "vs" in tl: score += 4
            if "best" in tl: score += 3
            if "tutorial" in tl: score += 1
            if tool_name.lower().split()[0] in tl.split()[:3]: score += 2
            if not any(w in tl for w in tool_name.lower().split()): score -= 5
            all_v[v["id"]] = {**v, "score": score}
    if not all_v: return None, "NO_RESULTS"
    return max(all_v.values(), key=lambda v: v["score"]), None

def update_ts(tool_id, video_id, channel, title):
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
    # Try with existing comment
    for line in content.split('\n'):
        if f'"{tool_id}":' in line:
            old_line = line.strip()
            new_line = f'  "{tool_id}": "{video_id}",{comment}'
            content = content.replace(old_line, new_line, 1)
            with open(YOUTUBE_TS, "w") as f:
                f.write(content)
            return True
    return False

success = 0
failed = 0
rate_limited = False

print(f"Searching {len(REMAINING)} remaining tools with fresh API key...")
print("="*60)

for i, (tid, tname) in enumerate(REMAINING):
    print(f"[{i+1}/{len(REMAINING)}] {tname}...", end=" ", flush=True)
    video, err = pick_best(tname)
    if video:
        ok = update_ts(tid, video["id"], video["channel"], video["title"])
        if ok:
            print(f"✅ {video['channel']} — {video['title'][:60]}")
            success += 1
        else:
            print(f"⚠️ Found but couldn't update file")
    else:
        if err == "RATE_LIMITED":
            print("⏸ RATE LIMITED")
            rate_limited = True
            break
        else:
            print(f"❌ {err}")
            failed += 1
    time.sleep(1.5)

print(f"\n{'='*60}")
print(f"✅ New videos: {success}")
print(f"❌ Failed: {failed}")
if rate_limited:
    print("⚠️ Rate limited — run again later with remaining tools")
