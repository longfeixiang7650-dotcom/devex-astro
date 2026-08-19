#!/usr/bin/env python3
"""Final retry: sourceforge via headed browser (under xvfb) + mongodb-compass direct/proxy."""
import asyncio
import os
from playwright.async_api import async_playwright

OUTPUT_DIR = '/home/edi/devex-astro/public/screenshots'
PROXY = {"server": "http://127.0.0.1:7890"}
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

async def main():
    async with async_playwright() as p:
        # --- sourceforge: headed (xvfb) + proxy, long Cloudflare wait ---
        browser = await p.chromium.launch(headless=False, proxy=PROXY,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'])
        ctx = await browser.new_context(viewport={'width':1280,'height':900}, user_agent=UA, locale='en-US')
        page = await ctx.new_page()
        try:
            await page.goto('https://sourceforge.net', timeout=45000, wait_until='domcontentloaded')
            for i in range(8):
                await asyncio.sleep(5)
                t = await page.title()
                if 'moment' not in t.lower() and 'attention' not in t.lower():
                    break
            await page.screenshot(path=os.path.join(OUTPUT_DIR,'sourceforge.jpg'), full_page=False)
            print(f"  sourceforge title={await page.title()!r} size={os.path.getsize(os.path.join(OUTPUT_DIR,'sourceforge.jpg'))//1024}KB")
        except Exception as e:
            print(f"  sourceforge ❌ {str(e)[:80]}")
        await browser.close()

        # --- mongodb-compass: headless, direct first then proxy ---
        for label, proxy in [("direct", None), ("proxy", PROXY)]:
            try:
                browser = await p.chromium.launch(headless=True, proxy=proxy,
                    args=['--no-sandbox','--disable-setuid-sandbox','--ignore-certificate-errors'])
                ctx = await browser.new_context(viewport={'width':1280,'height':900}, user_agent=UA, locale='en-US')
                page = await ctx.new_page()
                await page.goto('https://www.mongodb.com/products/compass', timeout=45000, wait_until='domcontentloaded')
                await asyncio.sleep(10)
                await page.screenshot(path=os.path.join(OUTPUT_DIR,'mongodb-compass.jpg'), full_page=False)
                print(f"  mongodb-compass [{label}] title={await page.title()!r} size={os.path.getsize(os.path.join(OUTPUT_DIR,'mongodb-compass.jpg'))//1024}KB")
                await browser.close()
                break
            except Exception as e:
                print(f"  mongodb-compass [{label}] ❌ {str(e)[:80]}")
                try:
                    await browser.close()
                except Exception:
                    pass

    print("\nDone.")

if __name__ == '__main__':
    asyncio.run(main())
