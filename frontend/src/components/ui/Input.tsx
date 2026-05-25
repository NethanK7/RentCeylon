'use client'

import { forwardRef, InputHTMLAttributes, useState } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  success?: boolean
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, success, helperText, className, id, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    const hasValue = !!props.value || !!props.defaultValue
    const floated = focused || hasValue || !!props.placeholder

    const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="relative w-full">
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'peer w-full pt-5 pb-2 px-0 bg-transparent border-0 border-b text-ink font-sans outline-none transition-colors',
              'placeholder-transparent',
              error ? 'border-danger' : 'border-border',
              'focus:border-royal',
              className,
            )}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />
          <label
            htmlFor={inputId}
            className={cn(
              'absolute left-0 font-sans transition-all duration-200 pointer-events-none',
              floated
                ? 'top-0 text-xs text-fog scale-85 origin-left'
                : 'top-5 text-sm text-fog',
              focused && 'text-royal',
              error && 'text-danger',
            )}
          >
            {label}
          </label>
          {/* Focus underline */}
          <div
            className="absolute bottom-0 left-0 h-[1.5px] bg-royal transition-all duration-300 origin-left"
            style={{ width: focused ? '100%' : '0%' }}
          />
          {/* Success checkmark */}
          {success && (
            <svg
              className="absolute right-0 top-1/2 -translate-y-1/2"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle cx="8" cy="8" r="7" stroke="#0A7855" strokeWidth="1.5" />
              <path d="M5 8l2 2 4-4" stroke="#0A7855" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
        {(error || helperText) && (
          <p className={cn('mt-1.5 text-xs font-sans', error ? 'text-danger' : 'text-fog')}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
