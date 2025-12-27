import { Card, CardDescription } from "~/components/common/card"
import { H5 } from "~/components/common/heading"
import { Icon, type IconName } from "~/components/common/icon"
import { Stack } from "~/components/common/stack"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { Grid } from "~/components/web/ui/grid"

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
    <Card hover={false}>
      <Stack size="sm">
        <Icon name={icon} className="size-5 text-primary" />
        <H5>{title}</H5>
      </Stack>
      <CardDescription>{description}</CardDescription>
    </Card>
  )
}
