#!/usr/bin/env python3
"""Batch screenshot tool: Take screenshots of tool websites using browser automation."""
import json, os, time, re, subprocess

TOOLS_FILE = '/tmp/tools_for_screenshots.json'
OUTPUT_DIR = '/home/edi/devex-astro/public/screenshots'

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Read tools from tools.ts
with open('/home/edi/devex-astro/src/data/tools.ts') as f:
    content = f.read()

urls = re.findall(r'websiteUrl:\s*"([^"]+)"', content)
names = re.findall(r'name:\s*"([^"]+)"', content)

tools = list(zip(names, urls))
print(f"Found {len(tools)} tools")

# Generate the screenshot IDs (same as tool IDs)
ids = re.findall(r'id:\s*"([^"]+)"', content)
print(f"Found {len(ids)} tool IDs")

# Create screenshot script for each tool
existing = os.listdir(OUTPUT_DIR)
print(f"Existing screenshots: {len(existing)}")

# Build a list of tools that need screenshots
need_screenshot = []
for i, (name, url) in enumerate(tools):
    # Use id if available, otherwise generate from name
    # Simple approach: just use index
    tool_id = ids[i] if i < len(ids) else name.lower().replace(' ', '-')
    filename = f"{tool_id}.png"
    if filename not in existing:
        need_screenshot.append((tool_id, name, url))

print(f"Need screenshots: {len(need_screenshot)}")
# Save for the browser automation
with open('/tmp/need_screenshot.json', 'w') as f:
    json.dump(need_screenshot[:5], f, indent=2)  # Start with first 5 as test

print("\nFirst 5 to screenshot:")
for i, (tid, name, url) in enumerate(need_screenshot[:10]):
    print(f"  {tid:20s} {name:30s} {url}")
