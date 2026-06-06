/**
 * @nexus/clone-engine — Stages 4 & 5: Network analysis and Framework detection
 *
 * Parses captured network traffic into an API map (with a best-effort OpenAPI
 * sketch) and infers the target's framework + state-management library from
 * DOM markers and request signatures.
 */

import type {
  ApiMap,
  CloneEvent,
  FrameworkInfo,
  NetworkRequest,
} from "./types";

/** Build an API map from captured network requests, keeping only API-like calls. */
export function analyzeNetwork(
  requests: NetworkRequest[],
  onEvent?: (event: CloneEvent) => void,
): ApiMap {
  onEvent?.({ stage: "analyze_network", status: "start", timestamp: Date.now() });

  const apiRequests = requests.filter(
    (r) =>
      r.resourceType === "xhr" ||
      r.resourceType === "fetch" ||
      (r.contentType ?? "").includes("application/json") ||
      /\/(api|graphql)\//.test(r.url),
  );

  const openApiYaml = sketchOpenApi(apiRequests);

  onEvent?.({
    stage: "analyze_network",
    status: "done",
    message: `${apiRequests.length} API requests`,
    timestamp: Date.now(),
  });

  return { requests: apiRequests, openApiYaml };
}

/** Produce a minimal OpenAPI 3 sketch listing discovered paths and methods. */
function sketchOpenApi(requests: NetworkRequest[]): string {
  const paths = new Map<string, Set<string>>();
  for (const r of requests) {
    let path: string;
    try {
      path = new URL(r.url).pathname;
    } catch {
      path = r.url;
    }
    if (!paths.has(path)) paths.set(path, new Set());
    paths.get(path)!.add(r.method.toLowerCase());
  }

  const lines = ["openapi: 3.0.0", "info:", "  title: Inferred API", "  version: 0.0.0", "paths:"];
  for (const [path, methods] of paths) {
    lines.push(`  ${path}:`);
    for (const method of methods) {
      lines.push(`    ${method}:`);
      lines.push("      responses:");
      lines.push("        '200':");
      lines.push("          description: Inferred response");
    }
  }
  return lines.join("\n");
}

interface DetectInput {
  html: string;
  requests: NetworkRequest[];
}

/** Detect framework + state management via DOM markers and bundle hints. */
export function detectFramework(
  input: DetectInput,
  onEvent?: (event: CloneEvent) => void,
): FrameworkInfo {
  onEvent?.({ stage: "detect_framework", status: "start", timestamp: Date.now() });

  const { html, requests } = input;
  const markers: string[] = [];
  let framework = "unknown";
  let confidence = 0.2;

  if (html.includes("__NEXT_DATA__")) {
    framework = "Next.js";
    confidence = 0.95;
    markers.push("__NEXT_DATA__");
  } else if (/data-reactroot|react-dom/.test(html)) {
    framework = "React";
    confidence = 0.8;
    markers.push("data-reactroot");
  } else if (html.includes("data-v-") || html.includes("__vue__")) {
    framework = "Vue";
    confidence = 0.8;
    markers.push("data-v-*");
  } else if (/svelte-/.test(html)) {
    framework = "Svelte";
    confidence = 0.75;
    markers.push("svelte-*");
  }

  let stateManagement: string | undefined;
  if (requests.some((r) => /graphql/.test(r.url))) stateManagement = "Apollo/GraphQL";
  else if (html.includes("__REDUX")) stateManagement = "Redux";

  onEvent?.({
    stage: "detect_framework",
    status: "done",
    message: `${framework} (${Math.round(confidence * 100)}%)`,
    timestamp: Date.now(),
  });

  return { framework, confidence, stateManagement, markers };
}
