import { useState, useEffect } from 'react';

type Props = {
  title: string;
  description: string;
  category: string;
  locale?: 'pt' | 'en';
};

const categoryColors: Record<string, string> = {
  KUBERNETES: '#00d4ff',
  DOCKER: '#fbbf24',
  TERRAFORM: '#a78bfa',
  LINUX: '#22c55e',
  'CI/CD': '#f472b6',
  CLOUD: '#f97316',
  NETWORKING: '#ffffff',
};

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines;
}

export default function ShareButtons({ title, description, category, locale = 'pt' }: Props) {
  const [copied, setCopied] = useState(false);
  const [storyStatus, setStoryStatus] = useState<'idle' | 'creating' | 'ready'>('idle');
  const [url, setUrl] = useState('');
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyTheme, setStoryTheme] = useState<'terminal' | 'light' | 'gradient'>('terminal');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M18.9 2H22l-7.6 8.7L23.3 22h-6.9l-5.4-6.6L4.7 22H1.5l8.1-9.3L1 2h7.1l4.9 6.1L18.9 2Zm-1.2 18h1.9L7.4 4H5.3l12.4 16Z"/>
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45Z"/>
        </svg>
      ),
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0 0 12.04 2Zm0 18.12h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.14.82.84-3.06-.2-.31a8.2 8.2 0 0 1-1.26-4.4c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 5.83 2.42 8.18 8.18 0 0 1 2.41 5.82c0 4.55-3.7 8.24-8.24 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.8-.23-.09-.39-.12-.56.13-.17.24-.64.8-.78.96-.14.17-.29.19-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.24-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.24.25-.4.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14 0-.31-.01-.47-.01-.17 0-.44.06-.67.31-.23.24-.87.86-.87 2.09 0 1.23.9 2.42 1.02 2.58.12.17 1.77 2.7 4.29 3.79.6.26 1.07.42 1.44.53.6.19 1.15.16 1.59.1.49-.07 1.47-.6 1.67-1.19.21-.58.21-1.08.14-1.19-.06-.11-.23-.17-.48-.3Z"/>
        </svg>
      ),
    },
  ];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStory = async () => {
    if (!url || storyStatus === 'creating') return;

    setStoryStatus('creating');

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;

    const context = canvas.getContext('2d');
    if (!context) return setStoryStatus('idle');

    const normalizedCategory = category.trim().toUpperCase();
    const accent = categoryColors[normalizedCategory] ?? '#00d4ff';
    const theme = {
      terminal: { start: '#080808', end: '#161616', text: '#f5f5f5', muted: '#c8c8c8', grid: '#282828' },
      light: { start: '#f5f5f5', end: '#dddddd', text: '#080808', muted: '#444444', grid: '#cccccc' },
      gradient: { start: '#071a24', end: '#160d25', text: '#f5f5f5', muted: '#d5d5d5', grid: '#29404a' },
    }[storyTheme];
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, theme.start);
    gradient.addColorStop(1, theme.end);
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = theme.grid;
    context.lineWidth = 2;
    for (let position = 0; position <= canvas.width; position += 80) {
      context.beginPath();
      context.moveTo(position, 0);
      context.lineTo(position, canvas.height);
      context.stroke();
    }
    for (let position = 0; position <= canvas.height; position += 80) {
      context.beginPath();
      context.moveTo(0, position);
      context.lineTo(canvas.width, position);
      context.stroke();
    }

    context.fillStyle = accent;
    context.fillRect(0, 0, 18, canvas.height);

    context.fillStyle = accent;
    context.font = '700 34px "JetBrains Mono", monospace';
    context.fillText(`// ${normalizedCategory}`, 92, 230);

    context.fillStyle = theme.text;
    context.font = '800 78px Syne, sans-serif';
    const lines = wrapText(context, title, 896).slice(0, 8);
    lines.forEach((line, index) => context.fillText(line, 92, 430 + index * 96));

    const descriptionTop = 430 + lines.length * 96 + 52;
    context.fillStyle = theme.muted;
    context.font = '400 38px Syne, sans-serif';
    const descriptionLines = wrapText(context, description, 896).slice(0, 6);
    descriptionLines.forEach((line, index) => {
      context.fillText(line, 92, descriptionTop + index * 55);
    });

    context.fillStyle = '#00d4ff';
    context.font = '700 42px "JetBrains Mono", monospace';
    context.fillText('>_', 92, 1645);
    context.fillStyle = theme.text;
    context.fillText(' commandlinux.dev', 155, 1645);

    context.fillStyle = theme.muted;
    context.font = '400 28px "JetBrains Mono", monospace';
    context.fillText(
      locale === 'en' ? 'Read the full article at the link' : 'Leia o artigo completo no link',
      92,
      1710,
    );

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return setStoryStatus('idle');

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // The image can still be shared when clipboard permission is unavailable.
    }

    const slug = new URL(url).pathname.split('/').filter(Boolean).at(-1) ?? 'post';
    const file = new File([blob], `commandlinux-${slug}-story.png`, { type: 'image/png' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title, text: url });
        setStoryOpen(false);
        setStoryStatus('ready');
        setTimeout(() => setStoryStatus('idle'), 3000);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          setStoryStatus('idle');
          return;
        }
      }
    }

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(downloadUrl);
    setStoryStatus('ready');
    setStoryOpen(false);
    setTimeout(() => setStoryStatus('idle'), 3000);
  };

  return (
    <div className="share-buttons">
      <span className="share-label">compartilhar</span>
      <div className="share-icons">
        {shareLinks.slice(0, 2).map((s) => (
          <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
            className="share-icon" aria-label={`Compartilhar no ${s.name}`}
            title={`Compartilhar no ${s.name}`}>
            {s.icon}
          </a>
        ))}
        <button onClick={() => setStoryOpen(true)} className="share-icon share-story"
          aria-label={locale === 'en' ? 'Create Instagram Story' : 'Criar Story do Instagram'}
          title={locale === 'en' ? 'Create Instagram Story' : 'Criar Story do Instagram'}
          disabled={storyStatus === 'creating'}>
          {storyStatus === 'creating' ? (
            <span className="story-spinner" aria-hidden="true" />
          ) : storyStatus === 'ready' ? '✓' : (
            <svg viewBox="0 0 24 24" fill="none" width="19" height="19" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
          )}
        </button>
        {shareLinks.slice(2).map((s) => (
          <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
            className="share-icon" aria-label={`Compartilhar no ${s.name}`}
            title={`Compartilhar no ${s.name}`}>
            {s.icon}
          </a>
        ))}
        <button onClick={handleCopy} className="share-icon share-copy"
          aria-label="Copiar link" title="Copiar link">
          {copied ? '✓' : '🔗'}
        </button>
      </div>
      {storyStatus === 'ready' && (
        <span className="story-feedback" role="status">
          {locale === 'en' ? 'Image ready · link copied' : 'Imagem pronta · link copiado'}
        </span>
      )}
      {storyOpen && (
        <div className="story-modal" role="dialog" aria-modal="true" aria-label={locale === 'en' ? 'Story preview' : 'Prévia do Story'}>
          <button className="story-backdrop" onClick={() => setStoryOpen(false)} aria-label={locale === 'en' ? 'Close' : 'Fechar'} />
          <div className="story-dialog">
            <div className="story-dialog-header">
              <strong>{locale === 'en' ? 'Story preview' : 'Prévia do Story'}</strong>
              <button onClick={() => setStoryOpen(false)} aria-label={locale === 'en' ? 'Close' : 'Fechar'}>×</button>
            </div>
            <div className={`story-card story-card--${storyTheme}`}>
              <span style={{ color: categoryColors[category.trim().toUpperCase()] ?? '#00d4ff' }}>// {category}</span>
              <h2>{title}</h2>
              <p>{description}</p>
              <b>&gt;_ commandlinux.dev</b>
            </div>
            <div className="story-themes" role="group" aria-label={locale === 'en' ? 'Choose theme' : 'Escolha o tema'}>
              {(['terminal', 'light', 'gradient'] as const).map((theme) => (
                <button className={storyTheme === theme ? 'active' : ''} onClick={() => setStoryTheme(theme)}>{theme}</button>
              ))}
            </div>
            <button className="story-generate" onClick={handleStory} disabled={storyStatus === 'creating'}>
              {storyStatus === 'creating' ? (locale === 'en' ? 'Creating…' : 'Gerando…') : (locale === 'en' ? 'Share image' : 'Compartilhar imagem')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
