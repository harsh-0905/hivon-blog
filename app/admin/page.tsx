import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') redirect('/blog')

  // Get all posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*, users(name)')
    .order('created_at', { ascending: false })

  // Get all comments
  const { data: comments } = await supabase
    .from('comments')
    .select('*, users(name), posts(title)')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">
          ← Back to Blog
        </Link>
      </div>

      {/* Posts section */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4">
          All Posts ({posts?.length || 0})
        </h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium text-gray-700">Title</th>
                <th className="text-left p-3 font-medium text-gray-700">Author</th>
                <th className="text-left p-3 font-medium text-gray-700">Date</th>
                <th className="text-left p-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts?.map((post: any) => (
                <tr key={post.id} className="border-t">
                  <td className="p-3">{post.title}</td>
                  <td className="p-3 text-gray-500">{post.users?.name}</td>
                  <td className="p-3 text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/blog/edit/${post.id}`}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/blog/${post.id}`}
                      className="text-gray-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comments section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          All Comments ({comments?.length || 0})
        </h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium text-gray-700">Comment</th>
                <th className="text-left p-3 font-medium text-gray-700">By</th>
                <th className="text-left p-3 font-medium text-gray-700">On Post</th>
              </tr>
            </thead>
            <tbody>
              {comments?.map((c: any) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.comment_text}</td>
                  <td className="p-3 text-gray-500">{c.users?.name}</td>
                  <td className="p-3 text-gray-500">{c.posts?.title}</td>
                </tr>
              ))}
              {comments?.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-3 text-gray-400 text-center">
                    No comments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}