import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CommentSection from './CommentSection'

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  let userRole = null
  let userId = null
  if (user) {
    userId = user.id
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    userRole = userData?.role
  }

  // Get post
  const { data: post } = await supabase
    .from('posts')
    .select('*, users(name)')
    .eq('id', id)
    .single()

  if (!post) notFound()

  // Get comments
  const { data: comments } = await supabase
    .from('comments')
    .select('*, users(name)')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  const canEdit =
    userRole === 'admin' ||
    (userRole === 'author' && post.author_id === userId)

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Back button */}
      <Link href="/blog" className="text-blue-600 text-sm hover:underline">
        ← Back to Blog
      </Link>

      {/* Post header */}
      <div className="mt-4">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
          {canEdit && (
            <Link
              href={`/blog/edit/${post.id}`}
              className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
            >
              Edit
            </Link>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-1">
          By {(post.users as any)?.name} ·{' '}
          {new Date(post.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Featured image */}
      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.title}
          className="w-full h-64 object-cover rounded-lg mt-4"
        />
      )}

      {/* AI Summary box */}
      {post.summary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-semibold text-blue-700 mb-2">
            AI Summary
          </h3>
          <p className="text-sm text-blue-800">{post.summary}</p>
        </div>
      )}

      {/* Post body */}
      <div className="mt-6 prose max-w-none">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {post.body}
        </p>
      </div>

      {/* Comments */}
      <CommentSection
        postId={id}
        comments={comments || []}
        user={user}
        userRole={userRole}
      />
    </div>
  )
}