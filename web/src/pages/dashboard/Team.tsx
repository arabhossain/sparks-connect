import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Users, Mail, Shield, UserCog } from 'lucide-react'

export function Team() {
  const [team] = useState([
    { id: 1, name: 'John Doe', email: 'john@acme.com', role: 'Owner', permissions: { createHost: true, editShared: true, viewLogs: true, startSessions: true } },
    { id: 2, name: 'Alice Smith', email: 'alice@acme.com', role: 'Admin', permissions: { createHost: true, editShared: true, viewLogs: true, startSessions: true } },
    { id: 3, name: 'Bob Junior', email: 'bob@acme.com', role: 'Member', permissions: { createHost: false, editShared: false, viewLogs: false, startSessions: true } },
  ])

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-1">Control access to your organization's infrastructure</p>
        </div>
        <Button className="shadow-glow-primary">
          <Mail className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Users className="w-5 h-5 mr-3 text-primary-light" />
                Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {team.map((member) => (
                  <div key={member.id} className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-white/5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center font-bold shadow-lg">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{member.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center space-x-2 mt-0.5">
                          <span>{member.email}</span>
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80 text-[10px] uppercase font-semibold">
                            {member.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                      <UserCog className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1">
          <Card className="sticky top-8 border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Shield className="w-5 h-5 mr-3 text-accent-light" />
                Bob's Access Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-background/50 rounded-xl border border-border">
                <div className="text-sm font-medium mb-4 text-white/90">Global Permissions</div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Create Hosts</div>
                      <div className="text-xs text-muted-foreground">Can add new personal or shared hosts</div>
                    </div>
                    <Switch checked={false} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Edit Shared Hosts</div>
                      <div className="text-xs text-muted-foreground">Modify settings for organization hosts</div>
                    </div>
                    <Switch checked={false} />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">View Logs</div>
                      <div className="text-xs text-muted-foreground">Access session history and audit logs</div>
                    </div>
                    <Switch checked={false} />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium text-white">Start Sessions</div>
                      <div className="text-xs text-accent-light">Can initiate SSH connections</div>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="font-semibold text-yellow-400">Note:</span> Hover effects and disabled visual states (lock icons) are automatically applied across the dashboard based on these toggles.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
