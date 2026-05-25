'use client'

import { useState, ReactNode } from 'react'
import { motion, LayoutGroup } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  content: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  className?: string
}

export function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id)

  return (
    <div className={cn('', className)}>
      <LayoutGroup>
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                'relative px-5 py-3 text-sm font-sans transition-colors',
                active === tab.id ? 'text-royal font-medium' : 'text-fog hover:text-slate',
              )}
            >
              {tab.label}
              {active === tab.id && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-royal rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>
      </LayoutGroup>
      <div className="pt-6">
        {tabs.find((t) => t.id === active)?.content}
      </div>
    </div>
  )
}
