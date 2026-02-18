"use client"
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SignInButton() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    let mounted = true
    
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (mounted) {
        setSession(session)
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (mounted) {
        setSession(s)
        setLoading(false)
      }
    })

    return () => { 
      mounted = false
      try { subscription?.unsubscribe() } catch (e) {}
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setDropdownOpen(false)
  }

  if (loading) return <div className="px-4 py-2 text-gray-500 text-sm">Loading...</div>

  if (session?.user) {
    const userName = session.user.user_metadata?.full_name || session.user.email || 'User'
    const initials = userName.charAt(0).toUpperCase()
    const email = session.user.email

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            {initials}
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-900">{userName}</div>
            <div className="text-xs text-gray-500">Account</div>
          </div>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-sm font-medium text-gray-900">{userName}</div>
              <div className="text-xs text-gray-500">{email}</div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <span>🚪</span>
              Sign out
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <button 
      onClick={handleSignIn} 
      className="btn-primary flex items-center gap-2"
    >
      <span>🔐</span>
      Sign in with Google
    </button>
  )
}

