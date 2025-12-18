import React, { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { IconSplit } from '../components/icons'
import './ops.css'
import { useToast } from '../components/ToastProvider'

function parseRanges(input: string, total: number) {
  const cleaned = (input || '').trim()
  if (!cleaned) return []
  const parts = cleaned.split(',').map(p => p.trim()).filter(Boolean)
  const ranges: { start: number; end: number }[] = []
  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      const n = parseInt(part, 10)
      if (n < 1 || n > total) throw new Error(`Page ${n} is out of range`)
      ranges.push({ start: n, end: n })
    } else if (/^\d+-\d+$/.test(part)) {
      const [a, b] = part.split('-').map(x => parseInt(x.trim(), 10))
      if (isNaN(a) || isNaN(b)) throw new Error(`Invalid range: ${part}`)
      if (a < 1 || b < 1 || a > total || b > total) throw new Error(`Range ${part} is out of bounds`)
      if (a > b) throw new Error(`Invalid range: ${part}`)
      ranges.push({ start: a, end: b })
    } else {
      throw new Error(`Invalid range token: ${part}`)
    }
  }
  return ranges
}

async function splitPdfByRanges(file: File, ranges: { start: number; end: number }[], onProgress?: (done: number, total: number) => void) {
  const { PDFDocument } = await import('pdf-lib')
  const bytes = new Uint8Array(await file.arrayBuffer())
  const src = await PDFDocument.load(bytes)
  const outputs: { name: string; blob: Blob }[] = []
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i]
    if (onProgress) onProgress(i, ranges.length)
    const out = await PDFDocument.create()
    const indices = [] as number[]
    for (let p = r.start; p <= r.end; p++) indices.push(p - 1)
    const copied = await out.copyPages(src, indices)
    copied.forEach((p) => out.addPage(p))
    const outBytes = await out.save()
    outputs.push({ name: `${file.name.replace(/\.pdf$/i, '')}-${r.start}-${r.end}.pdf`, blob: new Blob([outBytes], { type: 'application/pdf' }) })
  }
  if (onProgress) onProgress(ranges.length, ranges.length)
  return outputs
}

