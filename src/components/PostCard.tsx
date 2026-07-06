import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { Post } from '../lib/posts'
import { categoryColors, formatDate } from '../lib/posts'
import './PostCard.css'

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link
      to={`/post/${post.slug}`}
      className="post-card"
      style={{ '--post-color': categoryColors[post.category] } as CSSProperties}
    >
      <div className="post-card-header">
        <span className="post-type">{post.category}</span>
        <span className="post-arrow">↗</span>
      </div>

      <h3 className="post-name">{post.title}</h3>
      <p className="post-desc">{post.description}</p>

      <div className="post-tags">
        {post.tags.map(t => (
          <span key={t} className="post-tag">{t}</span>
        ))}
      </div>

      <div className="post-meta">
        <span>{formatDate(post.date)}</span>
        <span>·</span>
        <span>{post.readingMinutes} min de leitura</span>
      </div>
    </Link>
  )
}
