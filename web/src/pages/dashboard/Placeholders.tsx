export function DashboardHome() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      <p className="text-muted-foreground mt-1">Metrics and recent activity</p>
    </div>
  )
}

export function Sessions() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Active Sessions</h1>
      <p className="text-muted-foreground mt-1">Monitor who is connected to what</p>
    </div>
  )
}

export function ActivityLogs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
      <p className="text-muted-foreground mt-1">Audit trail of all actions</p>
    </div>
  )
}

export function Settings() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="text-muted-foreground mt-1">Manage your profile, keys, and preferences</p>
    </div>
  )
}
