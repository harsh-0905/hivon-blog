'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CommentSection({
  postId,
  comments,
  user,
  userRole,
}: {
  postId: string
  comments: any[]
  user: any
  userRole: string | null
}) {
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleComment() {
    if (!comment.trim()) return
    setLoading(true)

    await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      comment_text: comment,
    })

    setComment('')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold mb-4">
        Comments ({comments.length})
      </h3>

      {/* Comment list */}
      <div className="space-y-3 mb-6">
        {comments.map((c: any) => (
          <div key={c.id} className="bg-gray-50 rounded p-3">
            <p className="text-sm font-medium text-gray-700">
              {c.users?.name}
            </p>
            <p className="text-sm text-gray-600 mt-1">{c.comment_text}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-400">
            No comments yet. Be the first!
          </p>
        )}
      </div>

      {/* Add comment */}
      {user ? (
        <div className="space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleComment}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Login
          </a>{' '}
          to leave a comment.
        </p>
      )}
    </div>
  )
}