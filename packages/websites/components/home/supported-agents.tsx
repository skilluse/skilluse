import Image from "next/image"
import { Intro, IntroTitle, IntroDescription } from "~/components/shared/intro"

interface Agent {
  name: string
  href: string
  logoLight: string
  logoDark: string
  width?: number
}

const agents: Agent[] = [
  {
    name: "Claude Code",
    href: "https://claude.ai/code",
    logoLight: "/logos/claude-code-light.svg",
    logoDark: "/logos/claude-code-dark.svg",
    width: 140,
  },
  {
    name: "OpenAI Codex",
    href: "https://developers.openai.com/codex",
    logoLight: "/logos/openai-codex-light.svg",
    logoDark: "/logos/openai-codex-dark.svg",
    width: 140,
  },
  {
    name: "Cursor",
    href: "https://cursor.com/",
    logoLight: "/logos/cursor-light.svg",
    logoDark: "/logos/cursor-dark.svg",
    width: 120,
  },
  {
    name: "VS Code",
    href: "https://code.visualstudio.com/",
    logoLight: "/logos/vscode-light.svg",
    logoDark: "/logos/vscode-dark.svg",
    width: 140,
  },
  {
    name: "OpenCode",
    href: "https://opencode.ai/",
    logoLight: "/logos/opencode-light.svg",
    logoDark: "/logos/opencode-dark.svg",
    width: 130,
  },
  {
    name: "Amp",
    href: "https://ampcode.com/",
    logoLight: "/logos/amp-light.svg",
    logoDark: "/logos/amp-dark.svg",
    width: 100,
  },
  {
    name: "Goose",
    href: "https://block.github.io/goose/",
    logoLight: "/logos/goose-light.png",
    logoDark: "/logos/goose-dark.png",
    width: 120,
  },
  {
    name: "GitHub Copilot",
    href: "https://github.com/features/copilot",
    logoLight: "/logos/github-light.svg",
    logoDark: "/logos/github-dark.svg",
    width: 120,
  },
  {
    name: "Letta",
    href: "https://www.letta.com/",
    logoLight: "/logos/letta-light.svg",
    logoDark: "/logos/letta-dark.svg",
    width: 100,
  },
]

export function SupportedAgents() {
  return (
    <>
      <Intro alignment="center">
        <IntroTitle size="h2">Supported Agents</IntroTitle>
        <IntroDescription>Works with all major AI coding assistants.</IntroDescription>
      </Intro>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 items-center justify-items-center max-w-4xl mx-auto">
        {agents.map((agent) => (
          <AgentLogo key={agent.name} {...agent} />
        ))}
      </div>
    </>
  )
}

function AgentLogo({ name, href, logoLight, logoDark, width = 150 }: Agent) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block hover:opacity-80 transition-opacity p-2"
    >
      {/* Light mode logo */}
      <Image
        src={logoLight}
        alt={name}
        width={width}
        height={40}
        className="block dark:hidden object-contain h-10"
        style={{ maxWidth: "100%" }}
      />
      {/* Dark mode logo */}
      <Image
        src={logoDark}
        alt={name}
        width={width}
        height={40}
        className="hidden dark:block object-contain h-10"
        style={{ maxWidth: "100%" }}
      />
    </a>
  )
}
