import { useState, useMemo } from 'react';
import ContentCard from './ContentCard';

type ContentType = 'all' | 'project' | 'blog' | 'app';

interface ContentItem {
  title: string;
  description: string;
  category?: string;
  tags: string[];
  status: string;
  date: string;
  slug: string;
  type: 'project' | 'blog' | 'app';
  featured?: boolean;
  pinned?: boolean;
  order: number;
}

interface Props {
  items: ContentItem[];
  defaultType?: ContentType;
}

const typeLabels: Record<string, string> = {
  all: '全部', project: '📁 Projects', blog: '📝 Blog', app: '🚀 App',
};

const categoryLabels: Record<string, string> = {
  all: '全部',
  website: '🌐 网站', app: '📱 App', game: '🎮 游戏', data: '📊 数据',
  art: '🎨 艺术', agent: '🤖 Agent', tool: '🔧 工具', other: '📦 其他',
};

export default function ContentGallery({ items, defaultType = 'all' }: Props) {
  const [activeType, setActiveType] = useState<ContentType>(defaultType);
  const [activeCategory, setActiveCategory] = useState('all');

  const availableTypes = useMemo(() => {
    const types = new Set(items.map(i => i.type));
    types.add('app');
    return ['all' as const, ...Array.from(types)] as ContentType[];
  }, [items]);

  const categories = useMemo(() => {
    const cats = new Set(
      items.filter(i => i.type === 'project' && i.category).map(i => i.category!)
    );
    return Array.from(cats);
  }, [items]);

  const filtered = useMemo(() => {
    let list = items.filter(i => i.type !== 'app');
    if (activeType !== 'all') {
      list = list.filter(i => i.type === activeType);
    }
    if (activeCategory !== 'all' && (activeType === 'all' || activeType === 'project')) {
      list = list.filter(i => i.category === activeCategory);
    }
    return list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.date.localeCompare(a.date);
    });
  }, [items, activeType, activeCategory]);

  const showCategoryFilter = activeType === 'all' || activeType === 'project';

  return (
    <div>
      {/* Type tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-terminal-muted text-xs mr-1 self-center">type:</span>
        {availableTypes.map((t) => (
          t === 'app' ? (
            <a key={t} href="/tech/app/"
              className="text-xs px-2.5 py-1 rounded border transition-all duration-200
                border-terminal-border bg-terminal-bg text-terminal-muted hover:border-terminal-purple/40 hover:text-terminal-purple
                inline-flex items-center gap-1">
              {typeLabels[t]}
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="opacity-60">
                <path d="M3.5 2H10V8.5M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          ) : (
            <button key={t} onClick={() => { setActiveType(t); setActiveCategory('all'); }}
              className={`text-xs px-2.5 py-1 rounded border transition-all duration-200
                ${activeType === t
                  ? 'border-terminal-green/50 bg-terminal-green/10 text-terminal-green'
                  : 'border-terminal-border bg-terminal-bg text-terminal-muted hover:border-terminal-cyan/30 hover:text-terminal-cyan'}`}>
              {typeLabels[t] || t}
            </button>
          )
        ))}
      </div>

      {/* Category filter (only for projects) */}
      {showCategoryFilter && categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-terminal-muted text-xs mr-1 self-center">category:</span>
          {['all', ...categories].map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded border transition-all duration-200
                ${activeCategory === cat
                  ? 'border-terminal-cyan/50 bg-terminal-cyan/10 text-terminal-cyan'
                  : 'border-terminal-border bg-terminal-bg text-terminal-muted hover:border-terminal-cyan/30 hover:text-terminal-cyan'}`}>
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((item) => (
          <ContentCard key={`${item.type}-${item.slug}`} {...item} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-terminal-muted text-sm">
          <div className="mb-2">No items found.</div>
          <div className="text-xs">
            <span className="prompt-symbol">❯ </span>
            <span className="cmd-text">ls {activeType !== 'all' ? activeType + '/' : ''}</span>
          </div>
          <div className="text-xs mt-1">0 results</div>
        </div>
      )}
    </div>
  );
}
