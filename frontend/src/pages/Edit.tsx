import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { IconEdit } from '../components/icons'
import './ops.css'

export default function Edit() {
  return (
    <main className="page page-ops">
      <section className="ops-hero">
        <div className="ops-hero-inner">
          <div>
            <h1>Edit & Sign</h1>
            <p className="sub">Edit text, rotate pages, add annotations and sign documents directly in your browser.</p>
            <div style={{ marginTop: 12 }}>
              <label htmlFor="edit-upload">
                <Button variant="primary" onClick={(e) => { e.preventDefault(); (document.getElementById('edit-upload') as HTMLInputElement | null)?.click() }}>Upload PDF to edit</Button>
              </label>
            </div>
            <input id="edit-upload" className="sr-only" type="file" accept="application/pdf" onChange={(e)=>{
              const file = e.currentTarget.files?.[0]
              if (file) {
                try { window.dispatchEvent(new CustomEvent('pdf-upload', { detail: file })) } catch (err) {}
                e.currentTarget.value = ''
              }
            }} />

            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('edit-sample.pdf','Edit sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try with a sample</button>
            </div>

            <div className="ops-details">
              <h3>Editing tools</h3>
              <p className="sub">Add text, move pages, insert images or apply signatures. Edits are applied client-side so you keep control of your content.</p>
              <ul className="ops-features">
                <li><strong>Best for:</strong> Quick fixes, signatures, and small content edits.</li>
                <li><strong>Quick tip:</strong> Use the preview after edits to confirm layout before downloading.</li>
                <li><strong>Privacy:</strong> Edits are local — no file uploads to our servers.</li>
              </ul>
            </div>

            <div className="examples">
              <div className="example-card">
                <h4>Quick signature</h4>
                <p className="sub">Add a signature and download the signed file.</p>
                <div className="example-actions"><button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('signed.pdf','Signed sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try sample</button></div>
              </div>

              <div className="example-card">
                <h4>Minor edits</h4>
                <p className="sub">Add a note or correct a small typo before sending.</p>
                <div className="example-actions"><button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('minor-edit.pdf','Minor edit sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try sample</button></div>
              </div>
            </div>
          </div>

          <div aria-hidden>
            <Card>
              <div className="icon"><IconEdit /></div>
              <h3>Annotate & sign</h3>
              <p>Add text, images or signatures and export the edited document.</p>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
} 