import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Terminal, Clock, Server, TerminalSquare } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Sessions() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sessions?status=active', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(data => setSessions(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Active Sessions</h1>
        <p className="text-muted-foreground mt-1">Monitor currently active connections across your infrastructure</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center border-2 border-dashed border-border rounded-xl">
             <Terminal className="w-10 h-10 mx-auto text-muted-foreground mb-4 opacity-50 animate-pulse" />
             <h3 className="text-lg font-medium">Loading sessions...</h3>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-border rounded-xl">
            <Terminal className="w-10 h-10 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No Active Sessions</h3>
            <p className="text-muted-foreground mt-1">There are no open connections right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((s, i) => (
              <Card key={i} className="bg-black/20 border-white/5 border-l-4 border-l-green-400 shadow-glow-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span className="flex items-center"><Server className="w-4 h-4 mr-2" /> {s.hostName || s.hostId}</span>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">ACTIVE</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">User: <span className="text-muted-foreground">{s.username}</span></p>
                  <div className="text-xs text-muted-foreground flex items-center mt-4">
                     <Clock className="w-3.5 h-3.5 mr-1" />
                     Started: {new Date(s.startedAt).toLocaleString()}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                      <Link 
                          to={`/mypage/logs/${s.id}`}
                          className="bg-primary/10 hover:bg-primary/20 text-primary-light px-3 py-1.5 rounded-lg text-xs font-medium transition-colors inline-flex items-center"
                      >
                          <TerminalSquare className="w-3.5 h-3.5 mr-1.5" /> View Logs
                      </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
