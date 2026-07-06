import { useEffect } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  const location = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="flex-1 pt-16 lg:pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
