import React, { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PdfViewer from '../components/PdfViewer'
import { IconCompress } from '../components/icons'
import './ops.css'
import { useToast } from '../components/ToastProvider'

export default function Compress() {
  const { addToast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [compressionLevel, setCompressionLevel] = useState<number>(0.7)
  const [status, setStatus] = useState<{ loading: boolean; message?: string }>({ loading: false })
  const [compressedFile, setCompressedFile] = useState<{ url: string; size: number; originalSize: number } | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (compressedFile) URL.revokeObjectURL(compressedFile.url)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [compressedFile, previewUrl])

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement> | File | null) {
    const f = (e && (e as File).name ? e as File : (e as React.ChangeEvent<HTMLInputElement>)?.currentTarget?.files?.[0]) || null
    if (!f) return
    setFile(f)
    setCompressedFile(null)
    try { window.dispatchEvent(new CustomEvent('pdf-upload', { detail: f })) } catch (err) {}
    try { addToast('File loaded') } catch (err) {}
    if ((e as React.ChangeEvent<HTMLInputElement>)?.currentTarget) {
      (e as React.ChangeEvent<HTMLInputElement>).currentTarget.value = ''
    }
  }

  async function handleCompress() {
    if (!file) return
    
    setStatus({ loading: true, message: 'Compressing PDF...' })
    
    try {
      const form = new FormData()
      form.append('file', file, file.name)
      form.append('level', compressionLevel.toString())

      const res = await fetch('/api/compress', {
        method: 'POST',
        body: form,
      })

      if (!res.ok) {
        const txt = await res.text().catch(() => 'Compression failed')
        setStatus({ loading: false, message: `Compression failed: ${txt}` })
        try { addToast(`Compression failed: ${txt}`) } catch (err) {}
        return
      }

      const blob = await res.blob()
      if (!blob || blob.size < 100) {
        setStatus({ loading: false, message: 'Compression produced invalid result' })
        try { addToast('Compression failed') } catch (err) {}
        return
      }

      const originalSize = file.size
      const compressedSize = blob.size
      const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1)
      
      const url = URL.createObjectURL(blob)
      setCompressedFile({ url, size: compressedSize, originalSize })
      setStatus({ loading: false, message: `Compressed successfully! Reduced by ${compressionRatio}%` })
      try { addToast(`Compressed successfully! Reduced by ${compressionRatio}%`) } catch (err) {}
      
    } catch (err: any) {
      console.error('Compression failed', err)
      setStatus({ loading: false, message: 'Compression failed' })
      try { addToast('Compression failed') } catch (e) {}
    }
  }

  function downloadCompressed() {
    if (!compressedFile) return
    const a = document.createElement('a')
    a.href = compressedFile.url
    const originalName = file?.name || 'document.pdf'
    a.download = originalName.replace(/\.pdf$/i, '') + '-compressed.pdf'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <main className="page page-ops">
      {previewOpen && previewUrl && (
        <div className="pdf-preview-overlay" role="dialog" aria-label="PDF preview">
          <div className="pdf-preview-backdrop" onClick={() => { setPreviewOpen(false); setTimeout(()=>{ if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) } }, 80) }} />
          <div className="pdf-preview-popup" style={{ width: '86vw', maxWidth: 1100 }}>
            <div className="pdf-preview-header">
              <div className="pdf-preview-title">Preview</div>
              <div className="pdf-preview-meta">Previewing compressed file</div>
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
            <h1>Compress PDF</h1>
            <p className="sub">Reduce file size while keeping text readable — perfect for sharing.</p>
            
            <div style={{ marginTop: 12 }}>
              {file ? null : (
                <>
                  <Button variant="primary" onClick={(e) => { e.preventDefault(); (document.getElementById('compress-upload') as HTMLInputElement | null)?.click() }}>
                    Upload PDF to compress
                  </Button>
                  <input id="compress-upload" className="sr-only" type="file" accept="application/pdf" onChange={onFileChange} />
                </>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <div className="merge-helper">
                {file 
                  ? 'Adjust compression level and click Compress to reduce file size.' 
                  : 'Upload or drag a PDF file below to compress it.'}
              </div>

              {file && (
                <div style={{ marginTop: 12 }}>
                  <div className="stepper">
                    <div className="step done">
                      <div className="step-icon">✓</div>
                      <div className="step-label">Upload</div>
                    </div>
                    <div className={`step ${compressedFile ? 'done' : 'active'}`}>
                      <div className="step-icon">{compressedFile ? '✓' : '2'}</div>
                      <div className="step-label">Compress</div>
                    </div>
                    <div className={`step ${compressedFile ? 'active' : ''}`}>
                      <div className="step-icon">3</div>
                      <div className="step-label">Download</div>
                    </div>
                    {file && (
                      <div className="status-pill">
                        {formatFileSize(file.size)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!file && (
                <div style={{ marginTop: 12 }}>
                  <div className="dropzone" onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if (f) onFileChange(f); }} onDragOver={(e) => e.preventDefault()}>
                    <div className="drop-hint">
                      <p className="h1">Drag & drop a PDF here</p>
                      <p className="muted">Or click to upload and compress</p>
                      <input id="compress-upload-drop" aria-label="Upload PDF to compress" className="upload-input" type="file" accept="application/pdf" onChange={onFileChange} />
                    </div>
                  </div>
                </div>
              )}

              {file && (
                <div style={{ marginTop: 12 }}>
                  <div className="file-info-card" style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                        <div className="muted" style={{ fontSize: '0.85rem' }}>
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <label htmlFor="compress-upload-replace">
                        <button className="btn small ghost" onClick={(e) => { e.stopPropagation(); }} aria-label="Replace file">
                          Replace
                        </button>
                      </label>
                      <input id="compress-upload-replace" className="sr-only" type="file" accept="application/pdf" onChange={onFileChange} />
                      <button 
                        className="btn small ghost" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setFile(null); 
                          setCompressedFile(null);
                          setStatus({ loading: false });
                        }} 
                        aria-label="Remove file"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {file && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div className="muted" style={{ fontWeight: 600, fontSize: '0.95rem' }}>Compression Level</div>
                    <div className="status-pill" style={{ fontSize: '0.85rem' }}>
                      {compressionLevel < 0.3 ? 'Low' : compressionLevel < 0.7 ? 'Medium' : 'High'}
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.1" 
                    value={compressionLevel} 
                    onChange={(e) => setCompressionLevel(parseFloat(e.target.value))}
                    style={{ width: '100%', height: 8, borderRadius: 4 }}
                    disabled={status.loading}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.8rem', color: 'var(--muted)' }}>
                    <span>Better Quality</span>
                    <span>Smaller Size</span>
                  </div>
                  
                  <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button 
                      variant="primary" 
                      onClick={(e) => { e.preventDefault(); handleCompress() }} 
                      disabled={!file || status.loading}
                      style={{ 
                        position: 'relative',
                        overflow: 'hidden',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        padding: '12px 20px'
                      }}
                    >
                      {status.loading ? (
                        <>
                          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: 8 }}>⚙️</span>
                          Compressing…
                        </>
                      ) : (
                        <>
                          🗜️ Compress PDF
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {status.message && (
                    <div className={`status-message ${status.loading ? 'loading' : compressedFile ? 'success' : ''}`} style={{ marginTop: 12 }}>
                      {status.loading && (
                        <span style={{ fontSize: '1.1rem', display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙️</span>
                      )}
                      {compressedFile && !status.loading && <span style={{ fontSize: '1.1rem' }}>✓</span>}
                      <span>{status.message}</span>
                    </div>
                  )}

                  {compressedFile && (
                    <div className="results-card" style={{ marginTop: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, background: 'linear-gradient(135deg, var(--text), rgba(231, 238, 248, 0.8))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                          Compression Results
                        </h4>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>Original Size</div>
                            <div style={{ fontWeight: 600, fontSize: '1rem' }}>{formatFileSize(compressedFile.originalSize)}</div>
                          </div>
                          <div style={{ fontSize: '1.5rem', color: 'var(--muted)' }}>→</div>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>Compressed Size</div>
                            <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--success)' }}>{formatFileSize(compressedFile.size)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>Reduction</div>
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--success)' }}>
                              {((1 - compressedFile.size / compressedFile.originalSize) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <Button variant="primary" onClick={downloadCompressed} style={{ fontWeight: 600 }}>
                            ⬇️ Download Compressed PDF
                          </Button>
                          <Button variant="ghost" onClick={() => { 
                            if (compressedFile.url) {
                              setPreviewUrl(compressedFile.url)
                              setPreviewOpen(true)
                            }
                          }}>
                            👁️ Preview
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="ops-details">
              <h3>How compression works</h3>
              <p className="sub">We optimize images and remove unnecessary metadata to reduce file size while maintaining legibility.</p>
              <ul className="ops-features">
                <li><strong>Best for:</strong> Sharing large scans or presentations without losing readability.</li>
                <li><strong>Quick tip:</strong> For photos-heavy PDFs, expect larger gains than for text-only files.</li>
                <li><strong>Compression levels:</strong> Lower levels preserve more quality, higher levels reduce size more.</li>
              </ul>
            </div>

            <div className="examples">
              <div className="example-card">
                <h4>Presentation slides</h4>
                <p className="sub">Compress slide decks to make sharing easier.</p>
                <div className="example-actions">
                  <button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('slides.pdf','Slides sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try sample</button>
                </div>
              </div>

              <div className="example-card">
                <h4>Scanned receipts</h4>
                <p className="sub">Compress scanned receipts to store more on your device.</p>
                <div className="example-actions">
                  <button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('receipts.pdf','Receipts sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try sample</button>
                </div>
              </div>
            </div>
          </div>

          <div aria-hidden>
            <Card>
              <div className="icon"><IconCompress /></div>
              <h3>Optimize PDFs</h3>
              <p>Compress images and remove excess metadata for a smaller download.</p>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
