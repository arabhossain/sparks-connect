import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Terminal, Plus, Search, MoreVertical, Lock, Shield, Server } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function Hosts() {
  const [filter, setFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'shared'>('all')

  const hosts = [
    { id: 1, name: 'Production Web 01', ip: '10.0.1.15', user: 'root', type: 'shared', status: 'online', os: 'ubuntu' },
    { id: 2, name: 'Production DB Primary', ip: '10.0.1.20', user: 'admin', type: 'shared', status: 'online', os: 'debian' },
    { id: 3, name: 'Staging API', ip: '10.0.2.55', user: 'deploy', type: 'shared', status: 'offline', os: 'ubuntu' },
    { id: 4, name: 'Personal Raspberry Pi', ip: '192.168.1.100', user: 'pi', type: 'personal', status: 'online', os: 'debian' },
  ]

  const filteredHosts = hosts.filter((host) => {
    if (activeTab !== 'all' && host.type !== activeTab) return false
    if (filter && !host.name.toLowerCase().includes(filter.toLowerCase()) && !host.ip.includes(filter)) return false
    return true
  })

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hosts</h1>
          <p className="text-muted-foreground mt-1">Manage your infrastructure connections</p>
        </div>
        <Button className="shadow-glow-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Host
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 justify-between items-center bg-black/20 p-2 rounded-xl border border-white/5">
        <div className="flex space-x-1">
          {['all', 'personal', 'shared'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                activeTab === tab ? "bg-card text-white shadow-md border border-white/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search hosts..." 
            className="pl-9 h-9 border-white/10 bg-black/40"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHosts.map((host) => (
          <Card key={host.id} className="group cursor-pointer">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center space-x-3">
                <div className={cn("p-2.5 rounded-xl border", host.type === 'shared' ? "bg-accent/10 border-accent/20 text-accent-light" : "bg-primary/10 border-primary/20 text-primary-light")}>
                  {host.type === 'shared' ? <Shield className="w-5 h-5" /> : <Server className="w-5 h-5" />}
                </div>
                <div>
                  <CardTitle className="text-lg">{host.name}</CardTitle>
                  <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full inline-block", host.status === 'online' ? "bg-green-400" : "bg-zinc-600")} />
                    <span>{host.status === 'online' ? 'Online' : 'Offline'}</span>
                    <span>•</span>
                    <span className="capitalize">{host.type}</span>
                  </div>
                </div>
              </div>
              <button className="text-muted-foreground hover:text-white p-1 rounded-md hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="mt-4 p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-sm text-foreground/80 flex items-center justify-between">
                <span>{host.user}@{host.ip}</span>
                <span className="text-xs text-muted-foreground uppercase">{host.os}</span>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <Button className="flex-1 text-xs h-9 bg-primary/20 text-primary-light hover:bg-primary/30 border border-primary/20">
                  <Terminal className="w-3.5 h-3.5 mr-2" />
                  Connect
                </Button>
                {host.type === 'shared' && (
                  <Button variant="outline" className="h-9 px-3 border-white/10" disabled title="You lack edit permissions for this shared host">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredHosts.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl">
            <Server className="w-10 h-10 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No hosts found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your filters or add a new host.</p>
          </div>
        )}
      </div>
    </div>
  )
}
