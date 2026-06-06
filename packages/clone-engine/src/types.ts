/**
 * @nexus/clone-engine — shared types & zod schemas
 *
 * Data contracts for the Clone Intelligence Engine (CIE) pipeline:
 * crawl results, extracted DOM/styles, network analysis, framework
 * detection, user flows, assets, and the final Site Intelligence Report.
 */

import { z } from "zod";

/** Stages of the CIE pipeline, in execution order. */
export const CloneStageSchema = z.enum([
  "crawl",
  "extract_dom",
  "extract_styles",
  "analyze_network",
  "detect_framework",
  "map_flows",
  "extract_assets",
  "generate_report",
  "generate_clone",
]);
export type CloneStage = z.infer<typeof CloneStageSchema>;

/** Result of the Playwright crawl stage. */
export const CrawlResultSchema = z.object({
  url: z.string().url(),
  finalUrl: z.string().url(),
  html: z.string(),
  screenshotPath: z.string().optional(),
  harPath: z.string().optional(),
  title: z.string().optional(),
});
export type CrawlResult = z.infer<typeof CrawlResultSchema>;

/** An inferred component boundary in the DOM. */
export const ComponentNodeSchema = z.object({
  name: z.string(),
  selector: z.string(),
  role: z.string().optional(),
  children: z.array(z.string()).default([]),
});
export type ComponentNode = z.infer<typeof ComponentNodeSchema>;

/** Design tokens inferred from computed styles. */
export const DesignTokensSchema = z.object({
  colors: z.record(z.string(), z.string()).default({}),
  spacing: z.record(z.string(), z.string()).default({}),
  typography: z.record(z.string(), z.string()).default({}),
  radii: z.record(z.string(), z.string()).default({}),
});
export type DesignTokens = z.infer<typeof DesignTokensSchema>;

/** A single captured network request. */
export const NetworkRequestSchema = z.object({
  method: z.string(),
  url: z.string(),
  resourceType: z.string(),
  status: z.number().int().optional(),
  contentType: z.string().optional(),
});
export type NetworkRequest = z.infer<typeof NetworkRequestSchema>;

/** Inferred API surface from network analysis. */
export const ApiMapSchema = z.object({
  requests: z.array(NetworkRequestSchema).default([]),
  openApiYaml: z.string().optional(),
});
export type ApiMap = z.infer<typeof ApiMapSchema>;

/** Framework / state-management detection result. */
export const FrameworkInfoSchema = z.object({
  framework: z.string(),
  confidence: z.number().min(0).max(1),
  stateManagement: z.string().optional(),
  markers: z.array(z.string()).default([]),
});
export type FrameworkInfo = z.infer<typeof FrameworkInfoSchema>;

/** A recorded user-flow step. */
export const FlowStepSchema = z.object({
  action: z.string(),
  selector: z.string().optional(),
  resultUrl: z.string().optional(),
});
export type FlowStep = z.infer<typeof FlowStepSchema>;

export const UserFlowSchema = z.object({
  name: z.string(),
  steps: z.array(FlowStepSchema).default([]),
});
export type UserFlow = z.infer<typeof UserFlowSchema>;

/** A downloaded asset reference. */
export const AssetSchema = z.object({
  url: z.string(),
  kind: z.enum(["image", "font", "icon", "other"]),
  localPath: z.string().optional(),
  bytes: z.number().int().optional(),
});
export type Asset = z.infer<typeof AssetSchema>;

/** The full aggregated output of the engine. */
export const SiteIntelligenceSchema = z.object({
  crawl: CrawlResultSchema,
  components: z.array(ComponentNodeSchema).default([]),
  tokens: DesignTokensSchema,
  api: ApiMapSchema,
  framework: FrameworkInfoSchema,
  flows: z.array(UserFlowSchema).default([]),
  assets: z.array(AssetSchema).default([]),
  reportMarkdown: z.string().optional(),
});
export type SiteIntelligence = z.infer<typeof SiteIntelligenceSchema>;

/** Streamed progress event emitted during a clone run. */
export const CloneEventSchema = z.object({
  stage: CloneStageSchema,
  status: z.enum(["start", "progress", "done", "error"]),
  message: z.string().optional(),
  timestamp: z.number(),
});
export type CloneEvent = z.infer<typeof CloneEventSchema>;
