import { cx } from "~/utils/cva"

interface TerminalDemoProps {
  className?: string
}

export function TerminalDemo({ className }: TerminalDemoProps) {
  return (
    <div
      className={cx(
        "w-full max-w-lg rounded-lg border border-border bg-[#1a1a2e] text-sm font-mono shadow-lg overflow-hidden",
        className
      )}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#16162a] border-b border-border">
        <div className="flex gap-1.5">
          <span className="size-3 rounded-full bg-red-500/80" />
          <span className="size-3 rounded-full bg-yellow-500/80" />
          <span className="size-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-muted-foreground ml-2">Terminal</span>
      </div>

      {/* Terminal content */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-green-400">$</span>
          <span className="text-gray-300">skilluse install code-review</span>
        </div>
        <div className="text-gray-400 pl-4">
          <span className="text-green-400">✔</span> Installed code-review to .claude/skills/
        </div>
        <div className="flex items-center gap-2 mt-4">
          <span className="text-green-400">$</span>
          <span className="text-gray-300">skilluse list</span>
        </div>
        <div className="text-gray-400 pl-4 space-y-1">
          <div>
            <span className="text-cyan-400">code-review</span>
            <span className="text-gray-500"> - Automated code review with best practices</span>
          </div>
          <div>
            <span className="text-cyan-400">commit</span>
            <span className="text-gray-500"> - Generate conventional commits</span>
          </div>
        </div>
      </div>
    </div>
  )
}
