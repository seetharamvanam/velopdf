import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { IconConvert } from '../components/icons'
import './ops.css'

export default function Convert() {
  return (
    <main className="page page-ops">
      <section className="ops-hero">
        <div className="ops-hero-inner">
          <div>
            <h1>Convert PDF</h1>
            <p className="sub">Convert PDFs to Word, PNG, JPG or create PDFs from other formats.</p>
            <div style={{ marginTop: 12 }}>
              <label htmlFor="convert-upload">
                <Button variant="primary" onClick={(e) => { e.preventDefault(); (document.getElementById('convert-upload') as HTMLInputElement | null)?.click() }}>Upload PDF to convert</Button>
              </label>
            </div>
            <input id="convert-upload" className="sr-only" type="file" accept="application/pdf" onChange={(e)=>{
              const file = e.currentTarget.files?.[0]
              if (file) {
                try { window.dispatchEvent(new CustomEvent('pdf-upload', { detail: file })) } catch (err) {}
                e.currentTarget.value = ''
              }
            }} />

            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('convert-sample.pdf','Convert sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try with a sample</button>
            </div>

            <div className="ops-details">
              <h3>Supported targets</h3>
              <p className="sub">Pick the format you need and we'll convert locally in your browser — common targets: Word (.docx), PNG, JPG, and more.</p>
              <ul className="ops-features">
                <li><strong>Best for:</strong> Extracting images or converting documents for editing.</li>
                <li><strong>Quick tip:</strong> Convert to PDF/A for archiving or to image formats for use in presentations.</li>
                <li><strong>Privacy:</strong> Conversions happen client-side; files are not sent to a server.</li>
              </ul>
            </div>

            <div className="examples">
              <div className="example-card">
                <h4>Image extraction</h4>
                <p className="sub">Extract images from PDFs into separate files.</p>
                <div className="example-actions"><button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('images.pdf','Images sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try sample</button></div>
              </div>

              <div className="example-card">
                <h4>DOCX conversion</h4>
                <p className="sub">Convert PDFs to editable Word documents for quick edits.</p>
                <div className="example-actions"><button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('docx-sample.pdf','DOCX sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try sample</button></div>
              </div>
            </div>
          </div>

          <div aria-hidden>
            <Card>
              <div className="icon"><IconConvert /></div>
              <h3>Multiple targets</h3>
              <p>Choose output format and download converted files instantly.</p>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
} 