import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KeyRound, Building } from 'lucide-react'

export function Settings() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [orgName, setOrgName] = useState(user.organizationName || '')
  const [isOrgSubmitting, setIsOrgSubmitting] = useState(false)
  const [orgMessage, setOrgMessage] = useState('')

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      if (res.ok) {
        setMessage('Password updated successfully')
        setCurrentPassword('')
        setNewPassword('')
      } else {
        const data = await res.json()
        setMessage(data.error || 'Failed to update password')
      }
    } catch (err) {
      setMessage('Internal network error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOrgChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsOrgSubmitting(true)
    setOrgMessage('')
    try {
      const res = await fetch('/api/client/auth/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ name: orgName })
      })
      const data = await res.json()
      if (res.ok) {
        setOrgMessage('Organization name updated successfully')
        const updatedUser = { ...user, organizationName: orgName }
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } else {
        setOrgMessage(data.error || 'Failed to update organization name')
      }
    } catch (err) {
      setOrgMessage('Internal network error')
    } finally {
      setIsOrgSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile, security, and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-black/20 border-white/5">
          <CardHeader>
            <CardTitle className="text-xl flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-primary" />
              <span>Change Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <Input
                  type="password" required
                  value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  className="bg-black/40 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password" required
                  value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="bg-black/40 border-white/10"
                />
              </div>

              {message && <p className="text-sm text-center text-muted-foreground pt-2">{message}</p>}

              <Button type="submit" disabled={isSubmitting} className="w-full bg-primary relative overflow-hidden group">
                <span className="relative z-10">{isSubmitting ? 'Updating...' : 'Update Password'}</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Button>
            </form>
          </CardContent>
        </Card>

        {user.role === 'organization_user' && (
          <Card className="bg-black/20 border-white/5">
            <CardHeader>
              <CardTitle className="text-xl flex items-center space-x-2">
                <Building className="w-5 h-5 text-accent" />
                <span>Organization Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOrgChange} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization Name</label>
                  <Input
                    type="text" required
                    value={orgName} onChange={e => setOrgName(e.target.value)}
                    className="bg-black/40 border-white/10"
                  />
                </div>

                {orgMessage && <p className="text-sm text-center text-muted-foreground pt-2">{orgMessage}</p>}

                <Button type="submit" disabled={isOrgSubmitting} className="w-full bg-accent hover:bg-accent-light relative overflow-hidden group">
                  <span className="relative z-10">{isOrgSubmitting ? 'Updating...' : 'Update Organization'}</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
