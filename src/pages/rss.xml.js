import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

// Gera /rss.xml no build. Leitores de feed (o público que blog técnico quer)
// acham isso via a <link rel="alternate"> que já está no BaseLayout.
export async function GET(context) {
  const posts = (
    await getCollection(
      'posts',
      ({ data }) => !data.draft && data.language === 'pt',
    )
  ).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'CommandLinux',
    description: 'Notas de engenharia sobre Linux, Kubernetes, DevOps e Cloud Native.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      categories: post.data.tags,
      link: `/posts/${post.id}/`,
    })),
    customData: `<language>pt-BR</language>`,
  });
}