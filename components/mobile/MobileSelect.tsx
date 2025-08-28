'use client'

import { forwardRef, SelectHTMLAttributes } from 'react'
import { ChevronDown, LucideIcon } from 'lucide-react'

interface MobileSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  icon?: LucideIcon
  error?: string
  helpText?: string
  options: Array<{ value: string; label: string }>
}

export const MobileSelect = forwardRef<HTMLSelectElement, MobileSelectProps>(
  ({ label, icon: Icon, error, helpText, options, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 px-1">
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <Icon className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <select
            ref={ref}
            className={`
              w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              appearance-none bg-white transition-colors
              ${Icon ? 'pl-12' : 'pl-4'} pr-12
              ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </div>
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