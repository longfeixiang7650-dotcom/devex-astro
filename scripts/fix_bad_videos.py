#!/usr/bin/env python3
"""Quick search for specific tools that got wrong results."""
import json, urllib.request, urllib.parse

API_KEY = "AIzaSyAoMzLT49HjP6fN6VYrwwXX9xMgpkKSwYw"
PROXY = "http://127.0.0.1:7890"
BASE = "https://www.googleapis.com/youtube/v3/search"

searches = [
    ("eclipse-ide", '"Eclipse IDE" tools review'),
    ("drone-ci", '"Drone CI" CD review'),
    ("studio-3t", '"Studio 3T" MongoDB tool'),
    ("sentry", '"Sentry" error monitoring review'),
    ("new-relic", '"New Relic" observability review'),
    ("splunk", '"Splunk" tutorial review'),
    ("elasticsearch", '"Elasticsearch" tutorial'),
    ("packer", '"Packer" HashiCorp tutorial'),
    ("bamboo", '"Bamboo" Atlassian CI CD'),
]

proxy = urllib.request.ProxyHandler({"https": PROXY, "http": PROXY})
opener = urllib.request.build_opener(proxy)

for tool_id, query in searches:
    params = urllib.parse.urlencode({
        "part": "snippet", "q": query, "order": "viewCount",
        "maxResults": 3, "type": "video", "key": API_KEY,
    })
    try:
        resp = opener.open(f"{BASE}?{params}", timeout=15)
        data = json.loads(resp.read())
        items = data.get("items", [])
        if items:
            v = items[0]
            print(f'{tool_id}: "{v["id"]["videoId"]}"  # {v["snippet"]["channelTitle"]} — {v["snippet"]["title"][:60]}')
        else:
            print(f'{tool_id}: ""  # No results')
    except Exception as e:
        print(f'{tool_id}: ""  # Error: {e}')
