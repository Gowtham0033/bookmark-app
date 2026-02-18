"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function BookmarksClient() {
  const [session, setSession] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => { if (mounted) setSession(data.session) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => { if (mounted) setSession(s) })
    return () => { mounted = false; try { subscription?.unsubscribe() } catch (e) {} }
  }, [])

  useEffect(() => {
    if (!session) { setBookmarks([]); return }

    let mounted = true
    const fetchBookmarks = async () => {
      const { data, error } = await supabase.from('bookmarks').select('*').order('inserted_at', { ascending: false })
      if (error) {
        console.error('Fetch bookmarks error:', error)
        if (mounted) setError(error.message)
      } else if (mounted) {
        setBookmarks(data || [])
      }
    }

    fetchBookmarks()

    // Subscribe to realtime updates
    const subscription = supabase
      .channel('bookmarks-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookmarks',
        filter: `user_id=eq.${session.user.id}`
      }, (payload) => {
        console.log('Realtime update:', payload)
        if (mounted) {
          if (payload.eventType === 'INSERT') {
            // Only add if not already in state (avoid duplicates)
            setBookmarks(prev => {
              const exists = prev.some(b => b.id === payload.new.id)
              return exists ? prev : [payload.new, ...prev]
            })
          } else if (payload.eventType === 'DELETE') {
            setBookmarks(prev => prev.filter(b => b.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
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

  const addBookmark = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (!title || !url) { 
      setError('Title and URL are required')
      setLoading(false)
      return 
    }
    try {
      const { data, error: insertError } = await supabase.from('bookmarks').insert({ 
        title, 
        url, 
        user_id: session.user.id 
      }).select()
      
      if (insertError) {
        console.error('Insert error:', insertError)
        setError(insertError.message)
      } else {
        console.log('Bookmark added:', data)
        setTitle('')
        setUrl('')
        // Manually add to state for instant UI update
        if (data && data[0]) {
          setBookmarks(prev => [data[0], ...prev])
        }
      }
    } catch (err) {
      console.error('Add bookmark error:', err)
      setError(err.message || 'Failed to add bookmark')
    } finally {
      setLoading(false)
    }
  }

  const deleteBookmark = async (id) => {
    setError(null)
    try {
      const { error: deleteError } = await supabase.from('bookmarks').delete().eq('id', id)
      if (deleteError) {
        console.error('Delete error:', deleteError)
        setError(deleteError.message)
      } else {
        console.log('Bookmark deleted:', id)
        // Manually remove from state for instant UI update
        setBookmarks(prev => prev.filter(b => b.id !== id))
      }
    } catch (err) {
      console.error('Delete bookmark error:', err)
      setError(err.message || 'Failed to delete')
    }
  }

  const startEdit = (bookmark) => {
    setEditingId(bookmark.id)
    setEditTitle(bookmark.title)
    setEditUrl(bookmark.url)
    setError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditUrl('')
  }

  const saveEdit = async () => {
    setError(null)
    if (!editTitle || !editUrl) {
      setError('Title and URL are required')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('bookmarks')
        .update({ title: editTitle, url: editUrl })
        .eq('id', editingId)

      if (updateError) {
        console.error('Update error:', updateError)
        setError(updateError.message)
      } else {
        console.log('Bookmark updated:', editingId)
        // Update in state
        setBookmarks(prev =>
          prev.map(b =>
            b.id === editingId ? { ...b, title: editTitle, url: editUrl } : b
          )
        )
        setEditingId(null)
        setEditTitle('')
        setEditUrl('')
      }
    } catch (err) {
      console.error('Edit bookmark error:', err)
      setError(err.message || 'Failed to update bookmark')
    }
  }

  if (!session) return (
    <div className="card text-center py-12">
      <div className="text-4xl mb-4">🔐</div>
      <h3 className="text-xl font-semibold text-gray-900">Sign in to manage bookmarks</h3>
      <p className="mt-2 text-gray-600">Click the "Sign in with Google" button in the top right to get started</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span>📚</span> Your Bookmarks
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
        )}

        <form onSubmit={addBookmark} className="mb-8 p-4 bg-blue-50 rounded-lg border-2 border-blue-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span>➕</span> Add New Bookmark
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input 
                className="input-field"
                placeholder="e.g., GitHub" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
              <input 
                className="input-field"
                placeholder="https://example.com" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                disabled={loading}
              />
            </div>
            <button 
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              <span>{loading ? '⏳' : '➕'}</span>
              {loading ? 'Adding...' : 'Add Bookmark'}
            </button>
          </div>
        </form>

        {bookmarks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>No bookmarks yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">{bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}</h3>
            {bookmarks.map(b => (
              editingId === b.id ? (
                <div key={b.id} className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200 space-y-3">
                  <h3 className="font-semibold text-gray-900">Edit Bookmark</h3>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                    <input 
                      className="input-field"
                      value={editTitle} 
                      onChange={(e) => setEditTitle(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
                    <input 
                      className="input-field"
                      value={editUrl} 
                      onChange={(e) => setEditUrl(e.target.value)} 
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={saveEdit}
                      className="flex-1 btn-primary"
                    >
                      ✅ Save
                    </button>
                    <button 
                      onClick={cancelEdit}
                      className="flex-1 btn-outline"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div key={b.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="flex-1 min-w-0">
                    <a 
                      className="text-blue-600 font-semibold hover:underline truncate block" 
                      href={b.url} 
                      target="_blank" 
                      rel="noreferrer"
                    >
                      {b.title || b.url}
                    </a>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(b.inserted_at).toLocaleDateString()} at {new Date(b.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button 
                      type="button"
                      onClick={() => startEdit(b)} 
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors whitespace-nowrap"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      type="button"
                      onClick={() => deleteBookmark(b.id)} 
                      className="btn-danger whitespace-nowrap"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
