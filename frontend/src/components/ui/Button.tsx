import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export default function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  const cls = `btn ${variant === 'primary' ? 'primary' : 'ghost'} ${className}`
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  )
}
