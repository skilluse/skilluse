import { Icon, type IconName } from "~/components/common/icon"
import { H2 } from "~/components/common/heading"
import { cx } from "~/utils/cva"

interface Feature {
  icon: IconName
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: "KeyRound",
    title: "GitHub Auth",
    description:
      "Secure OAuth Device Flow authentication. Connect your GitHub account to access private skill repositories.",
  },
  {
    icon: "FolderGit2",
    title: "Repo Management",
    description:
      "Add public and private GitHub repos as skill sources. Organize skills across multiple repositories.",
  },
  {
    icon: "Zap",
    title: "Quick Install",
    description:
      "One command to install skills locally to your project or globally for all projects.",
  },
  {
    icon: "RefreshCw",
    title: "Easy Updates",
    description:
      "Keep your skills up to date with simple commands. Stay current with the latest improvements.",
  },
]

interface FeaturesProps {
  className?: string
}

export function Features({ className }: FeaturesProps) {
  return (
    <section className={cx("py-16 md:py-24", className)}>
      <div className="text-center mb-12">
        <H2 size="h2">Why SkillUse?</H2>
        <p className="mt-4 text-secondary-foreground max-w-2xl mx-auto">
          Everything you need to manage AI agent skills in one powerful CLI tool.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description }: Feature) {
  return (
    <div className="group relative flex flex-col gap-4 p-6 rounded-lg border border-border bg-card hover:bg-accent transition-colors">
      <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon name={icon} className="size-6" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-secondary-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
