#!/usr/bin/env python3
"""Retry missing screenshots with longer timeout."""
import asyncio, os, re
from playwright.async_api import async_playwright

OUTPUT_DIR = '/home/edi/devex-astro/public/screenshots'
os.makedirs(OUTPUT_DIR, exist_ok=True)

with open('/home/edi/devex-astro/src/data/tools.ts') as f:
    content = f.read()

ids = re.findall(r'id:\s*"([^"]+)"', content)
urls = re.findall(r'websiteUrl:\s*"([^"]+)"', content)
names = re.findall(r'name:\s*"([^"]+)"', content)

# Only retry missing ones
existing = {f.replace('.jpg', '') for f in os.listdir(OUTPUT_DIR) if f.endswith('.jpg')}
targets = [(tid, name, url) for tid, name, url in zip(ids, names, urls) if tid not in existing]

print(f"Missing: {len(targets)}")
for tid, name, url in targets:
    print(f"  {tid:20s} {name:30s} {url}")

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
        for i, (tid, name, url) in enumerate(targets):
            page = await context.new_page()
            try:
                print(f"[{i+1}/{len(targets)}] {tid} ... ", end='', flush=True)
                # Use longer timeout (45s) and 'load' instead of 'domcontentloaded'
                await page.goto(url, timeout=45000, wait_until='load')
                await asyncio.sleep(2)
                await page.screenshot(path=os.path.join(OUTPUT_DIR, f'{tid}.jpg'), full_page=False)
                size = os.path.getsize(os.path.join(OUTPUT_DIR, f'{tid}.jpg')) // 1024
                print(f"✅ {size}KB")
                done += 1
            except Exception as e:
                print(f"❌ {str(e)[:60]}")
                # Try with domcontentloaded instead (less strict)
                try:
                    page2 = await context.new_page()
                    await page2.goto(url, timeout=30000, wait_until='domcontentloaded')
                    await asyncio.sleep(3)
                    await page2.screenshot(path=os.path.join(OUTPUT_DIR, f'{tid}.jpg'), full_page=False)
                    size = os.path.getsize(os.path.join(OUTPUT_DIR, f'{tid}.jpg')) // 1024
                    print(f"  ↪ retry success! {size}KB")
                    done += 1
                except Exception as e2:
                    print(f"  ↪ retry also failed: {str(e2)[:60]}")
                finally:
                    try: await page2.close()
                    except: pass
            finally:
                try: await page.close()
                except: pass
        
        await browser.close()
        print(f"\nDone! {done}/{len(targets)} captured")

asyncio.run(main())
