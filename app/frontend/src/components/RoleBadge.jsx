const colors = {
  ADMIN: 'bg-red-500/20 text-red-400 border-red-500/30',
  EDITOR: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  VIEWER: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

export default function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[role] || colors.VIEWER}`}>
      {role}
    </span>
  )
}
