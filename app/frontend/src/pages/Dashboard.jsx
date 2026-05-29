import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { documents } from '../services/api'
import FileCard from '../components/FileCard'
import FileUpload from '../components/FileUpload'
import { Search, Grid3X3, List, Upload, X, FolderOpen, File } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showUpload, setShowUpload] = useState(false)
  const [previewFile, setPreviewFile] = useState(null)

  const canUpload = user?.role === 'EDITOR' || user?.role === 'ADMIN'
  const canDelete = user?.role === 'ADMIN'
  const canDownload = user?.role === 'EDITOR' || user?.role === 'ADMIN'

  const loadFiles = useCallback(async () => {
    try {
      const res = await documents.list({ search })
      const mapFile = (f) => ({
        id: f.s3Key,
        name: f.fileName,
        originalName: f.fileName,
        contentType: f.contentType,
        size: f.fileSize,
        uploadDate: f.uploadedAt,
        uploadedBy: f.uploadedBy,
        s3Key: f.s3Key,
      })
      setFiles((res.data.data || []).map(mapFile))
    } catch {
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { loadFiles() }, [loadFiles])

  const handleUpload = async (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      await documents.upload(formData, onProgress)
      toast.success('File uploaded successfully!')
      setShowUpload(false)
      loadFiles()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
      throw err
    }
  }

  const handleDownload = async (file) => {
    try {
      const res = await documents.download(file.id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = file.originalName || file.name
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error('Download failed')
    }
  }

  const handleDelete = async (file) => {
    if (!confirm(`Delete "${file.originalName || file.name}"?`)) return
    try {
      await documents.delete(file.id)
      toast.success('File deleted')
      loadFiles()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-slate-400 text-sm mt-1">{files.length} file{files.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="glass-input w-full pl-10 py-2.5"
            />
          </div>
          <div className="flex glass rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('grid')}
              className={`p-2.5 ${viewMode === 'grid' ? 'bg-white/10 text-sentinel-400' : 'text-slate-500 hover:text-white'}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-2.5 ${viewMode === 'list' ? 'bg-white/10 text-sentinel-400' : 'text-slate-500 hover:text-white'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
          {canUpload && (
            <button onClick={() => setShowUpload(!showUpload)}
              className="btn-primary flex items-center gap-2 py-2.5">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload zone */}
      <AnimatePresence>
        {showUpload && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <FileUpload onUpload={handleUpload} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Files */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-sentinel-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No documents yet</h3>
          <p className="text-slate-500 text-sm">
            {canUpload ? 'Upload your first document to get started.' : 'No documents have been uploaded yet.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {files.map(file => (
              <FileCard key={file.id} file={file} canDelete={canDelete} canUpload={canUpload} canDownload={canDownload}
                onDelete={handleDelete} onDownload={handleDownload} onPreview={setPreviewFile} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Size</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map(file => (
                <tr key={file.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <File className="w-4 h-4 text-sentinel-400" />
                      <span className="text-sm text-white truncate max-w-xs">{file.originalName || file.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{(file.size / 1024).toFixed(1)} KB</td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {file.uploadDate ? new Date(file.uploadDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {canDownload && (
                        <button onClick={() => handleDownload(file)} className="btn-ghost py-1 px-3 text-xs">Download</button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(file)} className="btn-danger py-1 px-3 text-xs">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <button onClick={() => setPreviewFile(null)}
                className="absolute -top-3 -right-3 p-2 rounded-full glass hover:bg-white/20 z-10">
                <X className="w-5 h-5 text-white" />
              </button>
              <img
                src={`${import.meta.env.VITE_API_URL || '/api'}/documents/download?key=${encodeURIComponent(previewFile.s3Key || previewFile.id)}&token=${localStorage.getItem('token')}`}
                alt={previewFile.originalName}
                className="max-w-full max-h-[85vh] rounded-2xl object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
