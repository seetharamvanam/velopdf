import React from 'react'
import { motion } from 'framer-motion'

export default function Card({ children, className = '', delay = 0, style }: { children: React.ReactNode; className?: string; delay?: number; style?: React.CSSProperties }) {
  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -5, boxShadow: 'var(--shadow-xl)' }}
      className={`card ${className}`}
      style={style}
    >
      {children}
    </motion.article>
  )
}
