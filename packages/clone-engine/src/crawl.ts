/**
 * @nexus/clone-engine — Stage 1: Crawl
 *
 * Drives Playwright to navigate the target URL, capture a screenshot, record
 * a HAR file, and return the fully rendered HTML for downstream extraction.
 */

import type { CrawlResult, CloneEvent } from "./types";

export interface CrawlOptions {
  url: string;
  /** Directory where screenshot/HAR artifacts are written. */
  outDir?: string;
  /** Viewport width/height for the headless browser. */
  viewport?: { width: number; height: number };
  /** Milliseconds to wait for network idle before capturing. */
  waitForIdleMs?: number;
  onEvent?: (event: CloneEvent) => void;
}

const DEFAULT_VIEWPORT = { width: 1440, height: 900 };

/**
 * Crawl a single URL with Playwright.
 *
 * Note: `playwright` is imported dynamically so the package can be type-checked
 * without the heavy browser binaries installed in every environment.
 */
export async function crawl(options: CrawlOptions): Promise<CrawlResult> {
  const {
    url,
    outDir = ".nexus/clone",
    viewport = DEFAULT_VIEWPORT,
    waitForIdleMs = 2000,
    onEvent,
  } = options;

  const emit = (status: CloneEvent["status"], message?: string) =>
    onEvent?.({ stage: "crawl", status, message, timestamp: Date.now() });

  emit("start", `Navigating to ${url}`);

  const { chromium } = await import("playwright");
  const browser = await chromium.launch();

  try {
    const context = await browser.newContext({
      viewport,
      recordHar: { path: `${outDir}/network.har` },
    });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(waitForIdleMs);

    const screenshotPath = `${outDir}/screenshot.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const html = await page.content();
    const title = await page.title();
    const finalUrl = page.url();

    await context.close();
    emit("done", `Captured ${html.length} bytes of HTML`);

    return {
      url,
      finalUrl,
      html,
      screenshotPath,
      harPath: `${outDir}/network.har`,
      title,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    emit("error", msg);
    throw e;
  } finally {
    await browser.close();
  }
}
