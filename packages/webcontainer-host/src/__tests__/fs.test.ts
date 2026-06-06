import { describe, it, expect } from "vitest";
import { toFileSystemTree } from "../fs";
import {
  WebContainerFileSchema,
  PreviewStateSchema,
  ProcessHandleSchema,
} from "../types";

describe("toFileSystemTree", () => {
  it("converts a flat file list into a nested tree", () => {
    const tree = toFileSystemTree([
      { path: "package.json", contents: "{}" },
      { path: "src/index.ts", contents: "export {};" },
    ]);

    expect(tree["package.json"]).toEqual({ file: { contents: "{}" } });
    const src = tree["src"] as { directory: Record<string, unknown> };
    expect(src.directory["index.ts"]).toEqual({
      file: { contents: "export {};" },
    });
  });

  it("merges multiple files under the same directory", () => {
    const tree = toFileSystemTree([
      { path: "src/a.ts", contents: "a" },
      { path: "src/b.ts", contents: "b" },
    ]);

    const src = tree["src"] as { directory: Record<string, unknown> };
    expect(Object.keys(src.directory).sort()).toEqual(["a.ts", "b.ts"]);
  });
});

describe("schemas", () => {
  it("validates a well-formed file", () => {
    const parsed = WebContainerFileSchema.parse({
      path: "src/index.ts",
      contents: "export {};",
    });
    expect(parsed.path).toBe("src/index.ts");
  });

  it("rejects an empty path", () => {
    expect(() =>
      WebContainerFileSchema.parse({ path: "", contents: "x" }),
    ).toThrow();
  });

  it("accepts a ready preview state with a URL", () => {
    const state = PreviewStateSchema.parse({
      status: "ready",
      url: "https://example.com",
      port: 3000,
    });
    expect(state.status).toBe("ready");
  });

  it("validates a process handle", () => {
    const handle = ProcessHandleSchema.parse({
      id: "abc",
      kind: "dev",
      command: "npm",
      args: ["run", "dev"],
      startedAt: Date.now(),
    });
    expect(handle.kind).toBe("dev");
  });
});
