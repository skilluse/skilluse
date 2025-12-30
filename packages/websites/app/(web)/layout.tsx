import type { ReactNode } from "react"
import { Footer } from "~/components/layout/footer"
import { Header } from "~/components/layout/header"
import { Container } from "~/components/layout/container"

type WebLayoutProps = {
  children: ReactNode
}

export default function WebLayout({ children }: WebLayoutProps) {
  return (
    <div className="min-h-dvh p-2 sm:p-4">
      <div className="flex flex-col min-h-[calc(100dvh-1rem)] sm:min-h-[calc(100dvh-2rem)] max-w-272 mx-auto border border-border">
        <Header />

        <main className="flex flex-col grow">
          <Container className="flex flex-col grow py-10 gap-10 md:gap-12 md:py-12 lg:gap-16 lg:py-16">
            {children}
          </Container>
        </main>

        <Footer />
      </div>
    </div>
  )
}
