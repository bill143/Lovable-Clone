/**
 * @nexus/clone-engine — Playwright-based website Clone Intelligence Engine
 *
 * Public API: `cloneSite({ url })` runs the full pipeline — crawl, extract
 * DOM & styles, analyze network, detect framework, map flows, extract assets,
 * and generate a Site Intelligence Report — returning a SiteIntelligence object.
 */

import { crawl } from "./crawl";
import { extractDom, extractTokens } from "./extract";
import { analyzeNetwork, detectFramework } from "./analyze";
import { generateReport } from "./report";
import type {
  CloneEvent,
  NetworkRequest,
  SiteIntelligence,
} from "./types";

// Re-export types & schemas
export type {
  CloneStage,
  CrawlResult,
  ComponentNode,
  DesignTokens,
  NetworkRequest,
  ApiMap,
  FrameworkInfo,
  FlowStep,
  UserFlow,
  Asset,
  SiteIntelligence,
  CloneEvent,
} from "./types";

export {
  CloneStageSchema,
  CrawlResultSchema,
  ComponentNodeSchema,
  DesignTokensSchema,
  NetworkRequestSchema,
  ApiMapSchema,
  FrameworkInfoSchema,
  FlowStepSchema,
  UserFlowSchema,
  AssetSchema,
  SiteIntelligenceSchema,
  CloneEventSchema,
} from "./types";

// Re-export stage functions for direct use
export { crawl } from "./crawl";
export { extractDom, extractTokens } from "./extract";
export type { ComputedStyleMap } from "./extract";
export { analyzeNetwork, detectFramework } from "./analyze";
export { generateReport } from "./report";

export interface CloneOptions {
  url: string;
  outDir?: string;
  /** Pre-captured network requests (from the HAR) for analysis. */
  networkRequests?: NetworkRequest[];
  /** Pre-captured computed styles keyed by selector. */
  computedStyles?: Record<string, Record<string, string>>;
  onEvent?: (event: CloneEvent) => void;
}

/**
 * Run the full Clone Intelligence Engine pipeline for a single URL.
 *
 * Stages that require a live browser (crawl) run via Playwright; the analysis
 * stages are pure and operate on the captured artifacts. Returns the
 * aggregated SiteIntelligence including a Markdown report.
 */
export async function cloneSite(options: CloneOptions): Promise<SiteIntelligence> {
  const {
    url,
    outDir,
    networkRequests = [],
    computedStyles = {},
    onEvent,
  } = options;

  const crawlResult = await crawl({ url, outDir, onEvent });

  const components = await extractDom(crawlResult, onEvent);
  const tokens = extractTokens(computedStyles, onEvent);
  const api = analyzeNetwork(networkRequests, onEvent);
  const framework = detectFramework(
    { html: crawlResult.html, requests: networkRequests },
    onEvent,
  );

  const intel: SiteIntelligence = {
    crawl: crawlResult,
    components,
    tokens,
    api,
    framework,
    flows: [],
    assets: [],
  };

  intel.reportMarkdown = generateReport(intel, onEvent);

  onEvent?.({
    stage: "generate_clone",
    status: "done",
    message: "Pipeline complete",
    timestamp: Date.now(),
  });

  return intel;
}
/**
 * @nexus/clone-engine — Playwright-based website clone intelligence engine
 * Stub — will be populated in PR #4 (Clone Intelligence Engine)
 */
export {};
