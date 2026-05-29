import { motion } from 'framer-motion'
import { FileText, Image, FileSpreadsheet, FileCode, File, Download, Trash2, Eye } from 'lucide-react'
import RoleBadge from './RoleBadge'

const typeIcons = {
  'image/': Image,
  'text/': FileText,
  'application/pdf': FileText,
  'application/vnd': FileSpreadsheet,
  'application/json': FileCode,
}

function getFileIcon(mimeType) {
  for (const [key, Icon] of Object.entries(typeIcons)) {
    if (mimeType?.startsWith(key)) return Icon
  }
  return File
}

function formatSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function FileCard({ file, onDelete, onDownload, onPreview, canDelete, canUpload }) {
  const Icon = getFileIcon(file.contentType)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className="glass-card p-5 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sentinel-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2.5 rounded-xl bg-sentinel-400/10">
            <Icon className="w-5 h-5 text-sentinel-400" />
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {file.contentType?.startsWith('image/') && (
              <button onClick={() => onPreview?.(file)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Preview">
                <Eye className="w-4 h-4 text-slate-400" />
              </button>
            )}
            <button onClick={() => onDownload?.(file)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Download">
              <Download className="w-4 h-4 text-sentinel-400" />
            </button>
            {canDelete && (
              <button onClick={() => onDelete?.(file)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors" title="Delete">
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            )}
          </div>
        </div>
        <h3 className="text-sm font-medium text-white truncate mb-2" title={file.name}>
          {file.name || file.originalName}
        </h3>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{formatSize(file.size)}</span>
          <span>{file.uploadDate ? new Date(file.uploadDate).toLocaleDateString() : ''}</span>
        </div>
        {file.uploader && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-slate-500">{file.uploader.username}</span>
            <RoleBadge role={file.uploader.role} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
