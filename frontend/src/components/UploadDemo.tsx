import { useEffect, useState } from 'react'
import './UploadDemo.css'

type Props = {
  file?: File | null
  onClose?: () => void
}

export default function UploadDemo({ file, onClose }: Props) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle')
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setProgress(0)
      setStatus('idle')
      return
    }

    let mounted = true

    async function runDemo() {
      setStatus('uploading')
      setProgress(8)

      // upload simulation
      await new Promise((res) => setTimeout(res, 600))
      if (!mounted) return
      setProgress(28)
      setStatus('processing')

      // processing simulation (progress steps)
      const steps = [38, 52, 68, 81, 92]
      for (const s of steps) {
        if (!mounted) return
        await new Promise((res) => setTimeout(res, 480))
        setProgress(s)
      }

      // finalizing
      if (!mounted) return
      setProgress(100)
      setStatus('done')

      // create a downloadable url (mock: we return same file)
      try {
        if (file) {
          const u = URL.createObjectURL(file)
          setDownloadUrl(u)
        }
      } catch (e) {
        setStatus('error')
      }
    }

    runDemo()

    return () => { mounted = false }
  }, [file])

  useEffect(() => {
    // cleanup url on unmount
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    }
  }, [downloadUrl])

  const filename = file?.name ?? 'file.pdf'

  if (!file) return null

  return (
    <div className="upload-panel" role="status" aria-live="polite">
      <div className="panel-inner">
        <div className="panel-left">
          <div className="panel-title">Processing: <strong>{filename}</strong></div>
          <div className="progress" aria-hidden>
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="panel-meta">
            <div className="meta-left">{status === 'uploading' ? 'Uploading...' : status === 'processing' ? 'Processing...' : status === 'done' ? 'Ready' : 'Error'}</div>
            <div className="meta-right">{progress}%</div>
          </div>
        </div>

        <div className="panel-actions">
          {status === 'done' && downloadUrl ? (
            <a className="btn primary" href={downloadUrl} download={`${filename.replace(/\.pdf$/i, '')}-processed.pdf`}>Download</a>
          ) : status === 'error' ? (
            <button className="btn ghost" onClick={() => setStatus('idle')}>Retry</button>
          ) : (
            <button className="btn ghost" onClick={onClose}>Close</button>
          )}
        </div>
      </div>
    </div>
  )
}
