'use client'

import { ReactNode } from 'react'

interface MobileCardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
  hoverable?: boolean
}

export function MobileCard({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'sm',
  onClick,
  hoverable = false
}: MobileCardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }

  const baseStyles = 'bg-white rounded-xl border border-gray-100'
  const interactiveStyles = onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
  const hoverStyles = hoverable || onClick ? 'hover:shadow-md transition-shadow' : ''

  return (
    <div
      className={`
        ${baseStyles}
        ${paddingStyles[padding]}
        ${shadowStyles[shadow]}
        ${interactiveStyles}
        ${hoverStyles}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}