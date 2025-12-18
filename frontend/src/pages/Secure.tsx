import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { IconSecure } from '../components/icons'
import './ops.css'
import { useToast } from '../components/ToastProvider'

export default function Secure() {
  const { addToast } = useToast()
  return (
    <main className="page page-ops">
      <section className="ops-hero">
        <div className="ops-hero-inner">
          <div>
            <h1>Secure PDFs</h1>
            <p className="sub">Encrypt, password-protect or remove sensitive data from PDFs before sharing.</p>
            <div style={{ marginTop: 12 }}>
              <label htmlFor="secure-upload">
                <Button variant="primary" onClick={(e) => { e.preventDefault(); (document.getElementById('secure-upload') as HTMLInputElement | null)?.click() }}>Upload PDF to secure</Button>
              </label>
            </div>
            <input id="secure-upload" className="sr-only" type="file" accept="application/pdf" onChange={(e)=>{
              const file = e.currentTarget.files?.[0]
              if (file) {
                try { window.dispatchEvent(new CustomEvent('pdf-upload', { detail: file })) } catch (err) {}
                try { addToast('File added') } catch (err) {}
                e.currentTarget.value = ''
              }
            }} />

            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('secure-sample.pdf','Secure sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try with a sample</button>
            </div>

            <div className="ops-details">
              <h3>Security options</h3>
              <p className="sub">Apply encryption, set passwords, or redact sensitive sections before sharing. These operations run locally so your content stays private.</p>
              <ul className="ops-features">
                <li><strong>Best for:</strong> Protecting confidential reports or personal documents.</li>
                <li><strong>Quick tip:</strong> Choose a strong password and save it securely; without it the document cannot be opened.</li>
                <li><strong>Privacy:</strong> All operations are client-side — no server uploads.</li>
              </ul>
            </div>

            <div className="examples">
              <div className="example-card">
                <h4>Password protect</h4>
                <p className="sub">Add a password before sharing confidential files.</p>
                <div className="example-actions"><button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('protected.pdf','Protected sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try sample</button></div>
              </div>

              <div className="example-card">
                <h4>Redact content</h4>
                <p className="sub">Remove or obscure sensitive sections before sharing.</p>
                <div className="example-actions"><button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('redact.pdf','Redact sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try sample</button></div>
              </div>
            </div>

          </div>

          <div aria-hidden>
            <Card>
              <div className="icon"><IconSecure /></div>
              <h3>Protect files</h3>
              <p>Apply passwords or redact sensitive content securely in your browser.</p>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
} 