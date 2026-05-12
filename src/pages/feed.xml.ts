import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

function extractSlug(id: string) {
  return id.replace(/\/index\.mdx?$/, '').replace(/\.mdx?$/, '');
}

export async function GET(context: any) {
  const projects = await getCollection('projects');
  const blogs = await getCollection('blogs');

  const items = [
    ...projects.map(p => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: new Date(p.data.date),
      link: `/tech/projects/${extractSlug(p.id)}/`,
    })),
    ...blogs.map(b => ({
      title: b.data.title,
      description: b.data.description,
      pubDate: new Date(b.data.date),
      link: `/tech/blog/${extractSlug(b.id)}/`,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: '林雨夜 · lyy0323.space',
    description: 'AI Product Manager & Digital Creator — Projects, Blog, Apps',
    site: context.site,
    items,
  });
}
