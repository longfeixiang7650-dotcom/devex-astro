#!/usr/bin/env python3
"""Simple sequential screenshots using Playwright."""
import asyncio, os, re
from playwright.async_api import async_playwright

OUTPUT_DIR = '/home/edi/devex-astro/public/screenshots'
os.makedirs(OUTPUT_DIR, exist_ok=True)

with open('/home/edi/devex-astro/src/data/tools.ts') as f:
    content = f.read()

ids = re.findall(r'id:\s*"([^"]+)"', content)
urls = re.findall(r'websiteUrl:\s*"([^"]+)"', content)

# Skip problematic domains that won't load
skip_patterns = ['developer.apple.com', 'developer.android.com']
tools = []
for tid, url in zip(ids, urls):
    should_skip = any(s in url for s in skip_patterns)
    filename = f"{tid}.jpg"
    filepath = os.path.join(OUTPUT_DIR, filename)
    exists = os.path.exists(filepath)
    tools.append((tid, url, filepath, exists, should_skip))

print(f"Total: {len(tools)}, Already done: {sum(1 for t in tools if t[3])}, Skipped: {sum(1 for t in tools if t[4])}")

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        )
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 800},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        
        done = 0
        errors = 0
        for i, (tid, url, filepath, exists, should_skip) in enumerate(tools):
            if exists:
                print(f"[{i+1}/{len(tools)}] ⏭️ {tid} (already exists)")
                continue
            if should_skip:
                print(f"[{i+1}/{len(tools)}] ⏭️ {tid} (skip {url})")
                continue
            
            page = await context.new_page()
            try:
                print(f"[{i+1}/{len(tools)}] 📸 {tid} ... ", end='', flush=True)
                await page.goto(url, timeout=25000, wait_until='domcontentloaded')
                await asyncio.sleep(1.5)
                await page.screenshot(path=filepath, full_page=False)
                size = os.path.getsize(filepath) // 1024
                print(f"✅ {size}KB")
                done += 1
            except Exception as e:
                print(f"❌ {str(e)[:60]}")
                errors += 1
            finally:
                await page.close()
        
        await browser.close()
        print(f"\nDone! {done} screenshots taken, {errors} errors")

asyncio.run(main())
