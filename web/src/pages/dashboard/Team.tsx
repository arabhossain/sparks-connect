import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Users, Mail, Shield, UserCog, Layers, Plus, Trash2, Power } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function Team() {
  const [activeTab, setActiveTab] = useState<'members'|'groups'>('members')
  const [team, setTeam] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [inviteMessage, setInviteMessage] = useState<{err?: string, success?: string}>({})
  const [activeMember, setActiveMember] = useState<any>(null)
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role !== 'owner' && user.role !== 'organization_user') {
    return (
      <div className="py-12 space-y-4 text-center">
        <h2 className="text-2xl font-bold">Organization Feature</h2>
        <p className="text-muted-foreground animate-pulse">This feature is strictly available for organization accounts.</p>
      </div>
    );
  }

  const [newGroupName, setNewGroupName] = useState('')

  const [allHosts, setAllHosts] = useState<any[]>([])

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/team', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      if (res.ok) setTeam(await res.json())
      const gRes = await fetch('/api/team-groups', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      if (gRes.ok) setGroups(await gRes.json())
      const hRes = await fetch('/api/hosts', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      if (hRes.ok) setAllHosts(await hRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeam()
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inviteEmail) return;
      setIsInviting(true);
      setInviteMessage({});
      try {
          const res = await fetch('/api/team', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
              body: JSON.stringify({ email: inviteEmail })
          });
          const data = await res.json();
          if (res.ok) {
              setInviteMessage({ success: `Temporary Password: ${data.tempPassword}` });
              setInviteEmail('');
              fetchTeam();
          } else {
              setInviteMessage({ err: data.error });
          }
      } catch (err: any) {
          setInviteMessage({ err: err.message });
      } finally {
          setIsInviting(false);
      }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName) return;
    try {
      const res = await fetch('/api/team-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ name: newGroupName, members: [], hosts: [] })
      });
      if (res.ok) {
        setNewGroupName('');
        fetchTeam();
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteGroup = async (id: string) => {
    if(!confirm('Delete group?')) return;
    try {
      await fetch(`/api/team-groups/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTeam();
    } catch(e) {}
  }

  const handleUpdateGroup = async (id: string, name: string, members: string[], hosts: string[]) => {
    try {
      await fetch(`/api/team-groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ name, members, hosts })
      });
      fetchTeam();
    } catch (e) { console.error(e) }
  }

  const handlePermissionToggle = async (key: string, checked: boolean) => {
      if (!activeMember) return;
      const newPerms = { ...activeMember.permissions, [key]: checked };
      const res = await fetch(`/api/team/${activeMember.id}/permissions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ permissions: newPerms })
      });
      if (res.ok) {
          setActiveMember({ ...activeMember, permissions: newPerms });
          setTeam(team.map(m => m.id === activeMember.id ? { ...m, permissions: newPerms } : m));
      }
  }

  const handleStatusToggle = async () => {
    if(!activeMember) return;
    const newStatus = activeMember.status === 'Active' ? 'Inactive' : 'Active';
    const res = await fetch(`/api/team/${activeMember.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ isActive: newStatus === 'Active' })
    });
    if(res.ok) {
      setActiveMember({ ...activeMember, status: newStatus });
      setTeam(team.map(m => m.id === activeMember.id ? { ...m, status: newStatus } : m));
    }
  }

  const handleDeleteMember = async () => {
    if(!activeMember) return;
    if(!confirm("Are you sure you want to permanently delete this member?")) return;
    const res = await fetch(`/api/team/${activeMember.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if(res.ok) {
      setActiveMember(null);
      fetchTeam();
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Access Management</h1>
          <p className="text-muted-foreground mt-1">Control access, groups, and permissions</p>
        </div>
        
        {activeTab === 'members' ? (
          <form onSubmit={handleInvite} className="flex gap-2 relative">
            {inviteMessage.success && <div className="absolute top-12 right-0 bg-green-500/20 text-green-300 p-2 text-xs border border-green-500/30 rounded-lg whitespace-nowrap">{inviteMessage.success}</div>}
            {inviteMessage.err && <div className="absolute top-12 right-0 bg-red-500/20 text-red-300 p-2 text-xs border border-red-500/30 rounded-lg whitespace-nowrap">{inviteMessage.err}</div>}
            <Input type="email" placeholder="coworker@company.com" className="h-10 border-white/10 w-48 bg-black/40" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
            <Button disabled={isInviting} type="submit" className="shadow-glow-primary"><Mail className="w-4 h-4 mr-2" />{isInviting ? 'Inviting...' : 'Invite'}</Button>
          </form>
        ) : (
          <form onSubmit={handleCreateGroup} className="flex gap-2">
            <Input required placeholder="New Group Name" className="h-10 border-white/10 w-48 bg-black/40" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
            <Button type="submit" className="shadow-glow-primary"><Plus className="w-4 h-4 mr-2" />Add</Button>
          </form>
        )}
      </div>

      <div className="flex border-b border-border">
        <button className={cn("px-6 py-3 font-medium transition-colors border-b-2", activeTab === 'members' ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-white")} onClick={() => setActiveTab('members')}>
          <div className="flex items-center"><Users className="w-4 h-4 mr-2" /> Team Members</div>
        </button>
        <button className={cn("px-6 py-3 font-medium transition-colors border-b-2", activeTab === 'groups' ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-white")} onClick={() => setActiveTab('groups')}>
          <div className="flex items-center"><Layers className="w-4 h-4 mr-2" /> Team Groups</div>
        </button>
      </div>

      {activeTab === 'members' && (
      <div className="grid md:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-4">
          {loading && <div className="text-center p-8 text-muted-foreground animate-pulse">Loading members...</div>}
          {!loading && team.map((member) => (
            <div key={member.id} className={cn("flex justify-between items-center p-4 bg-black/20 rounded-xl border", member.status === 'Inactive' ? "border-red-500/20 opacity-75" : "border-white/5")}>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center font-bold">{member.name.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="font-medium flex items-center">
                    {member.name}
                    {member.status === 'Inactive' && <span className="ml-2 text-[10px] uppercase bg-red-500/20 text-red-400 px-2 rounded-full">Inactive</span>}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center space-x-2 mt-0.5">
                    <span>{member.email}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] uppercase font-semibold">{member.role}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="hover:bg-white/5" onClick={() => setActiveMember(member)}>
                <UserCog className="w-4 h-4 mr-2" /> Manage
              </Button>
            </div>
          ))}
        </div>

        <div className="col-span-1">
          <Card className="sticky top-8 border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Shield className="w-5 h-5 mr-3 text-accent-light" />
                {activeMember ? `${activeMember.name}'s Access` : 'Select a member'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeMember ? (
              <>
              <div className="p-4 bg-background/50 rounded-xl border border-border">
                <div className="text-sm font-medium mb-4">Permissions</div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div><div className="text-sm">Create Hosts</div></div>
                    <Switch checked={activeMember.permissions?.createHost} onCheckedChange={c => handlePermissionToggle('createHost', c)} />
                  </div>
                  <div className="flex justify-between items-center">
                    <div><div className="text-sm">Edit Shared Hosts</div></div>
                    <Switch checked={activeMember.permissions?.editShared} onCheckedChange={c => handlePermissionToggle('editShared', c)} />
                  </div>
                  <div className="flex justify-between items-center">
                    <div><div className="text-sm">View Logs</div></div>
                    <Switch checked={activeMember.permissions?.viewLogs} onCheckedChange={c => handlePermissionToggle('viewLogs', c)} />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20 space-y-4">
                <div className="text-sm font-medium text-red-400">Danger Zone</div>
                <Button variant="outline" className="w-full justify-start border-white/5 hover:bg-white/5" onClick={handleStatusToggle}>
                  <Power className="w-4 h-4 mr-2" />
                  {activeMember.status === 'Active' ? 'Deactivate Account' : 'Reactivate Account'}
                </Button>
                <Button variant="outline" className="w-full justify-start border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300" onClick={handleDeleteMember}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Member
                </Button>
              </div>
              </>
              ) : (
                <div className="text-muted-foreground text-sm">Select a member to manage their permissions and status.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      )}

      {activeTab === 'groups' && (
        <div className="grid md:grid-cols-2 gap-6">
          {groups.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-white/10 rounded-xl">
              No groups created yet. Map hosts to your team members using groups.
            </div>
          )}
          {groups.map((g) => (
             <Card key={g.id} className="bg-black/20 border-white/5">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{g.name}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteGroup(g.id)} className="text-muted-foreground hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4 text-sm text-muted-foreground border-b border-white/5 pb-4">
                     <div><Users className="w-4 h-4 inline mr-1" /> {Array.isArray(g.members) ? g.members.length : 0} Members</div>
                     <div><Layers className="w-4 h-4 inline mr-1" /> {Array.isArray(g.hosts) ? g.hosts.length : 0} Hosts</div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    <div>
                      <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase">Assign Members</div>
                      <div className="flex flex-wrap gap-2">
                        {team.map(m => (
                          <label key={m.id} className="flex items-center space-x-2 text-xs bg-black/40 px-2 py-1.5 rounded border border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
                            <input 
                              type="checkbox" 
                              className="accent-primary"
                              checked={g.members?.includes(m.id)} 
                              onChange={e => {
                                const newMembers = e.target.checked ? [...(g.members||[]), m.id] : (g.members||[]).filter((id: string) => id !== m.id);
                                handleUpdateGroup(g.id, g.name, newMembers, g.hosts || []);
                              }} 
                            />
                            <span>{m.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase">Assign Shared Hosts</div>
                      <div className="flex flex-wrap gap-2">
                        {allHosts.filter(h => h.type === 'shared' || h.isShared).map(h => (
                          <label key={h.id} className="flex items-center space-x-2 text-xs bg-black/40 px-2 py-1.5 rounded border border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
                            <input 
                              type="checkbox" 
                              className="accent-primary"
                              checked={g.hosts?.includes(h.id)} 
                              onChange={e => {
                                const newHosts = e.target.checked ? [...(g.hosts||[]), h.id] : (g.hosts||[]).filter((id: string) => id !== h.id);
                                handleUpdateGroup(g.id, g.name, g.members || [], newHosts);
                              }} 
                            />
                            <span>{h.name}</span>
                          </label>
                        ))}
                        {allHosts.filter(h => h.type === 'shared' || h.isShared).length === 0 && <span className="text-xs text-muted-foreground">No shared hosts available.</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
             </Card>
          ))}
        </div>
      )}
    </div>
  )
}
