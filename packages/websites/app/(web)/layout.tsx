import type { ReactNode } from "react"
import { Footer } from "~/components/web/footer"
import { Header } from "~/components/web/header"
import { Container } from "~/components/web/ui/container"

type WebLayoutProps = {
  children: ReactNode
}

export default function WebLayout({ children }: WebLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-16">
        <Container className="py-8 md:py-12">
          {children}
        </Container>
      </main>
      <Footer />
    </div>
  )
}
