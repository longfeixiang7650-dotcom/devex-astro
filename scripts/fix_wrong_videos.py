#!/usr/bin/env python3
"""Fix known wrong YouTube videos in youtube.ts via targeted searches."""
import json, time, urllib.request, urllib.parse, re

KEY_FILE = "/tmp/youtube_key.txt"
with open(KEY_FILE) as f:
    API_KEY = f.read().strip()

PROXY = "http://127.0.0.1:7890"
BASE_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_TS = "/home/edi/devex-astro/src/data/youtube.ts"

PRIORITY = ["Fireship", "ThePrimeagen", "The PrimeTime", "freeCodeCamp",
            "NetworkChuck", "TechWorld with Nana", "DevOps Toolbox",
            "Nick Chapsas", "Hussein Nasser", "Web Dev Simplified",
            "Traversy Media", "Academind", "Tech With Tim",
            "Programming with Mosh", "The Net Ninja",
            "IBM Technology", "Google Cloud Tech", "ByteByteGo",
            "CNCF", "Jaeger", "Chronosphere", "Observability", "DevOps"]


def api_search(query, max_results=6):
    params = urllib.parse.urlencode({
        "part": "snippet", "q": query, "order": "viewCount",
        "maxResults": max_results, "type": "video", "key": API_KEY,
    })
    opener = urllib.request.build_opener(
        urllib.request.ProxyHandler({"https": PROXY, "http": PROXY}))
    try:
        resp = opener.open(f"{BASE_URL}?{params}", timeout=15)
        data = json.loads(resp.read())
        if "error" in data:
            return None, data["error"].get("message", "unknown")
        return [{"id": i["id"]["videoId"],
                 "title": i["snippet"]["title"],
                 "channel": i["snippet"]["channelTitle"]}
                for i in data.get("items", [])], None
    except Exception as e:
        return None, str(e)


def pick_best(queries, must_have):
    """must_have: list of lowercase words, at least one must appear in title."""
    seen, scored = set(), {}
    for q in queries:
        results, err = api_search(q, 6)
        if results is None:
            if "429" in str(err):
                return None, "RATE_LIMITED"
            continue
        time.sleep(2.0)
        for v in results:
            if v["id"] in seen:
                continue
            seen.add(v["id"])
            tl = v["title"].lower()
            # Hard relevance gate: at least one qualifier keyword must be present
            if must_have and not any(k in tl for k in must_have):
                continue
            score = 0
            if v["channel"] in PRIORITY:
                score += 10
            if "review" in tl: score += 5
            if "tutorial" in tl or "guide" in tl or "explained" in tl: score += 4
            if "intro" in tl or "overview" in tl: score += 3
            # strong brand match
            if any(k in tl for k in must_have):
                score += 4
            scored[v["id"]] = {**v, "score": score}
    if not scored:
        return None, "NO_RESULTS"
    return max(scored.values(), key=lambda v: v["score"]), None


def set_video(tool_id, video_id, channel, title):
    with open(YOUTUBE_TS) as f:
        content = f.read()
    # Match full entry line: indentation + key + old value + trailing comma + comment
    m = re.search(rf'^(\s*"{tool_id}":\s*)"[^"]*"(\s*,)?\s*(//.*)?$', content, re.MULTILINE)
    if not m:
        return False
    comment = f" // {channel} — {title[:50]}" if channel else ""
    new_line = f'{m.group(1)}"{video_id}",{comment}'
    content = content[:m.start()] + new_line + content[m.end():]
    with open(YOUTUBE_TS, "w") as f:
        f.write(content)
    return True


TARGETS = {
    "packer": (["HashiCorp Packer tutorial", "HashiCorp Packer machine image",
                "Packer infrastructure as code explained"],
               ["packer", "hashicorp"]),
    "sentry": (["Sentry error monitoring tutorial", "Sentry.io error tracking",
                "Sentry application performance monitoring"],
               ["sentry", "error", "monitoring"]),
    "jaeger": (["Jaeger distributed tracing tutorial", "Jaeger tracing Kubernetes",
                "Jaeger observability explained"],
               ["jaeger", "tracing"]),
    "chronosphere": (["Chronosphere observability platform", "Chronosphere monitoring",
                      "Chronosphere cloud native"],
                     ["chronosphere"]),
}


def main():
    updated = []
    for tool_id, (queries, must) in TARGETS.items():
        print(f"Searching {tool_id} ...", flush=True)
        video, err = pick_best(queries, must)
        if video is None:
            print(f"  {err if err == 'RATE_LIMITED' else 'no good result'}", flush=True)
            if err == "RATE_LIMITED":
                print("RATE LIMITED — stopping", flush=True)
                break
            continue
        ok = set_video(tool_id, video["id"], video["channel"], video["title"])
        if ok:
            updated.append(tool_id)
            print(f"  ✅ {video['channel']} — {video['title'][:60]}", flush=True)
        else:
            print(f"  failed to update {tool_id}", flush=True)
    print("UPDATED:", updated, flush=True)
    with open("/tmp/fix_wrong_videos_result.json", "w") as f:
        json.dump({"updated": updated}, f)


if __name__ == "__main__":
    main()
