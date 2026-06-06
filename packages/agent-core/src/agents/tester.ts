import type { PatchSet, TestResult } from "../state/types";

/**
 * Tester agent: stub/dry-run for now.
 * Accepts code patches + test plan, returns pass/fail + logs.
 * Real E2B execution will land in PR #5.
 */
export async function testerAgent(input: {
  patches: PatchSet;
  testPlan?: string[];
}): Promise<TestResult> {
  const logs: string[] = [];
  let pass = true;

  // Dry-run validation: check patches for basic structural issues
  for (const patch of input.patches.patches) {
    if (patch.action === "create" || patch.action === "modify") {
      if (!patch.content && !patch.diff) {
        logs.push(`[FAIL] ${patch.path}: missing content for ${patch.action} action`);
        pass = false;
      } else {
        logs.push(`[OK] ${patch.path}: ${patch.action} — content present`);
      }

      // Basic syntax check: ensure no obvious issues
      if (patch.content) {
        if (patch.path.endsWith(".ts") || patch.path.endsWith(".tsx")) {
          if (patch.content.includes("require(") && !patch.content.includes("import")) {
            logs.push(`[WARN] ${patch.path}: uses require() instead of ES imports`);
          }
        }
      }
    } else if (patch.action === "delete") {
      logs.push(`[OK] ${patch.path}: delete action — no content needed`);
    }
  }

  if (input.patches.patches.length === 0) {
    logs.push("[WARN] No patches provided");
  }

  logs.push(`[DRY-RUN] Tester completed — real execution deferred to PR #5`);

  return { pass, logs };
}
