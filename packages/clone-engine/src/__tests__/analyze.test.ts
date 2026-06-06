import { describe, it, expect } from "vitest";
import { analyzeNetwork, detectFramework } from "../analyze";
import { extractTokens } from "../extract";
import { SiteIntelligenceSchema, FrameworkInfoSchema } from "../types";
import type { NetworkRequest } from "../types";

const requests: NetworkRequest[] = [
  { method: "GET", url: "https://x.com/api/users", resourceType: "fetch", status: 200, contentType: "application/json" },
  { method: "POST", url: "https://x.com/api/login", resourceType: "xhr", status: 200 },
  { method: "GET", url: "https://x.com/logo.png", resourceType: "image", status: 200 },
];

describe("analyzeNetwork", () => {
  it("keeps only API-like requests", () => {
    const api = analyzeNetwork(requests);
    expect(api.requests).toHaveLength(2);
    expect(api.requests.every((r) => r.url.includes("/api/"))).toBe(true);
  });

  it("produces an OpenAPI sketch listing discovered paths", () => {
    const api = analyzeNetwork(requests);
    expect(api.openApiYaml).toContain("openapi: 3.0.0");
    expect(api.openApiYaml).toContain("/api/users");
    expect(api.openApiYaml).toContain("/api/login");
  });
});

describe("detectFramework", () => {
  it("detects Next.js from __NEXT_DATA__", () => {
    const info = detectFramework({
      html: '<div id="__NEXT_DATA__"></div>',
      requests: [],
    });
    expect(info.framework).toBe("Next.js");
    expect(info.confidence).toBeGreaterThan(0.9);
    expect(() => FrameworkInfoSchema.parse(info)).not.toThrow();
  });

  it("falls back to unknown for unrecognized markup", () => {
    const info = detectFramework({ html: "<html></html>", requests: [] });
    expect(info.framework).toBe("unknown");
  });

  it("infers GraphQL state management from requests", () => {
    const info = detectFramework({
      html: "<html></html>",
      requests: [{ method: "POST", url: "https://x.com/graphql", resourceType: "fetch" }],
    });
    expect(info.stateManagement).toBe("Apollo/GraphQL");
  });
});

describe("extractTokens", () => {
  it("derives color and font tokens from computed styles", () => {
    const tokens = extractTokens({
      "h1": { color: "rgb(0, 0, 0)", "font-family": "Inter" },
      "a": { color: "rgb(0, 0, 255)" },
    });
    expect(Object.keys(tokens.colors).length).toBeGreaterThan(0);
    expect(Object.keys(tokens.typography).length).toBe(1);
  });
});
