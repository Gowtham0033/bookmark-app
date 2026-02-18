"use client"
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function BookmarksSidebar() {
  const [session, setSession] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => { 
      if (mounted) {
        setSession(data.session)
        setLoading(false)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => { 
      if (mounted) {
        setSession(s)
        setLoading(false)
      }
    })
    return () => { mounted = false; try { subscription?.unsubscribe() } catch (e) {} }
  }, [])

  useEffect(() => {
    if (!session) { setBookmarks([]); return }

    let mounted = true
    const fetchBookmarks = async () => {
      const { data, error } = await supabase.from('bookmarks').select('*').order('inserted_at', { ascending: false })
      if (!error && mounted) setBookmarks(data || [])
    }

    fetchBookmarks()

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('bookmarks-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookmarks',
        filter: `user_id=eq.${session.user.id}`
      }, (payload) => {
        console.log('Sidebar realtime event:', payload)
        if (mounted) {
          if (payload.eventType === 'INSERT') {
            // Only add if not already in state (avoid duplicates)
            setBookmarks(prev => {
              const exists = prev.some(b => b.id === payload.new.id)
              return exists ? prev : [payload.new, ...prev]
            })
          } else if (payload.eventType === 'DELETE') {
            console.log('Removing bookmark from sidebar:', payload.old.id)
            setBookmarks(prev => prev.filter(b => b.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            console.log('Updating bookmark in sidebar:', payload.new)
            setBookmarks(prev => prev.map(b => b.id === payload.new.id ? payload.new : b))
          }
        }
      })
      .subscribe()

    return () => { 
      mounted = false
      subscription.unsubscribe()
    }
  }, [session])

  const filteredBookmarks = bookmarks.filter(b =>
    (b.title || b.url).toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="card sticky top-24">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="card sticky top-24">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📑</span> Quick Links
        </h3>
        <p className="text-sm text-gray-600">Sign in to see your bookmarks</p>
      </div>
    )
  }

  return (
    <div className="card sticky top-24">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>📚</span> All Bookmarks
      </h3>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search bookmarks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field text-sm"
        />
      </div>

      {/* Bookmarks List */}
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <div className="text-2xl mb-2">📭</div>
          {bookmarks.length === 0 ? (
            <p className="text-xs">No bookmarks yet</p>
          ) : (
            <p className="text-xs">No match for "{searchQuery}"</p>
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-600 px-2">
            {filteredBookmarks.length}/{bookmarks.length} bookmarks
          </p>
          {filteredBookmarks.map(b => {
            let hostname = ''
            try {
              hostname = new URL(b.url).hostname || b.url
            } catch (e) {
              hostname = b.url
            }
            return (
              <a
                key={b.id}
                href={b.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group cursor-pointer"
                title={b.url}
              >
                <span className="text-lg flex-shrink-0 mt-0.5">🔗</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-blue-700 text-xs truncate group-hover:text-blue-900">
                    {b.title || 'Untitled'}
                  </h4>
                  <p className="text-xs text-gray-600 truncate">
                    {hostname}
                  </p>
                </div>
              </a>
            )
          })}
        </div>
      )}

      {/* Footer */}
      {bookmarks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
          Total: <span className="font-semibold text-gray-700">{bookmarks.length}</span> bookmark{bookmarks.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

