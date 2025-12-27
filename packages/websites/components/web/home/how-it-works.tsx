import { H2 } from "~/components/common/heading"
import { cx } from "~/utils/cva"

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
    description: "Connect your GitHub account to access private repositories.",
    command: "skilluse login",
  },
  {
    number: 2,
    title: "Add Repos",
    description: "Register skill repositories as sources for installation.",
    command: "skilluse repo add owner/repo",
  },
  {
    number: 3,
    title: "Install Skills",
    description: "Install skills to your project or globally with one command.",
    command: "skilluse install skill-name",
  },
]

interface HowItWorksProps {
  className?: string
}

export function HowItWorks({ className }: HowItWorksProps) {
  return (
    <section className={cx("py-16 md:py-24 bg-card/50", className)}>
      <div className="text-center mb-12">
        <H2 size="h2">How It Works</H2>
        <p className="mt-4 text-secondary-foreground max-w-2xl mx-auto">
          Get started in three simple steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <StepCard key={step.number} {...step} isLast={index === steps.length - 1} />
        ))}
      </div>
    </section>
  )
}

interface StepCardProps extends Step {
  isLast: boolean
}

function StepCard({ number, title, description, command, isLast }: StepCardProps) {
  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Step number */}
      <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
        {number}
      </div>

      {/* Connector line (hidden on mobile and for last item) */}
      {!isLast && (
        <div className="hidden md:block absolute top-6 left-[calc(50%+28px)] w-[calc(100%-56px)] h-0.5 bg-border" />
      )}

      <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-sm text-secondary-foreground mb-4">{description}</p>

      {/* Command block */}
      <code className="inline-flex items-center px-4 py-2 rounded-md bg-[#1a1a2e] text-sm font-mono text-gray-300">
        <span className="text-green-400 mr-2">$</span>
        {command}
      </code>
    </div>
  )
}
