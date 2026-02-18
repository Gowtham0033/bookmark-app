"use client"
import React, { useEffect, useState } from 'react'

export default function ScrollIndicator() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const check = () => {
      // hide if page is not scrollable
      const scrollable = document.body.scrollHeight > window.innerHeight + 10
      // hide when user has scrolled a bit
      const scrolled = window.scrollY > 40
      setVisible(scrollable && !scrolled)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  if (!visible) return null

  return (
    <div aria-hidden className="fixed bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none z-50">
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-16 rounded-2xl border-2 border-gray-800 bg-white/60 backdrop-blur-sm flex items-start justify-center p-2">
          <span className="block w-2 h-2 rounded-full bg-gray-700 animate-scroll-bounce" />
        </div>
        <div className="flex flex-col items-center text-gray-500">
          <svg className="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
          <svg className="w-5 h-5 -mt-1 opacity-60 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  )
}
