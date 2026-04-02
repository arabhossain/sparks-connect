import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PublicLayout } from './pages/PublicLayout'
import { Home } from './pages/Home'
import { Pricing } from './pages/Pricing'
import { Security, Download } from './pages/Placeholders'
import { Auth } from './pages/Auth'

import { DashboardLayout } from './pages/dashboard/DashboardLayout'
import { Hosts } from './pages/dashboard/Hosts'
import { Team } from './pages/dashboard/Team'
import { DashboardHome, Sessions, ActivityLogs, Settings } from './pages/dashboard/Placeholders'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Website Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/security" element={<Security />} />
          <Route path="/download" element={<Download />} />
        </Route>

        {/* Authentication Routes */}
        <Route path="/auth" element={<Auth />} />

        {/* Dashboard Application Routes */}
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="hosts" element={<Hosts />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="team" element={<Team />} />
          <Route path="logs" element={<ActivityLogs />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
