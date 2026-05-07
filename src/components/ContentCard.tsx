import { useState } from 'react';

interface ContentCardProps {
  title: string;
  description: string;
  category?: string;
  tags: string[];
  status: string;
  date: string;
  slug: string;
  type: 'project' | 'blog' | 'app';
  featured?: boolean;
}

const categoryIcons: Record<string, string> = {
  website: '🌐', app: '📱', game: '🎮', data: '📊',
  art: '🎨', agent: '🤖', tool: '🔧', other: '📦',
};

const typeIcons: Record<string, string> = {
  project: '📁', blog: '📝', app: '🚀',
};

const statusColors: Record<string, string> = {
  active: 'bg-terminal-green/10 text-terminal-green border-terminal-green/20',
  archived: 'bg-terminal-muted/10 text-terminal-muted border-terminal-muted/20',
  wip: 'bg-terminal-amber/10 text-terminal-amber border-terminal-amber/20',
};

const statusLabels: Record<string, string> = {
  active: '● active', archived: '○ archived', wip: '◐ wip',
};

const typeRoutes: Record<string, string> = {
  project: '/tech/projects/', blog: '/tech/blog/', app: '/tech/app/',
};

export default function ContentCard({
  title, description, category, tags, status, date, slug, type, featured,
}: ContentCardProps) {
  const [hovered, setHovered] = useState(false);
  const href = `${typeRoutes[type]}${slug}/`;
  const icon = category ? (categoryIcons[category] || '📦') : typeIcons[type];

  return (
    <a
      href={href}
      className={`group block p-5 rounded-lg border transition-all duration-300
        ${featured
          ? 'border-terminal-green/30 bg-terminal-surface hover:border-terminal-green/60'
          : 'border-terminal-border bg-terminal-bg hover:border-terminal-cyan/40'}
        hover:shadow-[0_0_30px_rgba(85,153,119,0.06)] hover:-translate-y-0.5`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className={`font-semibold text-sm font-lxgw transition-colors duration-200
            ${hovered ? 'text-terminal-green' : 'text-terminal-text'}`}>
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] px-1 py-0.5 rounded border border-terminal-border text-terminal-muted">
            {type}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>
      </div>

      <p className="text-xs text-terminal-muted mb-3 line-clamp-2 font-lxgw leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {tags.slice(0, 4).map((tag) => (
          <span key={tag}
            className="text-[10px] px-1.5 py-0.5 rounded bg-terminal-surface
              text-terminal-cyan/70 border border-terminal-border">
            {tag}
          </span>
        ))}
        {tags.length > 4 && (
          <span className="text-[10px] text-terminal-muted">+{tags.length - 4}</span>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-terminal-muted">
        <span>{date}</span>
        <span className={`transition-all duration-200
          ${hovered ? 'text-terminal-green translate-x-0' : 'opacity-0 -translate-x-2'}`}>
          → open
        </span>
      </div>
    </a>
  );
}
