import { Icon, type IconName } from "~/components/common/icon"
import { Stack } from "~/components/common/stack"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"

interface Agent {
  name: string
  icon: IconName
}

const agents: Agent[] = [
  { name: "Claude Code", icon: "Terminal" },
  { name: "Codex CLI", icon: "Code" },
  { name: "VS Code", icon: "FileCode" },
  { name: "Cursor", icon: "MousePointer" },
  { name: "Custom", icon: "Settings" },
]

export function SupportedAgents() {
  return (
    <>
      <Intro alignment="center">
        <IntroTitle size="h2">Supported Agents</IntroTitle>
        <IntroDescription>Works with all major AI coding assistants.</IntroDescription>
      </Intro>

      <Stack className="justify-center gap-6 md:gap-8">
        {agents.map((agent) => (
          <AgentBadge key={agent.name} {...agent} />
        ))}
      </Stack>
    </>
  )
}

function AgentBadge({ name, icon }: Agent) {
  return (
    <Stack size="sm" direction="column" className="items-center">
      <div className="flex size-12 items-center justify-center rounded-lg border bg-card">
        <Icon name={icon} className="size-5 text-muted-foreground" />
      </div>
      <span className="text-xs text-muted-foreground">{name}</span>
    </Stack>
  )
}
