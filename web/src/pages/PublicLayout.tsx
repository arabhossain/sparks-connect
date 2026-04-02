import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border py-8 mt-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center relative z-10">
          <p className="text-muted-foreground text-sm">© 2026 Sparks Connect. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Terms</a>
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
