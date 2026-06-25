#!/usr/bin/env python3
"""Batch screenshots using Playwright."""
import asyncio
import json
import os
import re
from playwright.async_api import async_playwright

OUTPUT_DIR = '/home/edi/devex-astro/public/screenshots'
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Read tools.ts
with open('/home/edi/devex-astro/src/data/tools.ts') as f:
    content = f.read()

ids = re.findall(r'id:\s*"([^"]+)"', content)
urls = re.findall(r'websiteUrl:\s*"([^"]+)"', content)

# Skip screenshot tool itself and problematic URLs
skip_domains = ['developer.apple.com', 'developer.android.com', 'apple.com']

async def screenshot_one(page, tool_id, url, idx, total):
    filename = f"{tool_id}.jpg"
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    if os.path.exists(filepath):
        print(f"  [{idx}/{total}] SKIP {tool_id} (exists)")
        return
    
    try:
        await page.goto(url, timeout=20000, wait_until='domcontentloaded')
        await asyncio.sleep(2)
        # Take viewport screenshot
        await page.screenshot(path=filepath, full_page=False)
        size = os.path.getsize(filepath) // 1024
        print(f"  [{idx}/{total}] ✅ {tool_id:20s} {url:40s} {size}KB")
    except Exception as e:
        print(f"  [{idx}/{total}] ❌ {tool_id:20s} {url:40s} {str(e)[:50]}")

async def main():
    # Filter tools to screenshot (skip Apple domains)
    tools_to_shot = []
    for tid, url in zip(ids, urls):
        skip = False
        for sd in skip_domains:
            if sd in url:
                skip = True
                break
        if not skip:
            tools_to_shot.append((tid, url))
    
    print(f"Total tools to screenshot: {len(tools_to_shot)}")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox']
        )
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 800},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = await context.new_page()
        
        # Process in batches to avoid overload
        batch_size = 5
        for i in range(0, min(len(tools_to_shot), 20), batch_size):
            batch = tools_to_shot[i:i+batch_size]
            tasks = []
            for tid, url in batch:
                tasks.append(screenshot_one(page, tid, url, i+tasks.index((tid,url))+1 if tasks else i+1, len(tools_to_shot)))
            await asyncio.gather(*tasks)
            
            # Wait between batches
            if i + batch_size < len(tools_to_shot):
                await asyncio.sleep(3)
        
        await browser.close()

    print("\nDone! Check screenshots in:", OUTPUT_DIR)

if __name__ == '__main__':
    asyncio.run(main())
