import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { IconSplit } from '../components/icons'
import './ops.css'

export default function Split() {
  return (
    <main className="page page-ops">
      <section className="ops-hero">
        <div className="ops-hero-inner">
          <div>
            <h1>Split & Extract</h1>
            <p className="sub">Split a large PDF into smaller files or extract specific pages.</p>
            <div style={{ marginTop: 12 }}>
              <label htmlFor="split-upload">
                <Button variant="primary" onClick={(e) => { e.preventDefault(); (document.getElementById('split-upload') as HTMLInputElement | null)?.click() }}>Upload PDF to split</Button>
              </label>
            </div>
            <input id="split-upload" className="sr-only" type="file" accept="application/pdf" onChange={(e)=>{
              const file = e.currentTarget.files?.[0]
              if (file) {
                try { window.dispatchEvent(new CustomEvent('pdf-upload', { detail: file })) } catch (err) {}
                e.currentTarget.value = ''
              }
            }} />

            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('split-sample.pdf','Split sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try with a sample</button>
            </div>

            <div className="ops-details">
              <h3>How splitting works</h3>
              <p className="sub">Upload a PDF and specify page ranges to extract. You can split by single pages or ranges to create precise outputs.</p>
              <ul className="ops-features">
                <li><strong>Best for:</strong> Extracting chapters, images, or pages for sharing.</li>
                <li><strong>Quick tip:</strong> Use a comma-separated page list (e.g., 1-3,6,9) to get exactly the pages you need.</li>
                <li><strong>Privacy:</strong> Everything runs locally in your browser — nothing is uploaded.</li>
              </ul>
            </div>

            <div className="examples">
              <div className="example-card">
                <h4>Chapter extract</h4>
                <p className="sub">Extract specific pages from a long report for review.</p>
                <div className="example-actions"><button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('chapter-extract.pdf','Chapter extract sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try sample</button></div>
              </div>

              <div className="example-card">
                <h4>Image extraction</h4>
                <p className="sub">Extract pages with images for reuse.</p>
                <div className="example-actions"><button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('images.pdf','Images sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try sample</button></div>
              </div>
            </div>
          </div>

          <div aria-hidden>
            <Card>
              <div className="icon"><IconSplit /></div>
              <h3>Extract pages</h3>
              <p>Choose pages to extract and download them separately.</p>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
} 