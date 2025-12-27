import { Card, CardHeader, CardTitle, CardDescription } from "~/components/ui/card"
import { Icon, type IconName } from "~/components/shared/icon"
import { Intro, IntroTitle, IntroDescription } from "~/components/shared/intro"
import { Grid } from "~/components/shared/grid"

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

      <Grid className="lg:grid-cols-4">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </Grid>
    </>
  )
}

function FeatureCard({ icon, title, description }: Feature) {
  return (
    <Card className="gap-4">
      <CardHeader className="flex-row items-center gap-2 p-5 pb-0">
        <Icon name={icon} className="size-5 text-primary" />
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardDescription className="px-5 pb-5">{description}</CardDescription>
    </Card>
  )
}
