import { Footer } from '@/components/layout/Footer'
import { MobileTabBar } from '@/components/layout/MobileTabBar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <MobileTabBar />
    </>
  )
}
