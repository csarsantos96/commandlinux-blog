import { useEffect, useState } from 'react';

type Reaction = 'fire' | 'idea' | 'mindblown';
type Counts = Record<Reaction, number>;

const reactions: { key: Reaction; emoji: string; label: string }[] = [
  { key: 'fire', emoji: '🔥', label: 'Muito bom' },
  { key: 'idea', emoji: '💡', label: 'Aprendi algo' },
  { key: 'mindblown', emoji: '🤯', label: 'Surpreendente' },
];

export default function Reactions({ postId, locale = 'pt' }: { postId: string; locale?: 'pt' | 'en' }) {
  const storageKey = `commandlinux:reactions:${postId}`;
  const visitorKey = 'commandlinux:visitor-id';
  const [counts, setCounts] = useState<Counts>({ fire: 0, idea: 0, mindblown: 0 });
  const [selected, setSelected] = useState<Reaction[]>([]);
  const [pending, setPending] = useState<Reaction | null>(null);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
      setSelected(Array.isArray(saved) ? saved : saved.selected ?? []);
    } catch {
      // Ignore invalid local data.
    }

    fetch(`/api/reactions?postId=${encodeURIComponent(postId)}`)
      .then((response) => {
        if (!response.ok) throw new Error('Reactions unavailable');
        return response.json();
      })
      .then((data) => setCounts(data.counts))
      .catch(() => setAvailable(false));
  }, [storageKey]);

  const react = async (reaction: Reaction) => {
    if (pending || !available) return;

    const isSelected = selected.includes(reaction);
    const nextSelected = isSelected ? selected.filter((item) => item !== reaction) : [...selected, reaction];
    let visitorId = localStorage.getItem(visitorKey);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(visitorKey, visitorId);
    }

    setPending(reaction);

    try {
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          reaction,
          action: isSelected ? 'remove' : 'add',
          visitorId,
        }),
      });
      if (!response.ok) throw new Error('Reaction failed');

      const data = await response.json();
      setSelected(nextSelected);
      setCounts((current) => ({ ...current, [reaction]: data.count }));
      localStorage.setItem(storageKey, JSON.stringify(nextSelected));
    } catch {
      setAvailable(false);
    } finally {
      setPending(null);
    }
  };

  return (
    <section className="reactions" aria-labelledby="reactions-title">
      <span id="reactions-title">{locale === 'en' ? 'What did you think?' : 'O que achou?'}</span>
      <div>
        {reactions.map((reaction) => (
          <button
            key={reaction.key}
            className={selected.includes(reaction.key) ? 'active' : ''}
            onClick={() => react(reaction.key)}
            aria-pressed={selected.includes(reaction.key)}
            aria-label={reaction.label}
            disabled={pending !== null || !available}
          >
            <span>{reaction.emoji}</span> {counts[reaction.key]}
          </button>
        ))}
      </div>
      <small role="status">
        {!available
          ? (locale === 'en' ? 'Reactions unavailable' : 'Reações indisponíveis')
          : (locale === 'en' ? 'Global reactions · no login required' : 'Reações globais · sem login')}
      </small>
    </section>
  );
}
