'use client'

import { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  loading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-royal text-white hover:bg-royal-dark focus:shadow-focus-gold btn-wipe-primary',
  secondary: 'bg-transparent text-royal border border-royal hover:bg-royal-light focus:shadow-focus-gold',
  ghost: 'bg-transparent text-slate hover:text-ink hover:bg-frost focus:shadow-focus-gold',
  danger: 'bg-danger text-white hover:bg-red-800 focus:shadow-[0_0_0_3px_rgba(185,28,28,0.3)]',
  gold: 'text-ink hover:opacity-90 focus:shadow-focus-gold btn-wipe-gold',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', href, loading, fullWidth, className, children, disabled, ...props }, ref) => {
    const base = cn(
      'inline-flex items-center justify-center gap-2 font-sans font-medium rounded-full transition-all duration-200 relative overflow-hidden select-none outline-none',
      'active:scale-[0.97]',
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && 'w-full',
      (disabled || loading) && 'opacity-50 cursor-not-allowed',
      className,
    )

    const content = loading ? (
      <>
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        {children}
      </>
    ) : children

    if (href) {
      return (
        <Link href={href} className={base}>
          {content}
        </Link>
      )
    }

    return (
      <button ref={ref} className={base} disabled={disabled || loading} {...props}>
        {variant === 'gold' && (
          <span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: 'linear-gradient(135deg, #C9973A, #E8BC6A)' }}
          />
        )}
        <span className="relative z-10">{content}</span>
      </button>
    )
  }
)

Button.displayName = 'Button'
