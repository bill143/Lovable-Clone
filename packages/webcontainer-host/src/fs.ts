/**
 * @nexus/webcontainer-host — file system helpers
 *
 * Mounts project files into the WebContainer and applies incremental
 * patch sets coming from the agent-core Coder agent.
 */

import type { WebContainer, FileSystemTree } from "@webcontainer/api";
import type { FileTree, WebContainerFile } from "./types";

/** Convert a flat FileTree into the nested FileSystemTree the SDK expects. */
export function toFileSystemTree(files: FileTree): FileSystemTree {
  const root: FileSystemTree = {};

  for (const file of files) {
    const segments = file.path.split("/").filter(Boolean);
    let cursor: FileSystemTree = root;

    segments.forEach((segment, i) => {
      const isLeaf = i === segments.length - 1;
      if (isLeaf) {
        cursor[segment] = { file: { contents: file.contents } };
      } else {
        const existing = cursor[segment];
        if (!existing || !("directory" in existing)) {
          cursor[segment] = { directory: {} };
        }
        cursor = (cursor[segment] as { directory: FileSystemTree }).directory;
      }
    });
  }

  return root;
}

/** Mount an entire project file tree into the container. */
export async function mountFiles(
  container: WebContainer,
  files: FileTree,
): Promise<void> {
  await container.mount(toFileSystemTree(files));
}

/** Write (or overwrite) a single file inside the container. */
export async function writeFile(
  container: WebContainer,
  file: WebContainerFile,
): Promise<void> {
  const dir = file.path.split("/").slice(0, -1).join("/");
  if (dir) {
    await container.fs.mkdir(dir, { recursive: true });
  }
  await container.fs.writeFile(file.path, file.contents);
}

/** Read a file from the container as a UTF-8 string. */
export async function readFile(
  container: WebContainer,
  path: string,
): Promise<string> {
  return container.fs.readFile(path, "utf-8");
}

/**
 * Apply a set of file writes (e.g. an agent-core PatchSet rendered to
 * full-file contents) atomically from the caller's perspective.
 */
export async function applyFiles(
  container: WebContainer,
  files: FileTree,
): Promise<void> {
  for (const file of files) {
    await writeFile(container, file);
  }
}
