import type { ReactNode } from "react"
import { Footer } from "~/components/layout/footer"
import { Header, HeaderBackdrop } from "~/components/layout/header"
import { Container } from "~/components/layout/container"

type WebLayoutProps = {
  children: ReactNode
}

export default function WebLayout({ children }: WebLayoutProps) {
  return (
    <div className="flex flex-col min-h-dvh overflow-clip pt-(--header-offset)">
      <Header />
      <HeaderBackdrop />

      <main className="flex flex-col grow">
        <Container className="flex flex-col grow py-8 gap-8 md:gap-10 md:py-10 lg:gap-12 lg:py-12">
          {children}
        </Container>
      </main>

      <Footer />
    </div>
  )
}
