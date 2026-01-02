import { config } from "~/config"
import { cx } from "~/utils/cva"

interface TerminalHeroProps {
  className?: string
}

export function TerminalHero({ className }: TerminalHeroProps) {
  return (
    <div
      className={cx(
        "w-full max-w-3xl mx-auto border border-border bg-card overflow-hidden",
        className
      )}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/50">
        <div className="flex gap-1.5">
          <span className="size-3 rounded-full bg-destructive/70" />
          <span className="size-3 rounded-full bg-yellow-500/70" />
          <span className="size-3 rounded-full bg-green-500/70" />
        </div>
        <span className="text-xs text-muted-foreground ml-2">
          skilluse.dev
        </span>
      </div>

      {/* Terminal content */}
      <div className="p-4 md:p-6 text-sm space-y-4 bg-background/50">
        {/* Welcome */}
        <div>
          <TerminalPrompt command="welcome" />
          <pre className="text-primary text-xs md:text-sm mt-2 overflow-x-auto leading-tight">
            {config.site.asciiLogo}
          </pre>
        </div>

        {/* Help */}
        <div>
          <TerminalPrompt command="help" />
          <div className="mt-2 space-y-1 text-xs md:text-sm">
            <CommandLine cmd="login" desc="authenticate with GitHub" />
            <CommandLine cmd="repo add" desc="add a skill repository" />
            <CommandLine cmd="install" desc="install a skill" />
            <CommandLine cmd="list" desc="list installed skills" />
          </div>
        </div>

        {/* Demo */}
        <div>
          <TerminalPrompt command="skilluse install code-review" />
          <div className="mt-2 text-xs md:text-sm">
            <span className="text-green-600 dark:text-green-400">✔</span>{" "}
            <span className="text-muted-foreground">
              Installed code-review to .claude/skills/
            </span>
          </div>
        </div>

        {/* Active prompt */}
        <div className="flex items-center gap-2">
          <TerminalPrompt />
          <span className="animate-pulse text-primary">▌</span>
        </div>
      </div>
    </div>
  )
}

function TerminalPrompt({ command }: { command?: string }) {
  return (
    <div className="flex flex-wrap gap-x-1 text-xs md:text-sm">
      <span className="text-primary">~</span>
      <span className="text-muted-foreground">$</span>
      {command && <span className="text-foreground ml-1">{command}</span>}
    </div>
  )
}

function CommandLine({ cmd, desc }: { cmd: string; desc: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-primary min-w-[5rem] md:min-w-[7rem]">{cmd}</span>
      <span className="text-muted-foreground">- {desc}</span>
    </div>
  )
}
