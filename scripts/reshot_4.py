#!/usr/bin/env python3
"""Re-screenshot 4 problematic tools through Mihomo proxy with longer waits."""
import asyncio
import os
from playwright.async_api import async_playwright

OUTPUT_DIR = '/home/edi/devex-astro/public/screenshots'

TARGETS = [
    ("gitlab", "https://gitlab.com"),
    ("sourceforge", "https://sourceforge.net"),
    ("mongodb-compass", "https://www.mongodb.com/products/compass"),
    ("grafana", "https://grafana.com"),
]

PROXY = {"server": "http://127.0.0.1:7890"}

async def shot_one(page, tid, url):
    filepath = os.path.join(OUTPUT_DIR, f"{tid}.jpg")
    try:
        await page.goto(url, timeout=45000, wait_until='domcontentloaded')
        await asyncio.sleep(8)  # longer wait for JS/Cloudflare
        await page.screenshot(path=filepath, full_page=False)
        size = os.path.getsize(filepath) // 1024
        title = await page.title()
        print(f"  ✅ {tid:20s} {size}KB  title={title[:60]!r}")
    except Exception as e:
        print(f"  ❌ {tid:20s} {str(e)[:80]}")

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            proxy=PROXY,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']
        )
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 900},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            locale='en-US',
        )
        page = await context.new_page()
        for tid, url in TARGETS:
            await shot_one(page, tid, url)
            await asyncio.sleep(2)
        await browser.close()
    print("\nDone.")

if __name__ == '__main__':
    asyncio.run(main())
