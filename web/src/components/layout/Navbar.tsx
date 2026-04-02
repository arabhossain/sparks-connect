import { Link } from 'react-router-dom'
import { Button } from '../ui/button'
import logoImg from '@/assets/logo.png'

export function Navbar() {
  return (
    <nav className="border-b border-border bg-background/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <img src={logoImg} alt="Sparks Connect Logo" className="w-8 h-8 rounded-lg shadow-glow-primary object-cover" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-500 to-orange-500">
                Sparks Connect
              </span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm text-foreground/80 hover:text-foreground transition-colors">Features</Link>
            <Link to="/pricing" className="text-sm text-foreground/80 hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/security" className="text-sm text-foreground/80 hover:text-foreground transition-colors">Security</Link>
            <Link to="/download" className="text-sm text-foreground/80 hover:text-foreground transition-colors">Download</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="ghost" className="text-sm">Sign In</Button>
            </Link>
            <Link to="/auth?register=true">
              <Button className="text-sm shadow-glow-primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
