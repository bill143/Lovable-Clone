/**
 * @nexus/webcontainer-host — WebContainer boot lifecycle
 *
 * Thin wrapper around StackBlitz `@webcontainer/api`. Enforces a single
 * booted instance per page (the SDK only allows one) and exposes
 * boot/teardown helpers used by the builder session.
 */

import type { WebContainer } from "@webcontainer/api";

let instance: WebContainer | null = null;
let booting: Promise<WebContainer> | null = null;

/**
 * Boot (or reuse) the singleton WebContainer instance.
 *
 * The `@webcontainer/api` SDK permits only one instance per page, so we
 * guard concurrent callers behind a shared promise.
 */
export async function bootContainer(): Promise<WebContainer> {
  if (instance) return instance;
  if (booting) return booting;

  booting = (async () => {
    // Dynamic import keeps the SDK out of the server bundle.
    const { WebContainer } = await import("@webcontainer/api");
    instance = await WebContainer.boot();
    return instance;
  })();

  try {
    return await booting;
  } finally {
    booting = null;
  }
}

/** Returns the current instance if one has been booted, else null. */
export function getContainer(): WebContainer | null {
  return instance;
}

/** Tear down the running container and release the singleton slot. */
export async function teardownContainer(): Promise<void> {
  if (!instance) return;
  instance.teardown();
  instance = null;
}
