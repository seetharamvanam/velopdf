import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { IconMerge } from '../components/icons'
import './ops.css'

export default function Merge() {
  return (
    <main className="page page-ops">
      <section className="ops-hero">
        <div className="ops-hero-inner">
          <div>
            <h1>Merge PDFs</h1>
            <p className="sub">Combine multiple PDF documents into a single file quickly and securely in your browser.</p>
            <div style={{ marginTop: 12 }}>
              <label htmlFor="merge-upload">
                <Button variant="primary" onClick={(e) => { e.preventDefault(); (document.getElementById('merge-upload') as HTMLInputElement | null)?.click() }}>Upload PDFs to merge</Button>
              </label>
            </div>
            <input id="merge-upload" className="sr-only" type="file" accept="application/pdf" multiple onChange={(e)=>{
              const files = Array.from(e.currentTarget.files || [])
              if (files.length) {
                // For now dispatch first file; the UploadDemo is a single-file demo — in future we can extend
                try { window.dispatchEvent(new CustomEvent('pdf-upload', { detail: files[0] })) } catch (err) {}
                e.currentTarget.value = ''
              }
            }} />

            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button
                className="btn ghost"
                onClick={async (e) => {
                  e.preventDefault()
                  try {
                    const m = await import('../utils/sample')
                    const a = await m.createSamplePdf('sample-a.pdf', 'Sample A')
                    const b = await m.createSamplePdf('sample-b.pdf', 'Sample B')
                    window.dispatchEvent(new CustomEvent('pdf-upload', { detail: a }))
                    setTimeout(() => window.dispatchEvent(new CustomEvent('pdf-upload', { detail: b })), 300)
                  } catch (err) {
                    // ignore
                  }
                }}
              >
                Try with sample files
              </button>
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