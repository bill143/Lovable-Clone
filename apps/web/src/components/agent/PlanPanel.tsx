"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TaskCard } from "./TaskCard";

interface Plan {
  goal: string;
  tasks: Array<{
    id: string;
    title: string;
    deps: string[];
    acceptanceCriteria: string[];
    files: string[];
    status: string;
  }>;
}

export function PlanPanel({ plan }: { plan: Plan | null }) {
  if (!plan) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Plan will appear here once the agent starts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Plan</h2>
        <p className="text-sm text-muted-foreground">{plan.goal}</p>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {plan.tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <TaskCard task={task} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
