import { Icon, type IconName } from "~/components/shared/icon"
import { Intro, IntroTitle, IntroDescription } from "~/components/shared/intro"

interface Feature {
  icon: IconName
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: "KeyRound",
    title: "GitHub Auth",
    description: "Secure OAuth Device Flow authentication for private repositories.",
  },
  {
    icon: "FolderGit2",
    title: "Repo Management",
    description: "Add public and private repos as skill sources.",
  },
  {
    icon: "Zap",
    title: "Quick Install",
    description: "One command to install skills locally or globally.",
  },
  {
    icon: "RefreshCw",
    title: "Easy Updates",
    description: "Keep your skills up to date with simple commands.",
  },
]

export function Features() {
  return (
    <>
      <Intro alignment="center">
        <IntroTitle size="h2">Why SkillUse?</IntroTitle>
        <IntroDescription>
          Everything you need to manage AI agent skills.
        </IntroDescription>
      </Intro>

      <div className="flex flex-col sm:flex-row border border-border">
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} {...feature} isFirst={index === 0} />
        ))}
      </div>
    </>
  )
}

function FeatureCard({ icon, title, description, isFirst }: Feature & { isFirst: boolean }) {
  return (
    <div className={`flex-1 p-5 ${isFirst ? "" : "border-t sm:border-t-0 sm:border-l"} border-border`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon name={icon} className="size-5 text-foreground" />
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
