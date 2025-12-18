import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { IconCompress } from '../components/icons'
import './ops.css'
import { useToast } from '../components/ToastProvider'

export default function Compress() {
  const { addToast } = useToast()
  return (
    <main className="page page-ops">
      <section className="ops-hero">
        <div className="ops-hero-inner">
          <div>
            <h1>Compress PDF</h1>
            <p className="sub">Reduce file size while keeping text readable — perfect for sharing.</p>
            <div style={{ marginTop: 12 }}>
              <label htmlFor="compress-upload">
                <Button variant="primary" onClick={(e) => { e.preventDefault(); (document.getElementById('compress-upload') as HTMLInputElement | null)?.click() }}>Upload PDF to compress</Button>
              </label>
            </div>
            <input id="compress-upload" className="sr-only" type="file" accept="application/pdf" onChange={(e)=>{
              const file = e.currentTarget.files?.[0]
              if (file) {
                try { window.dispatchEvent(new CustomEvent('pdf-upload', { detail: file })) } catch (err) {}
                try { addToast('File added') } catch (err) {}
                e.currentTarget.value = ''
              }
            }} />

            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('compress-sample.pdf','Compression sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try with a sample</button>
            </div>

            <div className="ops-details">
              <h3>How compression works</h3>
              <p className="sub">We optimize images and remove unnecessary metadata to reduce file size while maintaining legibility.</p>
              <ul className="ops-features">
                <li><strong>Best for:</strong> Sharing large scans or presentations without losing readability.</li>
                <li><strong>Quick tip:</strong> For photos-heavy PDFs, expect larger gains than for text-only files.</li>
                <li><strong>Privacy:</strong> Files are processed locally in your browser; we do not upload your documents.</li>
              </ul>
            </div>

            <div className="examples">
              <div className="example-card">
                <h4>Presentation slides</h4>
                <p className="sub">Compress slide decks to make sharing easier.</p>
                <div className="example-actions"><button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('slides.pdf','Slides sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try sample</button></div>
              </div>

              <div className="example-card">
                <h4>Scanned receipts</h4>
                <p className="sub">Compress scanned receipts to store more on your device.</p>
                <div className="example-actions"><button className="btn ghost" onClick={(e)=>{ e.preventDefault(); import('../utils/sample').then(m=>m.createSamplePdf('receipts.pdf','Receipts sample')).then(f=>{ try{ window.dispatchEvent(new CustomEvent('pdf-upload',{detail:f})) }catch(err){} }) }}>Try sample</button></div>
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