import { motion } from 'framer-motion'
import { ShieldCheck, Upload, Trash2, LogIn, UserPlus, Eye, Download, Shield } from 'lucide-react'

const actionConfig = {
  LOGIN: { icon: LogIn, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  REGISTER: { icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  UPLOAD: { icon: Upload, color: 'text-sentinel-400', bg: 'bg-sentinel-400/10', border: 'border-sentinel-400/20' },
  DOWNLOAD: { icon: Download, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  DELETE: { icon: Trash2, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
  VIEW: { icon: Eye, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  ROLE_CHANGE: { icon: Shield, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
}

const defaultConfig = { icon: ShieldCheck, color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' }

export default function AuditTimeline({ events }) {
  if (!events?.length) {
    return <div className="text-center text-slate-500 py-8">No audit events found</div>
  }

  return (
    <div className="space-y-0">
      {events.map((event, i) => {
        const config = actionConfig[event.action] || defaultConfig
        const Icon = config.icon

        return (
          <motion.div
            key={event.id || i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {i < events.length - 1 && (
              <div className="absolute left-[19px] top-10 bottom-0 w-px bg-white/5" />
            )}
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center z-10`}>
              <Icon className={`w-4 h-4 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0 glass-card p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-medium text-white">{event.action}</span>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {event.username || event.userId || 'System'}
                {event.details && <span className="ml-2 text-slate-500">— {event.details}</span>}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
