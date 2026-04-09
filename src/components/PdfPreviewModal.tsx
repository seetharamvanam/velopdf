import React from 'react'
import PdfViewer from './PdfViewer'

interface PdfPreviewModalProps {
  open: boolean
  url: string | null
  filename?: string
  meta?: string
  onClose: () => void
}

export default function PdfPreviewModal({ open, url, filename, meta = 'Previewing file', onClose }: PdfPreviewModalProps) {
  if (!open || !url) return null

  return (
    <div className="pdf-preview-overlay" role="dialog" aria-label="PDF preview">
      <div className="pdf-preview-backdrop" onClick={onClose} />
      <div className="pdf-preview-popup" style={{ width: '86vw', maxWidth: 1100 }}>
        <div className="pdf-preview-header">
          <div className="pdf-preview-title">Preview</div>
          <div className="pdf-preview-meta">{meta}</div>
          <button className="btn small" onClick={onClose} aria-label="Close preview">✕</button>
        </div>
        <div className="pdf-preview-body">
          <div style={{ width: '100%', height: '70vh' }}>
            <PdfViewer src={url} filename={filename} />
          </div>
        </div>
      </div>
    </div>
  )
}
