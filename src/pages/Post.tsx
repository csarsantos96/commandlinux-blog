import { useEffect, useMemo, useRef } from 'react'
import mermaid from 'mermaid'
import { Link, useParams } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { getPost, categoryColors, formatDate } from '../lib/posts'
import { renderMarkdown } from '../lib/markdown'
import NotFound from './NotFound'
import ShareButtons from '../components/ShareButtons'
import './Post.css'

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'strict',
})

export default function PostPage() {
  const { slug } = useParams()
  const post = slug ? getPost(slug) : undefined

  const postBodyRef = useRef<HTMLDivElement>(null)

  const html = useMemo(
    () => (post ? renderMarkdown(post.content) : ''),
    [post]
  )

  useEffect(() => {
    const container = postBodyRef.current

    if (!container) return

    const diagrams = container.querySelectorAll<HTMLElement>('pre.mermaid')

    if (!diagrams.length) return

    void mermaid.run({ nodes: Array.from(diagrams) }).catch(error => {
      console.error('Erro ao renderizar Mermaid:', error)
    })
  }, [html])

  if (!post) return <NotFound />

  const postUrl = `${window.location.origin}/post/${post.slug}`

  return (
    <article
      className="section-wrap post-page"
      style={{ '--post-color': categoryColors[post.category] } as CSSProperties}
    >
      <Link to="/" className="post-back">cd ..</Link>

      <header className="post-header">
        <span className="post-type">{post.category}</span>

        <h1 className="post-title">{post.title}</h1>

        <div className="post-meta">
          <span>{formatDate(post.date)}</span>
          <span>·</span>
          <span>{post.readingMinutes} min de leitura</span>
        </div>

        <div className="post-tags">
          {post.tags.map(tag => (
            <span key={tag} className="post-tag">
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div
        ref={postBodyRef}
        className="post-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <ShareButtons title={post.title} url={postUrl} />
    </article>
  )
}