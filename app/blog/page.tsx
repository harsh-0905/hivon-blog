import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const search = params.q || ''
  const page = parseInt(params.page || '1')
  const limit = 6
  const offset = (page - 1) * limit

  // Get current user and role
  const { data: { user } } = await supabase.auth.getUser()
  let userRole = null
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    userRole = userData?.role
  }

  // Fetch posts with search
  let query = supabase
    .from('posts')
    .select('id, title, summary, image_url, created_at, author_id, users(name)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  const { data: posts } = await query

  // Count total for pagination
  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Navbar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hivon Blog</h1>
        <div className="flex gap-3">
          {!user && (
            <>
              <Link href="/auth/login"
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50">
                Login
              </Link>
              <Link href="/auth/signup"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Sign Up
              </Link>
            </>
          )}
          {user && (userRole === 'author' || userRole === 'admin') && (
            <Link href="/blog/create"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              + New Post
            </Link>
          )}
          {user && userRole === 'admin' && (
            <Link href="/admin"
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
              Admin
            </Link>
          )}
          {user && (
            <Link href="/auth/logout"
              className="px-4 py-2 text-sm border rounded hover:bg-gray-50">
              Logout
            </Link>
          )}
        </div>
      </div>

      {/* Search */}
      <form className="mb-6">
        <input
          name="q"
          defaultValue={search}
          placeholder="Search posts..."
          className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>

      {/* Posts Grid */}
      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: any) => (
            <Link href={`/blog/${post.id}`} key={post.id}>
              <div className="bg-white rounded-lg shadow hover:shadow-md transition p-4 h-full">
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                )}
                <h2 className="font-semibold text-gray-900 mb-2">{post.title}</h2>
                <p className="text-sm text-gray-500 line-clamp-3">
                  {post.summary || 'No summary available.'}
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  By {(post.users as any)?.name || 'Unknown'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          No posts found.
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/blog?page=${p}${search ? `&q=${search}` : ''}`}
              className={`px-3 py-1 rounded text-sm border ${
                p === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}