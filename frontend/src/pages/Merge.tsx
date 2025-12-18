import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { IconMerge } from '../components/icons'
import React from 'react'
import './ops.css'
import MergeBoard from '../components/MergeBoard'



export default function Merge() {
  const [files, setFiles] = React.useState<File[]>([])
  const [merged, setMerged] = React.useState(false)
  const [ctaPulse, setCtaPulse] = React.useState(false)

  function handleFilesChange(next: File[]) {
    setFiles(next)
    setCtaPulse(true)
    setTimeout(() => setCtaPulse(false), 680)
    // reset merged flag when new files are added
    if (merged) setMerged(false)
  }

  return (
    <main className="page page-ops">
      <section className="ops-hero">
        <div className="ops-hero-inner">
          <div>
            <h1>Merge PDFs</h1>
            <p className="sub">Combine multiple PDF documents into a single file quickly and securely in your browser.</p>
            <div style={{ marginTop: 12 }}>
              {files.length === 0 ? (
                <>
                  <Button variant="primary" className={ctaPulse ? 'cta-pulse' : ''} onClick={(e) => { e.preventDefault(); (document.getElementById('merge-upload') as HTMLInputElement | null)?.click() }}>
                    Upload PDFs
                  </Button>
                  <input id="merge-upload" className="sr-only" type="file" accept="application/pdf" multiple onChange={(e)=>{
                    const added = Array.from(e.currentTarget.files || [])
                    if (added.length) {
                      handleFilesChange([...(files || []), ...added])
                      e.currentTarget.value = ''
                    }
                  }} />
                </>
              ) : null}
            </div>

            <div style={{ marginTop: 12 }}>
              <div className="merge-helper">{files.length ? 'Reorder thumbnails to set the merge order, then click Merge to download.' : 'Upload or drag files below to add them. Reorder thumbnails to set the merge order.'}</div>

              {/* Stepper + status */}
              <div style={{ marginTop: 12 }}>
                <div className="stepper">
                  <div className={`step ${files.length ? 'done' : ''}`}>
                    <div className="step-icon">{files.length ? '✓' : '1'}</div>
                    <div className="step-label">Upload</div>
                  </div>
                  <div className={`step ${files.length ? 'active' : ''}`}>
                    <div className="step-icon">2</div>
                    <div className="step-label">Arrange</div>
                  </div>
                  <div className={`step ${merged ? 'done' : ''}`}>
                    <div className="step-icon">{merged ? '✓' : '3'}</div>
                    <div className="step-label">Merge</div>
                  </div>

                  {files.length > 0 && (
                    <div className={`status-pill ${ctaPulse ? 'pulse' : ''}`}>{files.length} file{files.length>1?'s':''} ready</div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <MergeBoard files={files} onFilesChange={handleFilesChange} onMergeComplete={(f) => { try { window.dispatchEvent(new CustomEvent('pdf-upload', { detail: f })) } catch (err) {} ; try { setMerged(true) } catch(err){} }} />
              </div>
            </div>

            <div className="ops-details">
              <h3>How merge works</h3>
              <p className="sub">Select multiple PDFs in the order you want them combined. We merge pages client-side so your files never leave your device.</p>
              <ul className="ops-features">
                <li><strong>Best for:</strong> Combining reports, chapters, or scans into a single file.</li>
                <li><strong>Quick tip:</strong> Upload files in the desired order; we'll preserve that order in the merged result.</li>
                <li><strong>Privacy:</strong> Processing happens in your browser — we do not upload your files.</li>
              </ul>
            </div>

            <div className="examples">
              <div className="example-card">
                <h4>Meeting notes</h4>
                <p className="sub">Combine minutes and attachments into one document.</p>
                <div className="example-actions"><button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('meeting.pdf','Meeting notes sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try sample</button></div>
              </div>

              <div className="example-card">
                <h4>Scanned pages</h4>
                <p className="sub">Merge scanned images converted to PDF for a single clean file.</p>
                <div className="example-actions"><button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('scanned.pdf','Scanned pages sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try sample</button></div>
              </div>

              <div className="example-card">
                <h4>Chapter collection</h4>
                <p className="sub">Collect chapters or sections into one printable file.</p>
                <div className="example-actions"><button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('chapter.pdf','Chapter sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try sample</button></div>
              </div>
            </div>
          </div>

          <div aria-hidden>
            <Card>
              <div className="icon"><IconMerge /></div>
              <h3>Batch-friendly</h3>
              <p>Upload multiple files and merge them in the order you choose.</p>
            </Card>
          </div>


        </div>
      </section>
    </main>
  )
} 