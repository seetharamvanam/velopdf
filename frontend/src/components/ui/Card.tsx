import React from 'react'

export default function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <article className={`card ${className}`}>{children}</article>
}
