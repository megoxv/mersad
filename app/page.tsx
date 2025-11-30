import { Dashboard } from "@/components/dashboard"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageWrapper } from "@/components/page-wrapper"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <PageWrapper>
          <Dashboard />
        </PageWrapper>
      </main>
      <SiteFooter />
    </div>
  )
}