export default function Split() {
  const { addToast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [rangesText, setRangesText] = useState('')
  const [status, setStatus] = useState<{ loading: boolean; message?: string }>({ loading: false })
  const [results, setResults] = useState<{ name: string; url: string; size: number }[]>([])

  const [dragging, setDragging] = useState(false)
  const thumbsRef = React.useRef<HTMLDivElement | null>(null)
  const renderTasksRef = React.useRef<any[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      results.forEach(r => URL.revokeObjectURL(r.url))
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [results, previewUrl])

  async function ensurePdfWorkerLocal() {
    try {
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf')
      try {
        const w = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')
        pdfjs.GlobalWorkerOptions.workerSrc = (w && (w as any).default) || (w as any)
      } catch (err) {
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.20.377/pdf.worker.min.js'
      }
    } catch (err) {
      // ignore
    }
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement> | File | null) {
    const f = (e && (e as File).name ? e as File : (e as React.ChangeEvent<HTMLInputElement>)?.currentTarget?.files?.[0]) || null
    if (!f) return
    setFile(f)
    // broadcast for other UI
    try { window.dispatchEvent(new CustomEvent('pdf-upload', { detail: f })) } catch (err) {}
    try { addToast('File loaded') } catch (err) {}
    // load to get page count
    try {
      setStatus({ loading: true, message: 'Reading PDF...' })
      const { PDFDocument } = await import('pdf-lib')
      const bytes = new Uint8Array(await f.arrayBuffer())
      const pdf = await PDFDocument.load(bytes)
      const pages = pdf.getPageCount ? (pdf.getPageCount() as unknown as number) : (pdf.getPages().length)
      setNumPages(pages)
      setStatus({ loading: false })
      // generate thumbnails asynchronously
      setTimeout(() => generateThumbnails(f, Math.min(pages, 20)), 50)
    } catch (err: any) {
      console.error('Failed to load PDF for split:', err)
      setStatus({ loading: false, message: 'Failed to read PDF' })
    } finally {
      if ((e as React.ChangeEvent<HTMLInputElement>)?.currentTarget) (e as React.ChangeEvent<HTMLInputElement>).currentTarget.value = ''
    }
  }

  async function handleSplit() {
    if (!file) return
    if (!numPages) return
    let ranges
    try {
      ranges = parseRanges(rangesText, numPages)
      if (!ranges.length) { setStatus({ loading: false, message: 'No ranges specified' }); return }
    } catch (err: any) {
      setStatus({ loading: false, message: err.message || 'Invalid ranges' })
      return
    }
    setStatus({ loading: true, message: 'Splitting...' })
    try {
      const outputs = await splitPdfByRanges(file, ranges, (done, total) => setStatus({ loading: true, message: `Processing ${done}/${total}` }))
      const res = outputs.map(o => ({ name: o.name, url: URL.createObjectURL(o.blob), size: o.blob.size }))
      setResults(res)
      setStatus({ loading: false, message: `Created ${res.length} file(s)` })
      try { addToast(`Created ${res.length} file(s)`) } catch (err) {}
    } catch (err: any) {
      console.error('Split failed', err)
      setStatus({ loading: false, message: 'Split failed' })
    }
  }

  // generate thumbnails using PDF.js (first N pages)
  async function generateThumbnails(file: File, maxPages = 8) {
    if (!thumbsRef.current) return
    thumbsRef.current.innerHTML = ''
    renderTasksRef.current.forEach(t => { try { t.cancel?.() } catch {} })
    renderTasksRef.current = []
    try {
      await ensurePdfWorkerLocal()
      const pdfjs = (await import('pdfjs-dist/legacy/build/pdf')) as any
      const bytes = new Uint8Array(await file.arrayBuffer())
      const loadingTask = pdfjs.getDocument({ data: bytes })
      const pdf = await loadingTask.promise
      const total = pdf.numPages || 0
      const limit = Math.min(maxPages, total)
      for (let p = 1; p <= limit; p++) {
        const page = await pdf.getPage(p)
        const vp = page.getViewport({ scale: 1 })
        const desiredWidth = 110
        const scale = desiredWidth / vp.width
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(viewport.width)
        canvas.height = Math.round(viewport.height)
        canvas.className = 'page-thumb'
        canvas.setAttribute('data-page', String(p))
        const ctx = canvas.getContext('2d')!
        const renderTask = page.render({ canvasContext: ctx, viewport })
        renderTasksRef.current.push(renderTask)
        await renderTask.promise
        canvas.addEventListener('click', () => {
          // open preview modal using PdfViewer
          if (previewUrl) URL.revokeObjectURL(previewUrl)
          const url = URL.createObjectURL(file)
          setPreviewUrl(url)
          setPreviewOpen(true)
        })
        thumbsRef.current.appendChild(canvas)
      }
    } catch (err) {
      console.warn('Thumbnail generation failed', err)
    }
  }

  async function splitToPages() {
    if (!file || !numPages) return
    const ranges = Array.from({ length: numPages }, (_, i) => ({ start: i + 1, end: i + 1 }))
    setRangesText(ranges.map(r => r.start).join(','))
    setTimeout(handleSplit, 0)
  }

  function downloadResult(r: { name: string; url: string }) {
    const a = document.createElement('a')
    a.href = r.url
    a.download = r.name
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  function clearResults() {
    results.forEach(r => URL.revokeObjectURL(r.url))
    setResults([])
  }

  return (
    <main className="page page-ops">
      {/* Preview modal using PdfViewer */}
      {previewOpen && previewUrl && (
        <div className="pdf-preview-overlay" role="dialog" aria-label="PDF preview">
          <div className="pdf-preview-backdrop" onClick={() => { setPreviewOpen(false); setTimeout(()=>{ if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) } }, 80) }} />
          <div className="pdf-preview-popup" style={{ width: '86vw', maxWidth: 1100 }}>
            <div className="pdf-preview-header">
              <div className="pdf-preview-title">Preview</div>
              <div className="pdf-preview-meta">Previewing file</div>
              <button className="btn small" onClick={() => { setPreviewOpen(false); if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) } }} aria-label="Close preview">✕</button>
            </div>
            <div className="pdf-preview-body">
              <div style={{ width: '100%', height: '70vh' }}>
                <PdfViewer src={previewUrl} filename={file?.name} />
              </div>
            </div>
          </div>
        </div>
      )}
      <section className="ops-hero">
        <div className="ops-hero-inner">
          <div>
            <h1>Split & Extract</h1>
            <p className="sub">Split a large PDF into smaller files or extract specific pages — entirely in your browser.</p>

            <div style={{ marginTop: 12 }}>
              <label htmlFor="split-upload">
                <Button variant="primary" onClick={(e) => { e.preventDefault(); (document.getElementById('split-upload') as HTMLInputElement | null)?.click() }}>Upload PDF to split</Button>
              </label>
              <input id="split-upload" className="sr-only" type="file" accept="application/pdf" onChange={onFileChange} />
              <Button variant="ghost" onClick={(e) => { e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('split-sample.pdf','Split sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})); setFile(f); }catch(err){} }) }} style={{ marginLeft: 8 }}>Try a sample</Button>
            </div>

            <div style={{ marginTop: 16 }}>
                <div className="dropzone" onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if (f) onFileChange(f); }} onDragOver={(e) => e.preventDefault()}>
                {!file ? (
                  <div className="drop-hint">
                    <p className="h1">Drag & drop a PDF here</p>
                    <p className="muted">Or click to upload and then select pages to split</p>
                    <input id="split-upload" aria-label="Upload PDF to split" className="upload-input" type="file" accept="application/pdf" onChange={onFileChange} />
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ fontWeight: 600 }}>{file.name}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <label htmlFor="split-upload"><button className="btn ghost" onClick={(e) => { e.stopPropagation(); }} aria-label="Replace file">Replace</button></label>
                      <input id="split-upload" className="sr-only" type="file" accept="application/pdf" onChange={onFileChange} />
                      <button className="btn ghost" onClick={(e) => { e.stopPropagation(); setFile(null); setNumPages(null); clearResults(); setRangesText('') }} aria-label="Remove file">Remove</button>
                    </div>
                  </div>
                )}
              </div>

                <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div>
                    <div className="muted">Selected file</div>
                    <div style={{ fontWeight: 600 }}>{file ? file.name : 'No file selected'}</div>
                  </div>
                  <div>
                    <div className="muted">Pages</div>
                    <div style={{ fontWeight: 600 }}>{numPages ?? '-'}</div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div className="muted">Page ranges</div>
                  <input className="text-input" placeholder="e.g. 1-3,5,8-10" value={rangesText} onChange={(e) => setRangesText(e.target.value)} style={{ width: '100%', marginTop: 8 }} />
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <Button variant="primary" onClick={(e) => { e.preventDefault(); handleSplit() }} disabled={!file || !rangesText || status.loading}>{status.loading ? 'Processing…' : 'Split'}</Button>
                    <Button variant="ghost" onClick={(e) => { e.preventDefault(); splitToPages() }} disabled={!file || status.loading}>Split to single pages</Button>
                    <Button variant="ghost" onClick={(e) => { e.preventDefault(); setRangesText('') }}>Clear</Button>
                  </div>
                  {status.message && <div className="muted" style={{ marginTop: 8 }}>{status.message}</div>}
                </div>
              {file && (
                <div style={{ marginTop: 12 }}>
                  <div className="muted">Pages preview</div>
                  <div className="page-thumbs" ref={thumbsRef} />
                  <div className="muted" style={{ marginTop: 8 }}>Click a thumbnail to open a detailed preview.</div>
                </div>
              )}

              {results.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <h4>Results</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    {results.map(r => (
                      <div key={r.url} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1 }}>{r.name} <span className="muted">({(r.size/1024).toFixed(1)} KB)</span></div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn small" onClick={() => downloadResult(r)}>Download</button>
                          <button className="btn small" onClick={() => { URL.revokeObjectURL(r.url); setResults(prev => prev.filter(x => x.url !== r.url)) }}>Remove</button>
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: 12 }}>
                      <Button variant="ghost" onClick={() => { results.forEach(r => downloadResult(r)) }}>Download all</Button>
                      <Button variant="ghost" onClick={() => clearResults()} style={{ marginLeft: 8 }}>Clear all</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div aria-hidden>
            <Card>
              <div className="icon"><IconSplit /></div>
              <h3>Extract pages</h3>
              <p>Upload a PDF and specify page ranges to extract. You can split by single pages or ranges to create precise outputs.</p>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
} 