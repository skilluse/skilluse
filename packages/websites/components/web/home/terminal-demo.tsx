import { cx } from "~/utils/cva"

interface TerminalDemoProps {
  className?: string
}

export function TerminalDemo({ className }: TerminalDemoProps) {
  return (
    <div
      className={cx(
        "w-full max-w-lg rounded-lg border bg-card overflow-hidden",
        className
      )}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/50">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-destructive/60" />
          <span className="size-2.5 rounded-full bg-yellow-500/60" />
          <span className="size-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="text-xs text-muted-foreground">Terminal</span>
      </div>

      {/* Terminal content */}
      <div className="p-4 text-sm font-mono space-y-3">
        <div className="flex gap-2">
          <span className="text-primary">$</span>
          <span className="text-foreground">skilluse install code-review</span>
        </div>
        <div className="text-muted-foreground pl-4">
          <span className="text-green-600 dark:text-green-400">✔</span>{" "}
          Installed code-review to .claude/skills/
        </div>
        <div className="flex gap-2 pt-2">
          <span className="text-primary">$</span>
          <span className="text-foreground">skilluse list</span>
        </div>
        <div className="text-secondary-foreground pl-4 space-y-1">
          <div>
            <span className="text-primary">code-review</span>
            <span className="text-muted-foreground"> — Automated code review</span>
          </div>
          <div>
            <span className="text-primary">commit</span>
            <span className="text-muted-foreground"> — Generate conventional commits</span>
          </div>
        </div>
      </div>
    </div>
  )
}
