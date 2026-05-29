import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatsCard({ icon: Icon, title, value, trend, trendLabel }) {
  const isUp = trend > 0

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="glass-card p-6 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sentinel-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-sentinel-400/10">
            <Icon className="w-6 h-6 text-sentinel-400" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <p className="text-slate-400 text-sm mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {trendLabel && <p className="text-xs text-slate-500 mt-1">{trendLabel}</p>}
      </div>
    </motion.div>
  )
}
