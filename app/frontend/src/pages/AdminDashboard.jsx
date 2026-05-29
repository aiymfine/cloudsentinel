import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { admin } from '../services/api'
import StatsCard from '../components/StatsCard'
import AuditTimeline from '../components/AuditTimeline'
import RoleBadge from '../components/RoleBadge'
import { Users, FileText, HardDrive, ShieldAlert, Activity, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#ef4444']

export default function AdminDashboard() {
  const { user: currentUser } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [audit, setAudit] = useState([])
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [dashRes, usersRes, auditRes, healthRes] = await Promise.allSettled([
        admin.dashboard(),
        admin.users(),
        admin.audit({ limit: 20 }),
        admin.health(),
      ])
      if (dashRes.status === 'fulfilled') setStats(dashRes.value.data.data)
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data.data)
      if (auditRes.status === 'fulfilled') setAudit(auditRes.value.data.data || [])
      if (healthRes.status === 'fulfilled') setHealth(healthRes.value.data.data)
    } catch {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleRoleChange = async (userId, newRole) => {
    try {
      await admin.changeRole(userId, newRole)
      toast.success('Role updated')
      setUsers(users.map(u => u.userId === userId ? { ...u, role: newRole } : u))
    } catch {
      toast.error('Failed to update role')
    }
  }

  const handleToggleUser = async (u) => {
    try {
      await admin.toggleStatus(u.userId)
      toast.success(`User ${u.enabled ? 'disabled' : 'enabled'}`)
      setUsers(users.map(x => x.userId === u.userId ? { ...x, enabled: !x.enabled } : x))
    } catch {
      toast.error('Failed to update user')
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'audit', label: 'Audit Log' },
  ]

  const roleData = stats?.roleDistribution
    ? Object.entries(stats.roleDistribution).map(([name, value]) => ({ name, value }))
    : [
        { name: 'VIEWER', value: users.filter(u => u.role === 'VIEWER').length },
        { name: 'EDITOR', value: users.filter(u => u.role === 'EDITOR').length },
        { name: 'ADMIN', value: users.filter(u => u.role === 'ADMIN').length },
      ]

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-sentinel-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">System overview & management</p>
        </div>
        <button onClick={loadData} className="btn-ghost flex items-center gap-2 py-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-sentinel-400/10 text-sentinel-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard icon={Users} title="Total Users" value={stats?.userCount ?? users.length} />
            <StatsCard icon={FileText} title="Total Files" value={stats?.fileCount ?? 0} />
            <StatsCard icon={HardDrive} title="Storage Used" value={stats?.storageUsedBytes ? `${(stats.storageUsedBytes / 1024 / 1024).toFixed(1)} MB` : '0 MB'} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-sm font-medium text-slate-300 mb-4">File Uploads Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats?.uploadsOverTime || []}>
                  <XAxis dataKey="date" stroke="#475569" fontSize={12} />
                  <YAxis stroke="#475569" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#22d3ee" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Role Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                    {roleData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {roleData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Health */}
          {health && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sentinel-400" /> System Health
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(health).map(([key, val]) => (
                  <div key={key} className="text-center">
                    <p className="text-xs text-slate-500 mb-1">{key}</p>
                    <p className={`text-sm font-medium ${val === 'UP' || val === true ? 'text-emerald-400' : 'text-red-400'}`}>
                      {String(val)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.userId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sentinel-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-white">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{u.email || '-'}</td>
                    <td className="px-4 py-3">
                      {u.userId === currentUser?.userId ? (
                        <RoleBadge role={u.role} />
                      ) : (
                        <select value={u.role} onChange={(e) => handleRoleChange(u.userId, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-sentinel-400/50">
                          <option value="VIEWER" className="bg-slate-900">VIEWER</option>
                          <option value="EDITOR" className="bg-slate-900">EDITOR</option>
                          <option value="ADMIN" className="bg-slate-900">ADMIN</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${u.enabled ? 'text-emerald-400' : 'text-red-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.enabled ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {u.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.userId !== currentUser?.userId && (
                        <button onClick={() => handleToggleUser(u)}
                          className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                            u.enabled ? 'text-red-400 hover:bg-red-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'
                          }`}>
                          {u.enabled ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Recent Activity</h3>
          <AuditTimeline events={audit} />
        </div>
      )}
    </motion.div>
  )
}
