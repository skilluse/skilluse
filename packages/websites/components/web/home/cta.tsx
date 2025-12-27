import { Link } from "~/components/common/link"
import { Button } from "~/components/common/button"
import { Icon } from "~/components/common/icon"
import { H2 } from "~/components/common/heading"
import { cx } from "~/utils/cva"

interface CTAProps {
  className?: string
}

export function CTA({ className }: CTAProps) {
  return (
    <section
      className={cx(
        "relative py-16 md:py-24 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20",
        className
      )}
    >
      <div className="text-center">
        <H2 size="h2" className="text-foreground">
          Ready to supercharge your AI?
        </H2>
        <p className="mt-4 text-secondary-foreground max-w-xl mx-auto">
          Start managing your AI agent skills today. Install once, use everywhere.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button asChild variant="fancy" size="lg">
            <Link href="/docs">
              Get Started
              <Icon name="ArrowRight" />
            </Link>
          </Button>

          <Button asChild variant="secondary" size="lg">
            <Link href="/docs">
              <Icon name="BookOpen" />
              Read the Docs
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
