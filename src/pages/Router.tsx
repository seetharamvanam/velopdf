import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import PageTransition from '../components/ui/PageTransition'

const Home = lazy(() => import('./Home'))
const Merge = lazy(() => import('./Merge'))
const Split = lazy(() => import('./Split'))
const Compress = lazy(() => import('./Compress'))
const Convert = lazy(() => import('./Convert'))
const Secure = lazy(() => import('./Secure'))
const View = lazy(() => import('./View'))
const Edit = lazy(() => import('./Edit'))
const Advanced = lazy(() => import('./Advanced'))
const Create = lazy(() => import('./Create'))
const Annotate = lazy(() => import('./Annotate'))
const Organize = lazy(() => import('./Organize'))
const Forms = lazy(() => import('./Forms'))
const OCR = lazy(() => import('./OCR'))
const Utilities = lazy(() => import('./Utilities'))

const ROUTES: Record<string, React.LazyExoticComponent<React.FC>> = {
  '': Home,
  '#': Home,
  '#home': Home,
  '#view': View,
  '#create': Create,
  '#edit': Edit,
  '#annotate': Annotate,
  '#convert': Convert,
  '#ocr': OCR,
  '#merge': Merge,
  '#split': Split,
  '#organize': Organize,
  '#secure': Secure,
  '#forms': Forms,
  '#compress': Compress,
  '#utilities': Utilities,
  '#advanced': Advanced,
}

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 80px)',
      color: 'var(--text-tertiary)',
      fontSize: '0.9rem',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 32,
          height: 32,
          border: '3px solid var(--border-primary)',
          borderTopColor: 'var(--color-primary-600)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          margin: '0 auto 12px',
        }} />
        Loading…
      </div>
    </div>
  )
}

export default function Router() {
  const [hash, setHash] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash || '#'
    }
    return '#'
  })

  useEffect(() => {
    function onHash() {
      setHash(window.location.hash || '#')
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const Page = ROUTES[hash] || Home

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={hash}>
        <Suspense fallback={<PageLoader />}>
          <Page />
        </Suspense>
      </PageTransition>
    </AnimatePresence>
  )
}
