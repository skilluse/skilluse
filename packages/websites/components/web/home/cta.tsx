import { Link } from "~/components/common/link"
import { Button } from "~/components/common/button"
import { Icon } from "~/components/common/icon"
import { Stack } from "~/components/common/stack"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"

export function CTA() {
  return (
    <Intro alignment="center">
      <IntroTitle size="h2">Ready to supercharge your AI?</IntroTitle>

      <IntroDescription className="max-w-lg">
        Start managing your AI agent skills today. Install once, use everywhere.
      </IntroDescription>

      <Stack size="lg" className="mt-4 justify-center">
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
      </Stack>
    </Intro>
  )
}
