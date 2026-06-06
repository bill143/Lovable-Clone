/**
 * @nexus/webcontainer-host — StackBlitz WebContainers SDK integration
 *
 * Public API for booting a WebContainer, mounting project files, spawning
 * processes, and bridging the live preview / hot-reload surface. Used by
 * the chat-to-app builder to run generated code in the browser.
 */

import { bootContainer, teardownContainer, getContainer } from "./container";
import { mountFiles, applyFiles, writeFile, readFile } from "./fs";
import { spawnProcess, runToCompletion } from "./process";
import { attachPreview } from "./preview";
import type { BuilderEvent, FileTree, PreviewState } from "./types";

// Re-export types & schemas
export type {
  WebContainerFile,
  FileTree,
  ProcessKind,
  ProcessHandle,
  PreviewStatus,
  PreviewState,
  BuilderEventType,
  BuilderEvent,
} from "./types";

export {
  WebContainerFileSchema,
  FileTreeSchema,
  ProcessKindSchema,
  ProcessHandleSchema,
  PreviewStatusSchema,
  PreviewStateSchema,
  BuilderEventTypeSchema,
  BuilderEventSchema,
} from "./types";

// Re-export low-level helpers
export { bootContainer, teardownContainer, getContainer } from "./container";
export { mountFiles, applyFiles, writeFile, readFile, toFileSystemTree } from "./fs";
export { spawnProcess, runToCompletion } from "./process";
export { attachPreview } from "./preview";
export type { SpawnOptions, SpawnResult } from "./process";
export type { PreviewBridge } from "./preview";

export interface BuilderSession {
  /** Current preview state (URL once ready). */
  getPreview(): PreviewState;
  /** Apply incremental file changes and let the dev server hot-reload. */
  update(files: FileTree): Promise<void>;
  /** Tear down the session and release the container. */
  dispose(): Promise<void>;
}

/**
 * Create a full builder session: boots the container, mounts the initial
 * file tree, installs dependencies, starts the dev server, and wires up
 * the hot-reload preview bridge.
 */
export async function createBuilderSession(input: {
  files: FileTree;
  installCommand?: [string, string[]];
  devCommand?: [string, string[]];
  onEvent?: (event: BuilderEvent) => void;
}): Promise<BuilderSession> {
  const { files, onEvent } = input;
  const [installCmd, installArgs] = input.installCommand ?? ["npm", ["install"]];
  const [devCmd, devArgs] = input.devCommand ?? ["npm", ["run", "dev"]];

  onEvent?.({ type: "boot", data: {}, timestamp: Date.now() });
  const container = await bootContainer();

  onEvent?.({ type: "mount", data: { count: files.length }, timestamp: Date.now() });
  await mountFiles(container, files);

  const preview = attachPreview(container, onEvent);

  // Install dependencies, then start the dev server (fire-and-forget).
  await runToCompletion(container, {
    kind: "install",
    command: installCmd,
    args: installArgs,
    onEvent,
  });

  await spawnProcess(container, {
    kind: "dev",
    command: devCmd,
    args: devArgs,
    onEvent,
  });

  return {
    getPreview: () => preview.getState(),
    update: async (next: FileTree) => {
      await applyFiles(container, next);
    },
    dispose: async () => {
      preview.dispose();
      await teardownContainer();
    },
  };
}
