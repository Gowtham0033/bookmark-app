import './globals.css'
import SignInButton from '../components/SignInButton'

export const metadata = {
  title: 'Smart Bookmark App',
  description: 'Bookmark manager with Supabase and realtime updates',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-2xl">🔖</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Smart Bookmarks</h1>
            </div>
            <nav>
              <SignInButton />
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
        <footer className="mt-16 py-8 text-center text-sm text-gray-500 border-t border-gray-200">
          <p>Save, organize, and sync your bookmarks in realtime</p>
        </footer>
      </body>
    </html>
  )
}

