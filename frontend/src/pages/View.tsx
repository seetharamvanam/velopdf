import { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PdfViewer from '../components/PdfViewer'
import { IconPdf } from '../components/icons'
import './ops.css'
import { useToast } from '../components/ToastProvider'

export default function View() {
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [filename, setFilename] = useState<string | null>(null)
  const { addToast } = useToast()

  function loadFile(file: File) {
    if (!file) return
    // Basic validation
    if (file.type && !file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file.')
      return
    }

    if (viewerUrl) {
      try { URL.revokeObjectURL(viewerUrl) } catch (e) {}
    }
    const u = URL.createObjectURL(file)
    setViewerUrl(u)
    setFilename(file.name)
    try { addToast('File opened') } catch (err) {}
  }

  useEffect(() => {
    function onPdfUpload(e: Event) {
      const ce = e as CustomEvent<File>
      const f = ce?.detail
      if (f) loadFile(f)
    }
    window.addEventListener('pdf-upload', onPdfUpload as EventListener)
    return () => {
      window.removeEventListener('pdf-upload', onPdfUpload as EventListener)
      if (viewerUrl) URL.revokeObjectURL(viewerUrl)
    }
  }, [viewerUrl])

  return (
    <main className="page page-ops">
      <section className="ops-hero">
        <div className="ops-hero-inner">
          <div>
            <h1>View PDF</h1>
            <p className="sub">Open and inspect PDFs with a fast in-browser viewer. Use the sample files or upload your own.</p>

            <div style={{ marginTop: 12 }}>
              <label htmlFor="view-upload">
                <Button variant="primary" onClick={(e) => { e.preventDefault(); (document.getElementById('view-upload') as HTMLInputElement | null)?.click() }}>Open PDF</Button>
              </label>
              <input id="view-upload" className="sr-only" type="file" accept="application/pdf" onChange={(e)=>{
                const f = e.currentTarget.files?.[0]
                if (f) loadFile(f)
                e.currentTarget.value = ''
              }} />

              <Button variant="ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('viewer-sample.pdf','Viewer sample')).then(f=>loadFile(f)) }} style={{ marginLeft: 8 }}>Try sample</Button>

            </div>

            <div className="ops-details" style={{ marginTop: 12 }}>
              <h3>Viewer basics</h3>
              <p className="sub">This lightweight viewer displays the selected PDF so you can quickly inspect pages, layouts and annotations without leaving your browser.</p>
              <ul className="ops-features">
                <li><strong>Open files:</strong> Local files only — we never upload them.</li>
                <li><strong>Quick tips:</strong> Use the browser's print/save-as options to export pages.</li>
                <li><strong>Privacy:</strong> Viewing happens entirely client-side.</li>
              </ul>
            </div>

          </div>

          <div aria-hidden>
            <Card>
              <div className="icon"><IconPdf /></div>
              <h3>Instant preview</h3>
              <p>Open PDFs to preview pages and layout before editing or exporting.</p>
            </Card>
          </div>
        </div>

        {viewerUrl && (
          <div style={{ maxWidth: 1100, margin: '20px auto 0' }}>
            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><strong>{filename}</strong></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a className="btn ghost" href={viewerUrl} target="_blank" rel="noreferrer">Open in new tab</a>
                <a className="btn primary" href={viewerUrl} download={filename ?? 'file.pdf'}>Download</a>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              {/* Custom viewer */}
              <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <PdfViewer src={viewerUrl} filename={filename ?? undefined} />
              </div>
            </div>
          </div>
        )}

      </section>
    </main>
  )
}