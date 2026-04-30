import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Server, Users, TerminalSquare, Activity } from 'lucide-react'

export function Overview() {
  const [stats, setStats] = useState({ totalHosts: 0, activeSessions: 0, teamMembers: 0 })

  useEffect(() => {
    fetch('/api/client/stats', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error)
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">At-a-glance metrics for your infrastructure</p>
      </div>

      <div className={stats.teamMembers >= 0 ? "grid grid-cols-1 md:grid-cols-3 gap-6" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>
        <Card className="bg-black/20 border-white/5 shadow-glow-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hosts</CardTitle>
            <Server className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalHosts}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
            <TerminalSquare className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeSessions}</div>
          </CardContent>
        </Card>

        {stats.teamMembers >= 0 && (
          <Card className="bg-black/20 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
              <Users className="w-4 h-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.teamMembers}</div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="bg-black/20 border-white/5 mt-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Activity className="w-5 h-5 mr-2 text-primary" />
            Recent Platform Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-center text-muted-foreground py-8 border-2 border-dashed border-white/10 rounded-lg">
            Dive into the Activity Logs tab for deeper insights.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
