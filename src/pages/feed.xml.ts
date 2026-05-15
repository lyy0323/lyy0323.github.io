import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { marked } from 'marked';

function extractSlug(id: string) {
  return id.replace(/\/index\.mdx?$/, '').replace(/\.mdx?$/, '');
}

function stripJsx(body: string): string {
  return body
    .replace(/^import\s+.*$/gm, '')
    .replace(/<\w+[^>]*client:\w+[^>]*\/>/gs, '')
    .replace(/<(\w+)[^>]*client:\w+[^>]*>[\s\S]*?<\/\1>/gs, '');
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
      content: marked.parse(stripJsx(p.body ?? '')) as string,
    })),
    ...blogs.map(b => ({
      title: b.data.title,
      description: b.data.description,
      pubDate: new Date(b.data.date),
      link: `/tech/blog/${extractSlug(b.id)}/`,
      content: marked.parse(stripJsx(b.body ?? '')) as string,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: '林雨夜 · lyy0323.space',
    description: 'AI Product Manager & Digital Creator — Projects, Blog, Apps',
    site: context.site,
    items,
  });
}
