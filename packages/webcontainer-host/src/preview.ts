/**
 * @nexus/webcontainer-host — live preview / hot-reload bridge
 *
 * Listens for the container's `server-ready` event and tracks the live
 * preview URL, emitting `preview` builder events as the dev server boots.
 */

import type { WebContainer } from "@webcontainer/api";
import type { BuilderEvent, PreviewState } from "./types";

export interface PreviewBridge {
  /** Latest known preview state. */
  getState(): PreviewState;
  /** Stop listening for server-ready events. */
  dispose(): void;
}

/**
 * Attach a hot-reload bridge to a running container.
 *
 * Updates internal PreviewState and emits `preview` events whenever the
 * dev server becomes ready on a new port/URL.
 */
export function attachPreview(
  container: WebContainer,
  onEvent?: (event: BuilderEvent) => void,
): PreviewBridge {
  let state: PreviewState = { status: "starting" };

  const emit = () =>
    onEvent?.({
      type: "preview",
      data: { ...state },
      timestamp: Date.now(),
    });

  const handler = (port: number, url: string) => {
    state = { status: "ready", url, port };
    emit();
  };

  // `on("server-ready")` returns an unsubscribe function in the SDK.
  const unsubscribe = container.on("server-ready", handler);

  const errorHandler = (error: { message: string }) => {
    state = { status: "error", error: error.message };
    emit();
  };
  const unsubscribeError = container.on("error", errorHandler);

  return {
    getState: () => state,
    dispose: () => {
      unsubscribe();
      unsubscribeError();
    },
  };
}
