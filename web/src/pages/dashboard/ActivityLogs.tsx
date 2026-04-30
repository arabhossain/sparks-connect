import { useState, useEffect } from 'react'
import { Activity, Clock, TerminalSquare, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Link } from 'react-router-dom'

export function ActivityLogs() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetch('/api/client/sessions?all=true', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(data => setSessions(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredSessions = sessions.filter(s => {
    if (!filter) return true;
    const match = filter.toLowerCase();
    return (s.username?.toLowerCase().includes(match) || s.hostName?.toLowerCase().includes(match) || s.id?.includes(match));
  })

  // Format duration gracefully
  const getDurationString = (start: string, end: string) => {
    const elapsed = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    if (minutes > 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    return `${minutes}m ${seconds}s`;
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center"><Activity className="mr-3 w-8 h-8 text-primary" /> Activity & Sessions</h1>
          <p className="text-muted-foreground mt-1">Audit trail of all connection periods and terminal actions</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter by user or host..."
            value={filter} onChange={e => setFilter(e.target.value)}
            className="pl-9 h-10 border-white/10 bg-black/40"
          />
        </div>
      </div>

      <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-12 text-center text-muted-foreground animate-pulse">Loading histories...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No sessions found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-black/40 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Status / Started</th>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Host</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSessions.map((session, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {session.status === 'active' ? (
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                        )}
                        <div className="flex flex-col">
                          <span className={session.status === 'active' ? "text-green-400 font-medium" : "text-muted-foreground"}>
                            {session.status.toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" /> {new Date(session.startedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{session.username}</td>
                    <td className="px-6 py-4 text-muted-foreground">{session.hostName}</td>
                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                      {session.status === 'inactive' ? getDurationString(session.startedAt, session.lastActive) : 'Ongoing'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/mypage/logs/${session.id}`}
                        className="bg-primary/10 hover:bg-primary/20 text-primary-light px-3 py-1.5 rounded-lg text-xs font-medium transition-colors inline-flex items-center"
                      >
                        <TerminalSquare className="w-3.5 h-3.5 mr-1.5" /> View Logs
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
