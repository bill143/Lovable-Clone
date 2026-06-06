/**
 * @nexus/clone-engine — Stages 2 & 3: DOM and Style extraction
 *
 * Parses the rendered HTML with Cheerio to infer component boundaries, and
 * derives design tokens (colors, spacing, typography, radii) from the
 * computed styles captured during the crawl.
 */

import type {
  CloneEvent,
  ComponentNode,
  CrawlResult,
  DesignTokens,
} from "./types";

/** Heuristic selectors that usually map to meaningful component roots. */
const COMPONENT_HINTS: Array<{ selector: string; name: string; role: string }> = [
  { selector: "header", name: "Header", role: "banner" },
  { selector: "nav", name: "Nav", role: "navigation" },
  { selector: "main", name: "Main", role: "main" },
  { selector: "footer", name: "Footer", role: "contentinfo" },
  { selector: "form", name: "Form", role: "form" },
  { selector: "[data-component]", name: "Component", role: "generic" },
];

/**
 * Infer component boundaries from the DOM using structural heuristics.
 * LLM-based refinement can be layered on top of this in the agent loop.
 */
export async function extractDom(
  crawl: CrawlResult,
  onEvent?: (event: CloneEvent) => void,
): Promise<ComponentNode[]> {
  onEvent?.({ stage: "extract_dom", status: "start", timestamp: Date.now() });

  const { load } = await import("cheerio");
  const $ = load(crawl.html);
  const components: ComponentNode[] = [];

  for (const hint of COMPONENT_HINTS) {
    $(hint.selector).each((i, el) => {
      const children: string[] = [];
      $(el)
        .children()
        .each((_, child) => {
          const tag = child.type === "tag" ? child.name : undefined;
          if (tag) children.push(tag);
        });
      components.push({
        name: `${hint.name}${i > 0 ? i + 1 : ""}`,
        selector: hint.selector,
        role: hint.role,
        children,
      });
    });
  }

  onEvent?.({
    stage: "extract_dom",
    status: "done",
    message: `Inferred ${components.length} components`,
    timestamp: Date.now(),
  });
  return components;
}

/** A minimal map of element selector -> computed style declarations. */
export type ComputedStyleMap = Record<string, Record<string, string>>;

/**
 * Derive design tokens from a map of computed styles. The crawl stage is
 * expected to collect these via the Chrome DevTools Protocol.
 */
export function extractTokens(
  styles: ComputedStyleMap,
  onEvent?: (event: CloneEvent) => void,
): DesignTokens {
  onEvent?.({ stage: "extract_styles", status: "start", timestamp: Date.now() });

  const tokens: DesignTokens = {
    colors: {},
    spacing: {},
    typography: {},
    radii: {},
  };

  const colorSet = new Set<string>();
  const radiusSet = new Set<string>();
  const fontSet = new Set<string>();

  for (const decls of Object.values(styles)) {
    if (decls.color) colorSet.add(decls.color);
    if (decls["background-color"]) colorSet.add(decls["background-color"]);
    if (decls["border-radius"]) radiusSet.add(decls["border-radius"]);
    if (decls["font-family"]) fontSet.add(decls["font-family"]);
  }

  [...colorSet].forEach((c, i) => (tokens.colors[`color-${i + 1}`] = c));
  [...radiusSet].forEach((r, i) => (tokens.radii[`radius-${i + 1}`] = r));
  [...fontSet].forEach((f, i) => (tokens.typography[`font-${i + 1}`] = f));

  onEvent?.({
    stage: "extract_styles",
    status: "done",
    message: `${colorSet.size} colors, ${fontSet.size} fonts`,
    timestamp: Date.now(),
  });
  return tokens;
}
