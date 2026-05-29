import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { auth } from '../services/api'
import RoleBadge from '../components/RoleBadge'
import { User, Lock, Save, Mail, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user } = useAuth()
  const [passwords, setPasswords] = useState({ current: '', newPassword: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirm) return toast.error('Passwords do not match')
    if (passwords.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await auth.changePassword(passwords)
      toast.success('Password changed successfully')
      setPasswords({ current: '', newPassword: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account</p>
      </div>

      {/* User Info */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sentinel-400 to-blue-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-sentinel-400/25">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.username}</h2>
            <RoleBadge role={user?.role} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <User className="w-4 h-4 text-sentinel-400" />
            <div>
              <p className="text-xs text-slate-500">Username</p>
              <p className="text-sm text-white">{user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <Mail className="w-4 h-4 text-sentinel-400" />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-sm text-white">{user?.email || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <Lock className="w-4 h-4 text-sentinel-400" />
            <div>
              <p className="text-xs text-slate-500">Role</p>
              <p className="text-sm text-white">{user?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <Calendar className="w-4 h-4 text-sentinel-400" />
            <div>
              <p className="text-xs text-slate-500">Member Since</p>
              <p className="text-sm text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-sentinel-400" />
          Change Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Password</label>
            <input type="password" value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="glass-input w-full" placeholder="Enter current password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
            <input type="password" value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="glass-input w-full" placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
            <input type="password" value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="glass-input w-full" placeholder="Repeat new password" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Password
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  )
}
