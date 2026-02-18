import BookmarksClient from '../components/BookmarksClient'

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Welcome to Smart Bookmarks</h2>
        <p className="text-gray-600 leading-relaxed">
          A simple, fast, and beautiful way to save and sync your bookmarks across all your devices. 
          Sign in with Google to get started, add bookmarks, and watch them update in realtime.
        </p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-2xl mb-2">✨</div>
            <h3 className="font-semibold text-gray-900">Fast & Simple</h3>
            <p className="text-sm text-gray-600 mt-1">Add bookmarks with just a title and URL</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold text-gray-900">Private</h3>
            <p className="text-sm text-gray-600 mt-1">Your bookmarks are only visible to you</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-900">Realtime</h3>
            <p className="text-sm text-gray-600 mt-1">Updates sync instantly across all tabs</p>
          </div>
        </div>
      </div>

      <BookmarksClient />
    </div>
  )
}
