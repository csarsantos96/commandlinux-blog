import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

const posts = await getCollection('posts', ({ data }) => !data.draft);

const pages = Object.fromEntries(
  posts.map((post) => {
    const language = post.data.language === 'en' ? 'en' : 'pt';
    const slug = post.id.replace(/^en\//, '');

    return [`${language}/${slug}`, post.data];
  }),
);

const categoryColors: Record<string, [number, number, number]> = {
  KUBERNETES: [0, 212, 255],
  DOCKER: [251, 191, 36],
  TERRAFORM: [167, 139, 250],
  LINUX: [34, 197, 94],
  'CI/CD': [244, 114, 182],
  CLOUD: [249, 115, 22],
  NETWORKING: [255, 255, 255],
};

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page) => {
    const category = String(page.category).toUpperCase();
    const color = categoryColors[category] ?? [0, 212, 255];

    return {
      title: page.title,
      description: `${category}  //  commandlinux.dev`,
      fonts: [
        './node_modules/katex/dist/fonts/KaTeX_SansSerif-Regular.ttf',
        './node_modules/katex/dist/fonts/KaTeX_SansSerif-Bold.ttf',
      ],
      bgGradient: [[8, 8, 8], [22, 22, 22]],
      border: { color, width: 14, side: 'inline-start' },
      padding: 72,
      font: {
        title: { color: [245, 245, 245], size: 64, weight: 'bold', lineHeight: 1.1, families: ['KaTeX_SansSerif'] },
        description: { color, size: 30, weight: 'normal', families: ['KaTeX_SansSerif'] },
      },
    };
  },
});
