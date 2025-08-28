'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { LucideIcon } from 'lucide-react'

interface MobileInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: LucideIcon
  error?: string
  helpText?: string
}

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ label, icon: Icon, error, helpText, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 px-1">
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              placeholder-gray-400 transition-colors
              ${Icon ? 'pl-12' : 'pl-4'}
              ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 px-1">{error}</p>
        )}
        {helpText && !error && (
          <p className="text-sm text-gray-500 px-1">{helpText}</p>
        )}
      </div>
    )
  }
)