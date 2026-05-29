import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CloudUpload, X, CheckCircle } from 'lucide-react'

export default function FileUpload({ onUpload }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [file, setFile] = useState(null)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }, [])

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setProgress(0)
    try {
      await onUpload(file, setProgress)
      setFile(null)
      setProgress(0)
    } catch {
      // error handled by caller
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      onDragOver={(e) => { handleDrag(e); setDragging(true) }}
      onDragLeave={(e) => { handleDrag(e); setDragging(false) }}
      onDrop={handleDrop}
      className={`relative glass-card p-8 border-2 border-dashed transition-all duration-300 ${
        dragging ? 'border-sentinel-400 bg-sentinel-400/10' : 'border-white/10'
      }`}
    >
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3">
            <motion.div animate={dragging ? { scale: 1.1, y: -8 } : { scale: 1 }}
              className="p-4 rounded-2xl bg-sentinel-400/10">
              <CloudUpload className="w-10 h-10 text-sentinel-400" />
            </motion.div>
            <p className="text-slate-300 text-sm">Drag & drop a file here, or <label className="text-sentinel-400 cursor-pointer hover:underline">
              browse
              <input type="file" className="hidden" onChange={(e) => e.target.files[0] && setFile(e.target.files[0])} />
            </label></p>
            <p className="text-slate-500 text-xs">Any file type up to 50MB</p>
          </motion.div>
        ) : (
          <motion.div key="file" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 rounded-lg bg-sentinel-400/10">
                <Upload className="w-5 h-5 text-sentinel-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {!uploading && (
                <button onClick={() => setFile(null)} className="p-1 rounded hover:bg-white/10">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
            {uploading && (
              <div className="w-full">
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-sentinel-400 to-blue-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1 text-center">{progress}%</p>
              </div>
            )}
            {!uploading && (
              <button onClick={handleUpload} className="btn-primary flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload File
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
