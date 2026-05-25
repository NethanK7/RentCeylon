import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  label: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, i) => {
        const completed = i < currentStep
        const active = i === currentStep
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-sans font-medium transition-all duration-300',
                  completed && 'bg-royal text-white',
                  active && 'bg-gold text-white shadow-gold scale-110',
                  !completed && !active && 'bg-mist text-fog',
                )}
              >
                {completed ? <Check size={14} strokeWidth={2.5} /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-sans whitespace-nowrap',
                  active ? 'text-gold font-medium' : completed ? 'text-slate' : 'text-fog',
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-px mx-2 mb-5 transition-colors duration-300',
                  completed ? 'bg-royal' : 'bg-mist',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
