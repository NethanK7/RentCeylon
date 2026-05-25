'use client'

import { useEffect, useRef, useState } from 'react'

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: 0, y: 0 })
  const ringPosRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)
  const [label, setLabel] = useState('')
  const [ringSize, setRingSize] = useState(36)
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsHidden(true)
      return
    }

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY }
    }

    const onEnterCard = (e: Event) => {
      const target = e.currentTarget as HTMLElement
      const hint = target.dataset.cursorHint || 'RENT'
      setLabel(hint)
      setRingSize(64)
    }

    const onLeaveCard = () => {
      setLabel('')
      setRingSize(36)
    }

    const onEnterImage = () => {
      setLabel('VIEW')
      setRingSize(64)
    }

    const onClick = () => {
      if (!ringRef.current) return
      ringRef.current.style.transform = `translate(-50%, -50%) scale(1.4)`
      setTimeout(() => {
        if (ringRef.current) {
          ringRef.current.style.transform = `translate(-50%, -50%) scale(1)`
        }
      }, 200)
    }

    const updateCards = () => {
      document.querySelectorAll('[data-cursor="card"]').forEach((el) => {
        el.addEventListener('mouseenter', onEnterCard)
        el.addEventListener('mouseleave', onLeaveCard)
      })
      document.querySelectorAll('[data-cursor="image"]').forEach((el) => {
        el.addEventListener('mouseenter', onEnterImage)
        el.addEventListener('mouseleave', onLeaveCard)
      })
    }

    const raf = () => {
      if (dotRef.current) {
        dotRef.current.style.left = `${posRef.current.x}px`
        dotRef.current.style.top = `${posRef.current.y}px`
      }
      if (ringRef.current) {
        ringPosRef.current.x += (posRef.current.x - ringPosRef.current.x) * 0.12
        ringPosRef.current.y += (posRef.current.y - ringPosRef.current.y) * 0.12
        ringRef.current.style.left = `${ringPosRef.current.x}px`
        ringRef.current.style.top = `${ringPosRef.current.y}px`
      }
      rafRef.current = requestAnimationFrame(raf)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onClick)
    updateCards()
    rafRef.current = requestAnimationFrame(raf)

    const observer = new MutationObserver(updateCards)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
      cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
  }, [])

  if (isHidden) return null

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: label ? 0 : 10,
          height: label ? 0 : 10,
          borderRadius: '50%',
          background: '#1A3D8F',
          transition: 'width 0.2s, height 0.2s',
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
        style={{
          width: ringSize,
          height: ringSize,
          borderRadius: '50%',
          border: '1.5px solid rgba(26,61,143,0.5)',
          transition: 'width 0.3s ease, height 0.3s ease, border-radius 0.3s ease',
          fontSize: 8,
          fontFamily: 'var(--font-geist)',
          color: '#1A3D8F',
          letterSpacing: '0.1em',
          fontWeight: 600,
        }}
      >
        {label && <span style={{ fontSize: 8 }}>{label}</span>}
      </div>
    </>
  )
}
