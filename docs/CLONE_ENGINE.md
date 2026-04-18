# Clone Intelligence Engine (CIE)

> **Status:** Stub — implementation planned for PR #4.

## Overview

The Clone Intelligence Engine takes a URL as input and produces a fully reverse-engineered, annotated Next.js clone as output.

## Pipeline

1. **Crawl** — Playwright navigates the target URL, captures screenshots, and records a HAR file.
2. **Extract DOM** — Cheerio parses the rendered HTML; component boundaries are inferred via heuristic + LLM analysis.
3. **Extract Styles** — Computed CSS is captured via Chrome DevTools Protocol; design tokens (colors, spacing, typography, radii) are inferred.
4. **Analyze Network** — XHR/fetch/WebSocket/GraphQL requests are logged; API schemas and OpenAPI specs are inferred.
5. **Detect Framework** — Bundle analysis and DOM markers identify the framework (React, Vue, Svelte, etc.) and state management library.
6. **Map User Flows** — Playwright scripts simulate common user interactions and record the resulting navigation and state changes.
7. **Extract Assets** — Images, fonts, and icons are downloaded and optimized.
8. **Generate Report** — A Site Intelligence Report is produced in Markdown with Mermaid diagrams.
9. **Generate Clone** — An annotated Next.js project is generated with components, routes, API stubs, and design tokens.

## Output

- `site-report.md` — Markdown report with architecture overview, component tree, API map, and Mermaid diagrams.
- `clone/` — Next.js project directory with generated code.
