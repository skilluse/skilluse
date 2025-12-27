import { H5 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { Grid } from "~/components/web/ui/grid"

interface Step {
  number: number
  title: string
  description: string
  command: string
}

const steps: Step[] = [
  {
    number: 1,
    title: "Authenticate",
    description: "Connect your GitHub account.",
    command: "skilluse login",
  },
  {
    number: 2,
    title: "Add Repos",
    description: "Register skill repositories.",
    command: "skilluse repo add owner/repo",
  },
  {
    number: 3,
    title: "Install Skills",
    description: "Install with one command.",
    command: "skilluse install skill-name",
  },
]

export function HowItWorks() {
  return (
    <>
      <Intro alignment="center">
        <IntroTitle size="h2">How It Works</IntroTitle>
        <IntroDescription>Get started in three simple steps.</IntroDescription>
      </Intro>

      <Grid>
        {steps.map((step) => (
          <StepCard key={step.number} {...step} />
        ))}
      </Grid>
    </>
  )
}

function StepCard({ number, title, description, command }: Step) {
  return (
    <Stack direction="column" className="items-center text-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
        {number}
      </div>

      <div>
        <H5>{title}</H5>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <code className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card text-sm font-mono">
        <span className="text-primary">$</span>
        <span className="text-secondary-foreground">{command}</span>
      </code>
    </Stack>
  )
}
