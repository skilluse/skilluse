import { Intro, IntroTitle, IntroDescription } from "~/components/shared/intro"

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

      <div className="flex flex-col sm:flex-row border border-border">
        {steps.map((step, index) => (
          <StepCard key={step.number} {...step} isFirst={index === 0} />
        ))}
      </div>
    </>
  )
}

function StepCard({ number, title, description, command, isFirst }: Step & { isFirst: boolean }) {
  return (
    <div className={`flex-1 p-5 text-center ${isFirst ? "" : "border-t sm:border-t-0 sm:border-l"} border-border`}>
      <div className="inline-flex size-8 items-center justify-center border border-border text-sm font-semibold mb-3">
        {number}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-3">{description}</p>
      <code className="block w-4/5 mx-auto px-3 py-1.5 border border-border text-sm font-mono">
        <span className="text-muted-foreground">$ </span>
        <span className="text-foreground">{command}</span>
      </code>
    </div>
  )
}
