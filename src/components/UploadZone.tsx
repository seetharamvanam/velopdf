import React, { useState } from 'react'
import Card from './ui/Card'
import Button from './ui/Button'

interface UploadZoneProps {
  title: string
  inputId: string
  onFile?: (file: File) => void
  onFiles?: (files: File[]) => void
  subtitle?: string
  multiple?: boolean
  selectLabel?: string
  children?: React.ReactNode
}

export default function UploadZone({
  title,
  inputId,
  onFile,
  onFiles,
  subtitle = 'Drag and drop your PDF here, or click to browse',
  multiple = false,
  selectLabel,
  children,
}: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    if (multiple && onFiles) {
      onFiles(Array.from(fileList))
    } else if (onFile) {
      onFile(fileList[0])
    }
  }

  return (
    <Card
      className={`upload-zone${dragging ? ' upload-zone--dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false) }}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFiles(e.dataTransfer?.files ?? null)
      }}
      onClick={() => (document.getElementById(inputId) as HTMLInputElement | null)?.click()}
      style={{ cursor: 'pointer' }}
    >
      <div className="upload-content">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <h3>{dragging ? 'Drop your PDF here' : title}</h3>
        <p>{subtitle}</p>
        <Button
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation()
            ;(document.getElementById(inputId) as HTMLInputElement | null)?.click()
          }}
        >
          {selectLabel ?? (multiple ? 'Select Files' : 'Select File')}
        </Button>
        {children}
      </div>
    </Card>
  )
}
