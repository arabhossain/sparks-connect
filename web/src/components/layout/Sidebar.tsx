import { Link, useLocation } from 'react-router-dom'
import { Terminal, Server, Clock, Users, Settings, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import logoImg from '@/assets/logo.png'

export function Sidebar() {
  const location = useLocation()
  
  // Hardcoded for demo purposes
  const isOrg = true;

  const links = [
    { to: '/app', icon: Activity, label: 'Dashboard' },
    { to: '/app/hosts', icon: Server, label: 'Hosts' },
    { to: '/app/sessions', icon: Terminal, label: 'Sessions' },
    { to: '/app/logs', icon: Clock, label: 'Activity Logs' },
    ...(isOrg ? [{ to: '/app/team', icon: Users, label: 'Team' }] : []),
    { to: '/app/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <aside className="w-64 border-r border-border bg-black/20 flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link to="/" className="flex items-center space-x-2">
          <img src={logoImg} alt="Sparks Connect Logo" className="w-6 h-6 rounded shadow-glow-primary object-cover" />
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-500 to-orange-500">
            Sparks Connect
          </span>
        </Link>
      </div>

      {/* User profile small summary */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-sm font-medium">
            JD
          </div>
          <div className="overflow-hidden cursor-default">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">{isOrg ? 'Acme Corp' : 'Individual'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.to || (location.pathname.startsWith(link.to) && link.to !== '/app')
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive 
                  ? "bg-primary/10 text-primary-light border border-primary/20 shadow-[inset_0_0_12px_rgba(139,92,246,0.1)]" 
                  : "text-foreground/70 hover:bg-white/5 hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5 mr-3 transition-colors", isActive ? "text-primary-light" : "text-muted-foreground group-hover:text-foreground")} />
              {link.label}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-border mt-auto">
        <div className="glass-panel text-xs p-3 flex flex-col space-y-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Sync</span>
            <span className="flex items-center text-green-400"><div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"></div> Online</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
