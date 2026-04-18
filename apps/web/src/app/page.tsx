import Link from "next/link";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { CloneEngine } from "@/components/landing/clone-engine";
import { AutonomousAgent } from "@/components/landing/autonomous-agent";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              N
            </div>
            <span className="text-lg font-bold tracking-tight">NEXUS</span>
          </div>
          <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#clone-engine" className="transition-colors hover:text-foreground">Clone Engine</a>
            <a href="#agent" className="transition-colors hover:text-foreground">AI Agent</a>
          </div>
          <Link
            href="/auth/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <Hero />
      <Features />
      <CloneEngine />
      <AutonomousAgent />
      <Footer />
    </main>
  );
}
