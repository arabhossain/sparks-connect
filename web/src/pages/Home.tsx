import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, RefreshCw, Users, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-8"
          >
            Modern SSH Client for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent-light">
              Individuals and Teams
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-muted-foreground mb-10"
          >
            Secure, fast, and collaborative infrastructure access. End-to-end encrypted vault, seamless syncing, and powerful team management.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Link to="/download">
              <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto">
                Download Now
              </Button>
            </Link>
            <Link to="/auth?register=true">
              <Button size="lg" variant="glass" className="h-14 px-8 text-lg w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Animated Terminal Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-24 max-w-5xl mx-auto"
        >
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <div className="h-12 bg-black/40 border-b border-white/10 flex items-center px-4 space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 text-center text-sm text-white/50 font-mono">root@production-db-01</div>
            </div>
            <div className="p-6 h-[400px] bg-[#0a0a0a] font-mono text-sm text-green-400 overflow-hidden relative">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <p className="text-white/60">$ ssh root@192.168.1.104</p>
                <br />
                <p className="text-white">Welcome to Ubuntu 22.04 LTS (GNU/Linux 5.15.0-86-generic x86_64)</p>
                <br />
                <p> * Documentation:  https://help.ubuntu.com</p>
                <p> * Management:     https://landscape.canonical.com</p>
                <p> * Support:        https://ubuntu.com/advantage</p>
                <br />
                <p className="text-white/60">Last login: Wed Apr 2 15:42:01 2026 from 10.0.0.5</p>
                <p className="text-white/60 mt-2">root@production-db-01:~# <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }}>_</motion.span></p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 text-primary-light">
                <Shield className="w-6 h-6" />
              </div>
              <CardTitle>Zero-Knowledge Vault</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-foreground/70">
                Your SSH keys are securely encrypted on your device. We can never access your infrastructure.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 text-accent-light">
                <RefreshCw className="w-6 h-6" />
              </div>
              <CardTitle>Cross-device Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-foreground/70">
                Access your hosts from any device. Changes sync instantly across desktop and mobile.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4 text-green-400">
                <Users className="w-6 h-6" />
              </div>
              <CardTitle>Team Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-foreground/70">
                Share hosts securely with your team. Granular permissions and centralized audit logs.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
