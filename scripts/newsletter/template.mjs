export function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character],
  );
}

export function renderSeries(series, language) {
  if (!series?.name) return '';

  const part =
    series.part && series.totalParts
      ? `<br><span style="color:#B5B5B5;">${language === 'en' ? 'Part' : 'Parte'} ${series.part} ${language === 'en' ? 'of' : 'de'} ${series.totalParts}</span>`
      : '';

  return `<p style="margin:0 0 16px;color:#39FF6A;font-size:14px;line-height:1.6;"><strong>${escapeHtml(series.name)}</strong>${part}</p>`;
}

export function renderNewsletter(post) {
  const english = post.language === 'en';
  const text = english
    ? {
        label: 'NEW ON THE BLOG',
        headline: 'New article on CommandLinux.',
        cta: 'Read the article',
        motto: 'Learn. Build. Share. Evolve.',
        footer: 'Technology is learned by doing.',
      }
    : {
        label: 'NOVO NO BLOG',
        headline: 'Novo artigo no CommandLinux.',
        cta: 'Ler o artigo',
        motto:
          'Aprenda. Construa. Compartilhe. Evolua.',
        footer: 'Tecnologia se aprende fazendo.',
      };

  const date = new Intl.DateTimeFormat(
    english ? 'en-US' : 'pt-BR',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    },
  ).format(post.date);

  const tags = post.tags
    .slice(0, 3)
    .map((tag) => `#${escapeHtml(tag)}`)
    .join(' &nbsp; ');

  const context = [
    escapeHtml(post.category.toUpperCase()),
    escapeHtml(date),
    tags,
  ]
    .filter(Boolean)
    .join(' &nbsp;·&nbsp; ');

  const image = post.image
    ? `<tr><td style="padding:0 24px;"><a href="${escapeHtml(post.url)}"><img src="${escapeHtml(post.image)}" width="550" alt="${escapeHtml(post.title)}" style="display:block;width:100%;max-width:550px;height:auto;border:0;border-radius:8px;color:#F5F5F5;"></a></td></tr>`
    : '';

  const series = renderSeries(
    post.series,
    post.language,
  );

  const homeUrl = new URL(
    english ? '/en/' : '/',
    post.url,
  ).href;

  return `<!doctype html>
<html lang="${english ? 'en' : 'pt-BR'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(post.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#080808;color:#F5F5F5;font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(post.description)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#080808" style="width:100%;background-color:#080808;">
<tr><td align="center" style="padding:24px 12px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#111111;border:1px solid #282828;">
<tr><td style="padding:28px 24px 20px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td><img src="${escapeHtml(post.logo)}" width="48" height="48" alt="$" style="display:block;border:0;"></td>
<td style="padding-left:12px;color:#F5F5F5;font-family:Consolas,monospace;font-size:24px;font-weight:bold;">CommandLinux</td>
</tr></table>
<p style="margin:20px 0 0;color:#A3A3A3;font-size:10px;line-height:1.8;letter-spacing:1px;">LINUX · NETWORKING · DOCKER · KUBERNETES · CI/CD · SECURITY · CLOUD</p>
</td></tr>
<tr><td style="padding:12px 24px 24px;">
<p style="margin:0 0 12px;color:#39FF6A;font-family:Consolas,monospace;font-size:12px;letter-spacing:2px;">${text.label}</p>
<h1 style="margin:0;color:#F5F5F5;font-size:28px;line-height:1.3;">${text.headline}</h1>
</td></tr>
${image}
<tr><td style="padding:24px;">
<p style="margin:0 0 14px;color:#A3A3A3;font-family:Consolas,monospace;font-size:11px;line-height:1.7;">${context}</p>
${series}
<h2 style="margin:0 0 16px;color:#F5F5F5;font-size:24px;line-height:1.4;">${escapeHtml(post.title)}</h2>
<p style="margin:0 0 24px;color:#B5B5B5;font-size:16px;line-height:1.7;">${escapeHtml(post.description)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td bgcolor="#39FF6A" style="background-color:#39FF6A;border-radius:8px;mso-padding-alt:16px 24px;">
<a href="${escapeHtml(post.url)}" style="display:inline-block;padding:16px 24px;color:#080808;font-size:16px;font-weight:bold;text-decoration:none;border-radius:8px;">${text.cta} →</a>
</td></tr></table>
</td></tr>
<tr><td style="padding:24px;border-top:1px solid #282828;">
<p style="margin:0 0 8px;color:#F5F5F5;font-size:14px;line-height:1.6;">${text.motto}</p>
<p style="margin:0;color:#A3A3A3;font-size:13px;line-height:1.6;">${text.footer}</p>
<p style="margin:16px 0 0;color:#A3A3A3;font-size:12px;">CommandLinux · <a href="${escapeHtml(homeUrl)}" style="color:#39FF6A;">commandlinux.dev</a></p>
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>
`;
}
