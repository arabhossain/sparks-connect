import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import logoImg from '@/assets/logo.png'

export function Auth() {
  const [searchParams] = useSearchParams()
  const isRegistering = searchParams.get('register') === 'true'
  const [step, setStep] = useState(isRegistering ? 1 : 0) // 0 = login, 1 = register step 1, 2 = register step 2
  const [accountType, setAccountType] = useState<'individual' | 'organization' | null>(null)
  const [orgName, setOrgName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/mypage/hosts')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterNext = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Map frontend accountType to database role
      const role = accountType === 'organization' ? 'organization_user' : 'individual'
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password, role, orgName })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/mypage/hosts')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <Link to="/" className="absolute top-8 left-8 flex items-center space-x-2">
        <img src={logoImg} alt="Sparks Connect Logo" className="w-8 h-8 rounded-lg shadow-glow-primary object-cover" />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-500 to-orange-500">
          Sparks Connect
        </span>
      </Link>

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>Enter your credentials to access your vault</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                  {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground/80">Email</label>
                      <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-foreground/80">Password</label>
                        <a href="#" className="text-xs text-primary hover:text-primary-light">Forgot password?</a>
                      </div>
                      <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" disabled={loading} className="w-full shadow-glow-primary">
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                    <div className="text-sm text-center text-muted-foreground">
                      Don't have an account? <button type="button" onClick={() => setStep(1)} className="text-primary hover:text-primary-light underline-offset-4 hover:underline">Sign up</button>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="register-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Create an account</CardTitle>
                  <CardDescription>Step 1 of 2: Let's setup your credentials</CardDescription>
                </CardHeader>
                <form onSubmit={handleRegisterNext}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground/80">Email</label>
                      <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground/80">Password</label>
                      <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full shadow-glow-primary">Continue</Button>
                    <div className="text-sm text-center text-muted-foreground">
                      Already have an account? <button type="button" onClick={() => setStep(0)} className="text-primary hover:text-primary-light underline-offset-4 hover:underline">Sign in</button>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="register-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Choose account type</CardTitle>
                  <CardDescription>Step 2 of 2: How will you use Sparks Connect?</CardDescription>
                </CardHeader>
                <form onSubmit={handleCompleteRegistration}>
                  {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}
                  <CardContent className="space-y-4">
                    <div
                      className={cn("p-4 rounded-xl border cursor-pointer transition-all", accountType === 'individual' ? "bg-primary/10 border-primary" : "bg-black/40 border-white/10 hover:border-white/30")}
                      onClick={() => setAccountType('individual')}
                    >
                      <h3 className="font-semibold mb-1 text-foreground">Individual</h3>
                      <p className="text-sm text-muted-foreground">For personal projects and standalone servers.</p>
                    </div>
                    <div
                      className={cn("p-4 rounded-xl border cursor-pointer transition-all", accountType === 'organization' ? "bg-accent/10 border-accent" : "bg-black/40 border-white/10 hover:border-white/30")}
                      onClick={() => setAccountType('organization')}
                    >
                      <h3 className="font-semibold mb-1 text-foreground">Organization</h3>
                      <p className="text-sm text-muted-foreground">For teams who need to collaborate on infrastructure.</p>
                    </div>

                    <AnimatePresence>
                      {accountType === 'organization' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 mt-4"
                        >
                          <label className="text-sm font-medium text-foreground/80">Organization Name</label>
                          <Input type="text" placeholder="Acme Corp" value={orgName} onChange={e => setOrgName(e.target.value)} required={accountType === 'organization'} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                  <CardFooter className="flex space-x-4">
                    <Button type="button" variant="ghost" onClick={() => setStep(1)}>Back</Button>
                    <Button type="submit" className="w-full shadow-glow-primary" disabled={!accountType || loading}>
                      {loading ? 'Completing...' : 'Complete Setup'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
