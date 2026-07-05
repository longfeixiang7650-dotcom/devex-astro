#!/usr/bin/env python3
"""Search YouTube for tool review videos and return best-match video IDs.

Uses yt-dlp (via proxy) to search YouTube and get video metadata.
Falls back to innertube API if yt-dlp is unavailable.
"""

import json
import subprocess
import sys
import urllib.request
import urllib.parse
import re
import os

# Mihomo proxy for YouTube access
PROXY = "http://127.0.0.1:7890"

def search_via_innertube(query: str, max_results: int = 5) -> list[dict]:
    """Search YouTube using its internal API (no key needed)."""
    data = {
        "query": query,
        "context": {
            "client": {
                "clientName": "WEB",
                "clientVersion": "2.20240101.00.00"
            }
        }
    }
    
    req = urllib.request.Request(
        "https://www.youtube.com/youtubei/v1/search?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
        data=json.dumps(data).encode(),
        headers={"Content-Type": "application/json"}
    )
    
    proxy_handler = urllib.request.ProxyHandler({"https": PROXY, "http": PROXY})
    opener = urllib.request.build_opener(proxy_handler)
    
    try:
        resp = opener.open(req, timeout=15)
        result = json.loads(resp.read())
        
        videos = []
        contents = (
            result.get("contents", {})
            .get("twoColumnSearchResultsRenderer", {})
            .get("primaryContents", {})
            .get("sectionListRenderer", {})
            .get("contents", [])
        )
        
        for section in contents:
            items = section.get("itemSectionRenderer", {}).get("contents", [])
            for item in items:
                video_renderer = item.get("videoRenderer", {})
                if not video_renderer:
                    continue
                    
                video_id = video_renderer.get("videoId")
                title_runs = video_renderer.get("title", {}).get("runs", [])
                title = "".join(r.get("text", "") for r in title_runs)
                
                view_count_text = video_renderer.get("viewCount", {}).get("simpleText", "")
                # Extract numeric view count
                view_match = re.search(r'([\d,]+)', view_count_text.replace(" views", ""))
                view_count = 0
                if view_match:
                    view_str = view_match.group(1).replace(",", "")
                    if "万" in view_count_text or "万" in view_count_text:
                        view_count = int(float(view_str) * 10000)
                    elif "亿" in view_count_text:
                        view_count = int(float(view_str) * 100000000)
                    else:
                        view_count = int(view_str)
                
                # Get channel name
                channel_runs = video_renderer.get("ownerText", {}).get("runs", [])
                channel = "".join(r.get("text", "") for r in channel_runs) if channel_runs else ""
                
                length = video_renderer.get("lengthText", {}).get("simpleText", "")
                published = video_renderer.get("publishedTimeText", {}).get("simpleText", "")
                
                videos.append({
                    "id": video_id,
                    "title": title,
                    "views": view_count,
                    "channel": channel,
                    "length": length,
                    "published": published,
                    "url": f"https://www.youtube.com/watch?v={video_id}"
                })
        
        return videos
    except Exception as e:
        print(f"  [ERROR] InnerTube search failed: {e}", file=sys.stderr)
        return []


def search_via_ytdlp(query: str, max_results: int = 5) -> list[dict]:
    """Search using yt-dlp (requires yt-dlp installed)."""
    try:
        # Check if yt-dlp is available
        subprocess.run(["yt-dlp", "--version"], capture_output=True, timeout=5)
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return None  # Not available, fall back
    
    try:
        result = subprocess.run(
            ["yt-dlp", f"ytsearch{max_results}:{query}", "--dump-json", "--no-download"],
            capture_output=True, text=True, timeout=30,
            env={**os.environ, "http_proxy": PROXY, "https_proxy": PROXY}
        )
        
        videos = []
        for line in result.stdout.strip().split("\n"):
            if not line:
                continue
            data = json.loads(line)
            videos.append({
                "id": data["id"],
                "title": data.get("title", ""),
                "views": data.get("view_count", 0),
                "channel": data.get("channel", "") or data.get("uploader", ""),
                "length": data.get("duration_string", ""),
                "published": "",
                "url": f"https://www.youtube.com/watch?v={data['id']}"
            })
        
        return videos
    except Exception as e:
        print(f"  [ERROR] yt-dlp search failed: {e}", file=sys.stderr)
        return None


def get_best_video(tool_name: str) -> dict | None:
    """Get the best matching video for a tool."""
    query = f"{tool_name} review 2026 tutorial"
    
    print(f"  Searching: {query}")
    
    # Try yt-dlp first (more reliable)
    videos = search_via_ytdlp(query)
    
    # Fall back to innertube
    if videos is None:
        videos = search_via_innertube(query)
    
    if not videos:
        return None
    
    # Sort by views descending, pick the one with most relevant title
    videos.sort(key=lambda v: v["views"], reverse=True)
    
    best = videos[0]
    print(f"  Best: {best['title']} | {best['channel']} | {best['views']:,} views")
    return best


def main():
    if len(sys.argv) < 2:
        print("Usage: youtube_search.py <tool_name> [tool_name2 ...]")
        sys.exit(1)
    
    tool_names = sys.argv[1:]
    
    for name in tool_names:
        print(f"\n{'='*60}")
        print(f"🔍 {name}")
        print('='*60)
        video = get_best_video(name)
        if video:
            print(f"✅ Video ID: {video['id']}")
            print(f"   Embed URL: https://www.youtube.com/embed/{video['id']}")
            print(f"   Title: {video['title']}")
            print(f"   Views: {video['views']:,}")
            print(f"   Channel: {video['channel']}")
        else:
            print(f"❌ No video found for {name}")
    
    # Also output as JSON for script consumption
    results = {}
    for name in tool_names:
        video = get_best_video(name)
        if video:
            results[name] = video["id"]
    
    print(f"\n\n--- JSON OUTPUT ---")
    print(json.dumps(results))


if __name__ == "__main__":
    main()
