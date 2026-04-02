import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function Pricing() {
  const [isOrg, setIsOrg] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Simple, transparent pricing</h1>
        <p className="text-xl text-muted-foreground">Choose the plan that best fits your needs.</p>
        
        <div className="mt-8 inline-flex items-center p-1 bg-black/40 border border-white/10 rounded-xl">
          <button 
            className={cn("px-6 py-2 rounded-lg text-sm font-medium transition-all", !isOrg ? "bg-primary text-white shadow-glow-primary" : "text-muted-foreground hover:text-white")}
            onClick={() => setIsOrg(false)}
          >
            Individual
          </button>
          <button 
            className={cn("px-6 py-2 rounded-lg text-sm font-medium transition-all", isOrg ? "bg-primary text-white shadow-glow-primary" : "text-muted-foreground hover:text-white")}
            onClick={() => setIsOrg(true)}
          >
            Organization
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {!isOrg ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Basic</CardTitle>
                <CardDescription>Essential features for individuals</CardDescription>
                <div className="mt-4 text-4xl font-bold">$0<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Unlimited local hosts', 'Basic terminal access', 'Key management'].map((feature) => (
                  <div key={feature} className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground/80">{feature}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">Current Plan</Button>
              </CardFooter>
            </Card>
            <Card className="border-primary/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary px-3 py-1 rounded-bl-lg text-xs font-medium">Most Popular</div>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>Advanced features and syncing</CardDescription>
                <div className="mt-4 text-4xl font-bold">$10<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Unlimited sync devices', 'Secure cloud vault', 'SFTP support', 'Snippets'].map((feature) => (
                  <div key={feature} className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground/80">{feature}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button className="w-full shadow-glow-primary">Upgrade Pro</Button>
              </CardFooter>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Team</CardTitle>
                <CardDescription>For small teams sharing access</CardDescription>
                <div className="mt-4 text-4xl font-bold">$20<span className="text-lg text-muted-foreground font-normal">/user/mo</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Shared hosts vault', 'Role-based access', 'Activity logs', 'Basic support'].map((feature) => (
                  <div key={feature} className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground/80">{feature}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button className="w-full">Start Trial</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription>Large scale infrastructure management</CardDescription>
                <div className="mt-4 text-4xl font-bold">Custom</div>
              </CardHeader>
              <CardContent className="space-y-4">
                {['SSO / SAML integration', 'Advanced audit logs', 'Custom RBAC', 'Dedicated support'].map((feature) => (
                  <div key={feature} className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span className="text-foreground/80">{feature}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">Contact Sales</Button>
              </CardFooter>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
