#!/usr/bin/env python3
"""Retry sourceforge (headless=False to pass Cloudflare) and mongodb-compass."""
import asyncio
import os
from playwright.async_api import async_playwright

OUTPUT_DIR = '/home/edi/devex-astro/public/screenshots'
PROXY = {"server": "http://127.0.0.1:7890"}

async def main():
    async with async_playwright() as p:
        # --- sourceforge: headless=False, long wait for Cloudflare challenge ---
        browser = await p.chromium.launch(
            headless=False,
            proxy=PROXY,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']
        )
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 900},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            locale='en-US',
        )
        page = await context.new_page()
        try:
            await page.goto('https://sourceforge.net', timeout=45000, wait_until='domcontentloaded')
            # wait for Cloudflare challenge to auto-resolve (up to ~20s)
            for i in range(4):
                await asyncio.sleep(5)
                t = await page.title()
                if 'moment' not in t.lower():
                    break
            await page.screenshot(path=os.path.join(OUTPUT_DIR, 'sourceforge.jpg'), full_page=False)
            print(f"  sourceforge: title={await page.title()!r} size={os.path.getsize(os.path.join(OUTPUT_DIR,'sourceforge.jpg'))//1024}KB")
        except Exception as e:
            print(f"  sourceforge ❌ {str(e)[:80]}")
        await browser.close()

        # --- mongodb-compass: retry headless with proxy ---
        browser = await p.chromium.launch(
            headless=True,
            proxy=PROXY,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']
        )
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 900},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            locale='en-US',
        )
        page = await context.new_page()
        for url in ['https://www.mongodb.com/products/compass', 'https://www.mongodb.com/products/tools/compass']:
            try:
                await page.goto(url, timeout=45000, wait_until='domcontentloaded')
                await asyncio.sleep(8)
                await page.screenshot(path=os.path.join(OUTPUT_DIR, 'mongodb-compass.jpg'), full_page=False)
                print(f"  mongodb-compass: url={url} title={await page.title()!r} size={os.path.getsize(os.path.join(OUTPUT_DIR,'mongodb-compass.jpg'))//1024}KB")
                break
            except Exception as e:
                print(f"  mongodb-compass ❌ {url}: {str(e)[:80]}")
        await browser.close()

    print("\nDone.")

if __name__ == '__main__':
    asyncio.run(main())
