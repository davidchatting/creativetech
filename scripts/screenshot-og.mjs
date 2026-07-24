import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto("http://localhost:8080/og.html", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: "dist/og-image.png" });
await browser.close();
