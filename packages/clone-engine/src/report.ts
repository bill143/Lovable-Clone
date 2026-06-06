/**
 * @nexus/clone-engine — Stage 8: Site Intelligence Report
 *
 * Renders the aggregated SiteIntelligence object into a Markdown report with
 * Mermaid diagrams for the component tree and API surface.
 */

import type { CloneEvent, SiteIntelligence } from "./types";

/** Build a Markdown Site Intelligence Report from aggregated analysis. */
export function generateReport(
  intel: SiteIntelligence,
  onEvent?: (event: CloneEvent) => void,
): string {
  onEvent?.({ stage: "generate_report", status: "start", timestamp: Date.now() });

  const { crawl, components, tokens, api, framework, flows, assets } = intel;

  const sections: string[] = [];

  sections.push(`# Site Intelligence Report\n`);
  sections.push(`**Source:** ${crawl.finalUrl}\n`);
  if (crawl.title) sections.push(`**Title:** ${crawl.title}\n`);

  sections.push(`## Framework\n`);
  sections.push(
    `- **Detected:** ${framework.framework} (${Math.round(
      framework.confidence * 100,
    )}% confidence)`,
  );
  if (framework.stateManagement) {
    sections.push(`- **State:** ${framework.stateManagement}`);
  }

  sections.push(`\n## Component Tree\n`);
  sections.push(renderComponentMermaid(components));

  sections.push(`\n## Design Tokens\n`);
  sections.push(`- **Colors:** ${Object.keys(tokens.colors).length}`);
  sections.push(`- **Typography:** ${Object.keys(tokens.typography).length}`);
  sections.push(`- **Radii:** ${Object.keys(tokens.radii).length}`);

  sections.push(`\n## API Surface\n`);
  sections.push(`${api.requests.length} API request(s) observed.\n`);
  if (api.openApiYaml) {
    sections.push("\`\`\`yaml");
    sections.push(api.openApiYaml);
    sections.push("\`\`\`");
  }

  sections.push(`\n## User Flows\n`);
  if (flows.length === 0) {
    sections.push("_No flows recorded._");
  } else {
    for (const flow of flows) {
      sections.push(`### ${flow.name}`);
      flow.steps.forEach((s, i) =>
        sections.push(`${i + 1}. ${s.action}${s.selector ? ` (\`${s.selector}\`)` : ""}`),
      );
    }
  }

  sections.push(`\n## Assets\n`);
  sections.push(`${assets.length} asset(s) extracted.`);

  const report = sections.join("\n");

  onEvent?.({
    stage: "generate_report",
    status: "done",
    message: `Report ${report.length} chars`,
    timestamp: Date.now(),
  });
  return report;
}

/** Render a Mermaid graph for the inferred component tree. */
function renderComponentMermaid(
  components: SiteIntelligence["components"],
): string {
  const lines = ["\`\`\`mermaid", "graph TD"];
  if (components.length === 0) {
    lines.push("  Root[No components inferred]");
  } else {
    components.forEach((c, i) => {
      lines.push(`  N${i}["${c.name}"]`);
      c.children.forEach((child, j) =>
        lines.push(`  N${i} --> N${i}_${j}["${child}"]`),
      );
    });
  }
  lines.push("\`\`\`");
  return lines.join("\n");
}
