import { H2 } from "~/components/common/heading"
import { Icon, type IconName } from "~/components/common/icon"
import { cx } from "~/utils/cva"

interface Agent {
  name: string
  icon: IconName
  description: string
}

const agents: Agent[] = [
  {
    name: "Claude Code",
    icon: "Terminal",
    description: "Anthropic's official CLI for Claude",
  },
  {
    name: "Codex CLI",
    icon: "Code",
    description: "OpenAI's coding assistant",
  },
  {
    name: "VS Code",
    icon: "FileCode",
    description: "Extensions for VS Code",
  },
  {
    name: "Cursor",
    icon: "MousePointer",
    description: "AI-powered code editor",
  },
  {
    name: "Custom",
    icon: "Settings",
    description: "Your own agent setup",
  },
]

interface SupportedAgentsProps {
  className?: string
}

export function SupportedAgents({ className }: SupportedAgentsProps) {
  return (
    <section className={cx("py-16 md:py-24", className)}>
      <div className="text-center mb-12">
        <H2 size="h2">Supported Agents</H2>
        <p className="mt-4 text-secondary-foreground max-w-2xl mx-auto">
          SkillUse works with all major AI coding assistants.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {agents.map((agent) => (
          <AgentCard key={agent.name} {...agent} />
        ))}
      </div>
    </section>
  )
}

function AgentCard({ name, icon, description }: Agent) {
  return (
    <div className="flex flex-col items-center gap-3 p-6 w-40 rounded-lg border border-border bg-card hover:bg-accent transition-colors">
      <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-foreground">
        <Icon name={icon} className="size-6" />
      </div>
      <div className="text-center">
        <h3 className="font-medium text-sm text-foreground">{name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
