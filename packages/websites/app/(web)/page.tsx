import type { Metadata } from 'next'
import {
  EditorialPage,
  Section,
  P,
  A,
  Code,
  CodeBlock,
  List,
  Li,
  OL,
  ComparisonTable,
  Divider,
} from '~/components/editorial'

export const metadata: Metadata = {
  title: 'SkillUse — Manage AI Agent Skills with Ease',
  description:
    'A powerful CLI tool to discover, install, and manage skills for Claude Code, Codex CLI, and more AI coding assistants.',
  openGraph: {
    title: 'SkillUse — Manage AI Agent Skills with Ease',
    description:
      'A powerful CLI tool to discover, install, and manage skills for Claude Code, Codex CLI, and more AI coding assistants.',
    url: '/',
    type: 'website',
  },
  alternates: { canonical: '/' },
}

const tocItems = [
  { label: 'Introduction', href: '#introduction' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Installation', href: '#installation' },
  { label: 'Quick start', href: '#quick-start' },
  { label: 'Commands', href: '#commands' },
  { label: 'auth', href: '#auth' },
  { label: 'repo', href: '#repo' },
  { label: 'skill', href: '#skill' },
  { label: 'publish', href: '#publish' },
  { label: 'Creating skills', href: '#creating-skills' },
  { label: 'Skill format', href: '#skill-format' },
  { label: 'Supported agents', href: '#supported-agents' },
]

export default function HomePage() {
  return (
    <EditorialPage toc={tocItems} logo='skilluse'>
      {/* Introduction */}
      <Section id='introduction' title='Introduction'>
        <P>
          SkillUse is a CLI tool to discover, install, and manage{' '}
          <strong>skills for AI coding assistants</strong> — Claude Code, Cursor, VS Code Copilot,
          Goose, Codex, OpenCode, Letta, and more. Skills are reusable slash commands and agent
          instructions that extend what your AI can do.{' '}
          <A href='https://github.com/skilluse/skilluse'>Star on GitHub</A>.
        </P>
        <P>
          Install a skill once, use it everywhere. Share skills across your team. Publish your own
          skills to any GitHub repository so others can discover and install them.
        </P>
      </Section>

      {/* How it works */}
      <Section id='how-it-works' title='How it works'>
        <P>
          Skills are Markdown prompt files stored in GitHub repositories. SkillUse fetches them
          and writes them to the directory your AI agent watches — no restart required.
        </P>
        <CodeBlock lang='diagram' showLineNumbers={false}>{`┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│   Skill repo         │   │    SkillUse CLI      │   │      AI Agent        │
│                      │   │                      │   │                      │
│  owner/repo/         │   │  $ skilluse skill    │   │  Claude Code         │
│  ├── commit/         │──>│    install commit    │──>│  Cursor              │
│  │   └─ SKILL.md     │   │                      │   │  VS Code             │
│  ├── review-pr/      │   │  writes to           │   │  Goose …             │
│  │   └─ SKILL.md     │   │  ~/.claude/skills/   │   │                      │
│  └── deploy/         │   │  ~/.config/goose/…   │   │  /commit ✓           │
│      └─ SKILL.md     │   │  .cursor/skills/ …   │   │  /review-pr ✓        │
└──────────────────────┘   └──────────────────────┘   └──────────────────────┘`}</CodeBlock>
        <P>
          Each agent has a designated skills directory it monitors. Once a skill file lands there,
          the agent exposes it as a slash command immediately — no configuration needed.
        </P>
      </Section>

      {/* Installation */}
      <Section id='installation' title='Installation'>
        <P>Install the SkillUse CLI globally using your preferred package manager:</P>
        <CodeBlock lang='bash'>{`npm install -g skilluse`}</CodeBlock>
        <P>Or with pnpm:</P>
        <CodeBlock lang='bash'>{`pnpm add -g skilluse`}</CodeBlock>
        <P>Verify the installation:</P>
        <CodeBlock lang='bash'>{`skilluse --version`}</CodeBlock>
        <P>
          SkillUse requires Node.js 18 or later. It stores skills in your home directory under{' '}
          <Code>~/.claude/skills/</Code> for Claude Code, with support for other agents coming soon.
        </P>
      </Section>

      {/* Quick start */}
      <Section id='quick-start' title='Quick start'>
        <P>Get up and running in three steps:</P>
        <P><strong>1. Authenticate</strong> — log in with your GitHub account to enable installing and publishing skills:</P>
        <CodeBlock lang='bash'>{`skilluse auth login`}</CodeBlock>
        <P><strong>2. Add a skill repository</strong> — point SkillUse at a GitHub repo containing skills:</P>
        <CodeBlock lang='bash'>{`skilluse repo add skilluse/skilluse`}</CodeBlock>
        <P><strong>3. Install a skill</strong> — browse and install skills from the repo:</P>
        <CodeBlock lang='bash'>{`skilluse skill install commit`}</CodeBlock>
        <P>
          Once installed, the skill appears as a slash command in your AI agent. In Claude Code,
          type <Code>/commit</Code> to use it.
        </P>
      </Section>

      {/* Commands overview */}
      <Section id='commands' title='Commands'>
        <P>
          SkillUse is organized into four command groups: <Code>auth</Code>, <Code>repo</Code>,{' '}
          <Code>skill</Code>, and <Code>publish</Code>.
        </P>
        <ComparisonTable
          headers={['Command', 'Description', '']}
          rows={[
            ['skilluse auth', 'Manage authentication with GitHub', ''],
            ['skilluse repo', 'Manage skill repositories', ''],
            ['skilluse skill', 'Install, remove, and list skills', ''],
            ['skilluse publish', 'Publish skills to a repository', ''],
          ]}
        />
      </Section>

      {/* auth */}
      <Section id='auth' title='auth'>
        <P>
          The <Code>auth</Code> command handles GitHub OAuth authentication. SkillUse uses GitHub
          to identify users and to read from (and optionally write to) skill repositories.
        </P>
        <CodeBlock lang='bash'>{`# Log in via GitHub OAuth
skilluse auth login

# Check current auth status
skilluse auth status

# Log out
skilluse auth logout`}</CodeBlock>
        <P>
          Authentication is required for installing skills from private repositories and for
          publishing skills. Public repositories can be browsed without logging in.
        </P>
      </Section>

      {/* repo */}
      <Section id='repo' title='repo'>
        <P>
          Skill repositories are GitHub repos that follow the SkillUse format. The <Code>repo</Code>{' '}
          command manages which repos SkillUse knows about.
        </P>
        <CodeBlock lang='bash'>{`# Add a repository
skilluse repo add <owner>/<repo>

# List configured repositories
skilluse repo list

# Remove a repository
skilluse repo remove <owner>/<repo>

# Set a repository as the default for publishing
skilluse repo default <owner>/<repo>`}</CodeBlock>
        <P>
          You can add multiple repositories. When installing a skill by name, SkillUse searches all
          configured repos in the order they were added.
        </P>
      </Section>

      {/* skill */}
      <Section id='skill' title='skill'>
        <P>
          The <Code>skill</Code> command is the core of SkillUse. Install skills from repositories,
          list what&apos;s installed, and remove skills you no longer need.
        </P>
        <CodeBlock lang='bash'>{`# Install a skill by name
skilluse skill install <skill-name>

# Install from a specific repo
skilluse skill install <owner>/<repo>/<skill-name>

# List all installed skills
skilluse skill list

# Remove a skill
skilluse skill remove <skill-name>

# Show details about a skill
skilluse skill info <skill-name>`}</CodeBlock>
        <P>
          Skills are installed into the appropriate directory for your AI agent. For Claude Code,
          skills land in <Code>~/.claude/skills/</Code> and become available as{' '}
          <Code>/skill-name</Code> slash commands immediately — no restart required.
        </P>
      </Section>

      {/* publish */}
      <Section id='publish' title='publish'>
        <P>
          Share your skills with others by publishing them to a GitHub repository. The{' '}
          <Code>publish</Code> command handles versioning and pushing your skill files.
        </P>
        <CodeBlock lang='bash'>{`# Publish a skill from the current directory
skilluse publish

# Publish to a specific repository
skilluse publish --repo <owner>/<repo>

# Publish with a specific version
skilluse publish --version 1.2.0`}</CodeBlock>
        <P>
          Publishing requires authentication (<Code>skilluse auth login</Code>) and write access to
          the target repository. The repository must follow the SkillUse directory structure.
        </P>
      </Section>

      {/* Creating skills */}
      <Section id='creating-skills' title='Creating skills'>
        <P>
          A skill is a folder containing a <Code>SKILL.md</Code> file and optional reference
          documents. Create a new skill by making a directory with the skill name:
        </P>
        <CodeBlock lang='bash'>{`mkdir my-skill && cd my-skill
touch SKILL.md`}</CodeBlock>
        <P>
          The skill name (the folder name) becomes the slash command. A skill named{' '}
          <Code>commit</Code> becomes <Code>/commit</Code> in Claude Code.
        </P>
        <P>
          To publish your skill, push the folder to a GitHub repository following the SkillUse
          structure, then run <Code>skilluse publish</Code>.
        </P>
      </Section>

      {/* Skill format */}
      <Section id='skill-format' title='Skill format'>
        <P>
          Each skill lives in a folder and must have a <Code>SKILL.md</Code> file — the prompt
          that gets injected into the AI agent when the skill is invoked.
        </P>
        <CodeBlock lang='diagram' showLineNumbers={false}>{`my-skill/
├── SKILL.md          # Required — the skill prompt
└── references/       # Optional — supporting docs
    ├── guide.md
    └── examples.md`}</CodeBlock>
        <P>
          Write <Code>SKILL.md</Code> as a plain Markdown instruction prompt. Describe what the
          skill does, what inputs it expects, and how the agent should behave.
        </P>
        <CodeBlock lang='bash'>{`# SKILL.md example

Generate a Conventional Commits 1.0.0 compliant commit message.

## Instructions

1. Read all staged changes with \`git diff --cached\`
2. Summarize the changes in 72 characters or less
3. Use the format: \`<type>(<scope>): <description>\`
4. Valid types: feat, fix, docs, style, refactor, test, chore

## Output

Run: git commit -m "<message>"`}</CodeBlock>
        <P>
          Files in <Code>references/</Code> are automatically loaded alongside{' '}
          <Code>SKILL.md</Code> when the skill is invoked, giving the agent additional context
          without cluttering the main prompt.
        </P>
        <P>A skill repository has one folder per skill at the top level:</P>
        <CodeBlock lang='diagram' showLineNumbers={false}>{`my-skill-repo/
├── commit/
│   ├── SKILL.md
│   └── references/
│       └── conventional-commits.md
├── review-pr/
│   └── SKILL.md
└── deploy/
    ├── SKILL.md
    └── references/
        └── deploy-guide.md`}</CodeBlock>
      </Section>

      {/* Supported agents */}
      <Section id='supported-agents' title='Supported agents'>
        <P>
          SkillUse supports 8 agents. Skills are installed globally by default, or locally
          (project-level) with the <Code>--local</Code> flag.
        </P>
        <ComparisonTable
          title='Agent support'
          headers={['Agent', 'Global path', 'Local path']}
          rows={[
            ['Claude Code', '~/.claude/skills/', '.claude/skills/'],
            ['Cursor', '— (project only)', '.cursor/skills/'],
            ['VS Code + Copilot', '— (project only)', '.github/skills/'],
            ['Goose', '~/.config/goose/skills/', '.goose/skills/'],
            ['Codex CLI', '~/.codex/skills/', '.codex/skills/'],
            ['OpenCode', '~/.config/opencode/skill/', '.opencode/skill/'],
            ['Letta', '~/.letta/skills/', '.letta/skills/'],
            ['Other (portable)', '— (project only)', '.skills/'],
          ]}
        />
        <P>
          Specify the agent with the <Code>--agent</Code> flag, or let SkillUse auto-detect based
          on config files present in your project:
        </P>
        <CodeBlock lang='bash'>{`# Auto-detect agent
skilluse skill install commit

# Specify agent explicitly
skilluse skill install commit --agent cursor

# Install locally (project-level)
skilluse skill install commit --local`}</CodeBlock>
      </Section>

      <Divider />

      <P>
        Questions or feedback?{' '}
        <A href='https://github.com/skilluse/skilluse/issues'>Open an issue on GitHub</A> or reach
        out on <A href='https://x.com/JiweiYuan'>X/Twitter</A>.
      </P>
    </EditorialPage>
  )
}
