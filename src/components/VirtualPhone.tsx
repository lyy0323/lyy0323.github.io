import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

interface AppMeta {
  id: string;
  title: string;
  icon: string;
  embed: string;
  folder?: string;
  weight: number;
}

interface FolderData {
  name: string;
  apps: AppMeta[];
  totalWeight: number;
}

type GridItem = { type: 'folder'; data: FolderData } | { type: 'app'; data: AppMeta };

interface VirtualPhoneProps {
  apps: AppMeta[];
}

const PHONE_W = 390;
const PHONE_H = 844;
const SCREEN_INSET = 10;
const SCREEN_W = PHONE_W - SCREEN_INSET * 2;
const SCREEN_R = 47;
const ITEMS_PER_PAGE = 8;

const DOCK_ICONS = [
  { icon: '📞', label: 'Phone' },
  { icon: '🧭', label: 'Safari' },
  { icon: '💬', label: 'Messages' },
  { icon: '📷', label: 'Camera' },
];

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function formatTime(d: Date) {
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function formatDate(d: Date) {
  return `${d.getMonth() + 1}月${d.getDate()}日 周${WEEKDAYS[d.getDay()]}`;
}

export default function VirtualPhone({ apps }: VirtualPhoneProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [openApp, setOpenApp] = useState<AppMeta | null>(null);
  const [openFolder, setOpenFolder] = useState<FolderData | null>(null);
  const [folderAnimState, setFolderAnimState] = useState<'idle' | 'opening' | 'closing'>('idle');
  const [appAnimState, setAppAnimState] = useState<'idle' | 'opening' | 'closing'>('idle');
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [phoneScale, setPhoneScale] = useState(1);
  const [notFoundSlug, setNotFoundSlug] = useState<string | null>(null);

  const dragRef = useRef({ startX: 0, currentX: 0, isDragging: false, startTime: 0 });
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const gridItems = useMemo<GridItem[]>(() => {
    const folderMap = new Map<string, AppMeta[]>();
    const standalone: AppMeta[] = [];
    for (const app of apps) {
      if (app.folder) {
        const list = folderMap.get(app.folder) || [];
        list.push(app);
        folderMap.set(app.folder, list);
      } else {
        standalone.push(app);
      }
    }
    const folders: FolderData[] = [];
    for (const [name, folderApps] of folderMap) {
      folderApps.sort((a, b) => b.weight - a.weight);
      folders.push({ name, apps: folderApps, totalWeight: folderApps.reduce((s, a) => s + a.weight, 0) });
    }
    folders.sort((a, b) => b.totalWeight - a.totalWeight);
    standalone.sort((a, b) => b.weight - a.weight);
    return [
      ...folders.map(f => ({ type: 'folder' as const, data: f })),
      ...standalone.map(a => ({ type: 'app' as const, data: a })),
    ];
  }, [apps]);

  const totalPages = Math.max(1, Math.ceil(gridItems.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentTime(new Date());
    const id = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openSlug = params.get('open');
    if (!openSlug) return;
    history.replaceState(null, '', window.location.pathname);
    const target = apps.find(a => a.id === openSlug);
    if (target) {
      setOpenApp(target);
    } else {
      setNotFoundSlug(openSlug);
    }
  }, [apps]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      setPhoneScale(Math.min(w / PHONE_W, 1));
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleDragStart = useCallback((clientX: number) => {
    if (totalPages <= 1) return;
    dragRef.current = { startX: clientX, currentX: clientX, isDragging: true, startTime: Date.now() };
    if (gridRef.current) gridRef.current.style.transition = 'none';
  }, [totalPages]);

  const handleDragMove = useCallback((clientX: number) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.currentX = clientX;
    const delta = clientX - dragRef.current.startX;
    const offset = -(currentPage * SCREEN_W) + delta;
    if (gridRef.current) gridRef.current.style.transform = `translateX(${offset}px)`;
  }, [currentPage]);

  const handleDragEnd = useCallback(() => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    const delta = dragRef.current.currentX - dragRef.current.startX;
    const velocity = delta / (Date.now() - dragRef.current.startTime);
    const threshold = SCREEN_W * 0.2;
    let newPage = currentPage;
    if (delta < -threshold || velocity < -0.3) newPage = Math.min(currentPage + 1, totalPages - 1);
    else if (delta > threshold || velocity > 0.3) newPage = Math.max(currentPage - 1, 0);
    if (gridRef.current) {
      gridRef.current.style.transition = 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)';
      gridRef.current.style.transform = `translateX(-${newPage * SCREEN_W}px)`;
    }
    setCurrentPage(newPage);
  }, [currentPage, totalPages]);

  const openAppHandler = useCallback((app: AppMeta) => {
    setOpenFolder(null);
    setOpenApp(app);
    setAppAnimState('opening');
    setTimeout(() => setAppAnimState('idle'), 300);
  }, []);

  const closeAppHandler = useCallback(() => {
    setAppAnimState('closing');
    setTimeout(() => {
      setOpenApp(null);
      setAppAnimState('idle');
    }, 250);
  }, []);

  const time = currentTime ? formatTime(currentTime) : '--:--';
  const date = currentTime ? formatDate(currentTime) : '';

  const renderAppIcon = (app: AppMeta, onClick: () => void) => (
    <button key={app.id} className="flex flex-col items-center gap-1.5" onClick={onClick}>
      <div className="w-[60px] h-[60px] rounded-[14px] flex items-center justify-center text-[28px] transition-transform active:scale-90"
        style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
        {app.icon}
      </div>
      <span className="text-[11px] text-white/70 truncate w-[68px] text-center">{app.title}</span>
    </button>
  );

  const renderFolderIcon = (folder: FolderData) => (
    <button key={`folder-${folder.name}`} className="flex flex-col items-center gap-1.5"
      onClick={() => { setOpenFolder(folder); setFolderAnimState('opening'); setTimeout(() => setFolderAnimState('idle'), 250); }}>
      <div className="w-[60px] h-[60px] rounded-[14px] p-[6px] grid grid-cols-2 grid-rows-2 gap-[3px] transition-transform active:scale-90"
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
        {folder.apps.slice(0, 4).map((app, i) => (
          <div key={i} className="rounded-[4px] flex items-center justify-center text-[13px]"
            style={{ background: 'rgba(255,255,255,0.1)' }}>
            {app.icon}
          </div>
        ))}
      </div>
      <span className="text-[11px] text-white/70 truncate w-[68px] text-center">{folder.name}</span>
    </button>
  );

  return (
    <div ref={containerRef} className="w-full flex justify-center pb-4 relative z-10">
      <div style={{ width: PHONE_W * phoneScale, height: PHONE_H * phoneScale }}>
        <div className="relative" style={{ width: PHONE_W, height: PHONE_H, transform: `scale(${phoneScale})`, transformOrigin: 'top left' }}>
        <div className="absolute inset-0 rounded-[55px]"
          style={{ background: 'linear-gradient(145deg, #1a1a22, #0e0e14)', boxShadow: '0 0 0 1px #333340, 0 20px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.03)' }}>
          <div className="absolute overflow-hidden flex flex-col"
            style={{ inset: SCREEN_INSET, borderRadius: SCREEN_R, background: 'linear-gradient(180deg, #0c0c14 0%, #151520 40%, #0e0e18 100%)' }}>

            {/* Dynamic island */}
            <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-black rounded-[20px] z-30 flex items-center justify-center">
              <div className="w-[10px] h-[10px] rounded-full bg-[#1a1a24] border border-[#2a2a34]" />
            </div>

            {/* ─── Homescreen ─── */}
            {!openApp && (
              <div className="flex flex-col h-full select-none">
                <div className="h-[54px] flex items-end justify-between px-8 pb-1 shrink-0">
                  <span className="text-[14px] font-semibold text-white/90">{time}</span>
                  <div className="flex items-center gap-1.5">
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><rect x="0" y="6" width="3" height="6" rx="0.5" fill="white" fillOpacity="0.7"/><rect x="4.5" y="4" width="3" height="8" rx="0.5" fill="white" fillOpacity="0.7"/><rect x="9" y="1.5" width="3" height="10.5" rx="0.5" fill="white" fillOpacity="0.7"/><rect x="13.5" y="0" width="2.5" height="12" rx="0.5" fill="white" fillOpacity="0.3"/></svg>
                    <svg width="16" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="2" stroke="white" strokeOpacity="0.5"/><rect x="2" y="2" width="14" height="8" rx="1" fill="white" fillOpacity="0.7"/><rect x="22" y="3.5" width="2" height="5" rx="0.5" fill="white" fillOpacity="0.3"/></svg>
                  </div>
                </div>

                <div className="flex flex-col items-center pt-6 pb-4 shrink-0">
                  <span className="text-[72px] font-light leading-none text-white/90 tracking-tight">{time}</span>
                  <span className="text-[16px] text-white/50 mt-1">{date}</span>
                </div>

                {/* Grid area */}
                <div className="flex-1 overflow-hidden relative"
                  onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                  onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                  onTouchEnd={handleDragEnd}
                  onMouseDown={(e) => { e.preventDefault(); handleDragStart(e.clientX); }}
                  onMouseMove={(e) => { if (dragRef.current.isDragging) handleDragMove(e.clientX); }}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                >
                  <div ref={gridRef} className="flex h-full"
                    style={{ width: `${totalPages * SCREEN_W}px`, transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)', transform: `translateX(-${currentPage * SCREEN_W}px)` }}>
                    {Array.from({ length: totalPages }, (_, pi) => {
                      const pageItems = gridItems.slice(pi * ITEMS_PER_PAGE, (pi + 1) * ITEMS_PER_PAGE);
                      return (
                        <div key={pi} className="grid grid-cols-4 gap-y-6 gap-x-2 px-6 pt-4 content-start"
                          style={{ width: SCREEN_W, minWidth: SCREEN_W }}>
                          {pageItems.map((item) =>
                            item.type === 'folder'
                              ? renderFolderIcon(item.data)
                              : renderAppIcon(item.data, () => openAppHandler(item.data))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-1.5 py-2 shrink-0">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <div key={i} className={`w-[6px] h-[6px] rounded-full transition-colors ${i === currentPage ? 'bg-white/80' : 'bg-white/20'}`} />
                    ))}
                  </div>
                )}

                <div className="shrink-0 mx-3 mb-2 px-4 py-3 rounded-[26px] flex justify-around"
                  style={{ background: 'rgba(30,30,40,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                  {DOCK_ICONS.map((d) => (
                    <div key={d.label} className="w-[52px] h-[52px] rounded-[12px] flex items-center justify-center text-[24px]"
                      style={{ background: 'rgba(255,255,255,0.08)' }}>
                      {d.icon}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pb-2 pt-1 shrink-0">
                  <div className="w-[134px] h-[5px] bg-white/15 rounded-full" />
                </div>

                {/* ─── Folder popup ─── */}
                {openFolder && (
                  <div
                    className="absolute inset-0 z-20 flex items-center justify-center"
                    style={{
                      borderRadius: SCREEN_R,
                      background: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                      animation: folderAnimState === 'opening' ? 'folderBgIn 0.25s ease forwards'
                        : folderAnimState === 'closing' ? 'folderBgOut 0.2s ease forwards' : undefined,
                    }}
                    onClick={(e) => {
                      if (e.target !== e.currentTarget) return;
                      setFolderAnimState('closing');
                      setTimeout(() => { setOpenFolder(null); setFolderAnimState('idle'); }, 200);
                    }}>
                    <div
                      className="w-[280px] rounded-[24px] p-5"
                      style={{
                        background: 'rgba(40,40,50,0.85)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        animation: folderAnimState === 'opening' ? 'folderCardIn 0.3s cubic-bezier(0.32,0.72,0,1) forwards'
                          : folderAnimState === 'closing' ? 'folderCardOut 0.2s ease forwards' : undefined,
                      }}>
                      <div className="text-[15px] text-white/80 font-medium text-center mb-4">{openFolder.name}</div>
                      <div className="grid grid-cols-3 gap-4 justify-items-center">
                        {openFolder.apps.map((app) =>
                          renderAppIcon(app, () => openAppHandler(app))
                        )}
                      </div>
                    </div>
                    <style>{`
                      @keyframes folderBgIn { from { opacity: 0; } to { opacity: 1; } }
                      @keyframes folderBgOut { from { opacity: 1; } to { opacity: 0; } }
                      @keyframes folderCardIn { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
                      @keyframes folderCardOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.6); } }
                    `}</style>
                  </div>
                )}
              </div>
            )}

            {/* ─── App view ─── */}
            {openApp && (
              <div className={`absolute inset-0 z-20 flex flex-col overflow-hidden ${appAnimState === 'opening' ? 'animate-app-open' : appAnimState === 'closing' ? 'animate-app-close' : ''}`}
                style={{ borderRadius: SCREEN_R, background: '#000' }}>
                <div className="h-[54px] flex items-end justify-between px-6 pb-2 shrink-0" style={{ background: 'rgba(0,0,0,0.85)' }}>
                  <button onClick={closeAppHandler} className="text-[14px] text-[#557799] active:opacity-50 flex items-center gap-0.5">
                    <span className="text-[18px]">{'‹'}</span> Home
                  </button>
                  <span className="text-[12px] text-white/50 truncate max-w-[160px]">{openApp.title}</span>
                  <span className="text-[12px] text-white/40 w-[50px] text-right">{time}</span>
                </div>
                <iframe src={openApp.embed} className="flex-1 w-full border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups" title={openApp.title} />
                <div className="h-[28px] bg-black flex items-center justify-center shrink-0">
                  <div className="w-[134px] h-[5px] bg-white/25 rounded-full cursor-pointer hover:bg-white/40 transition-colors" onClick={closeAppHandler} />
                </div>
              </div>
            )}

            {/* ─── Not found alert ─── */}
            {notFoundSlug && (
              <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ borderRadius: SCREEN_R, background: 'rgba(0,0,0,0.6)' }}>
                <div className="bg-[#1c1c1e] rounded-2xl p-6 mx-8 text-center shadow-xl border border-white/10">
                  <div className="text-[40px] mb-3">🔍</div>
                  <div className="text-[15px] text-white/90 font-medium mb-1">App Not Found</div>
                  <div className="text-[13px] text-white/50 mb-5">"{notFoundSlug}" is not installed.</div>
                  <button onClick={() => setNotFoundSlug(null)}
                    className="w-full py-2.5 rounded-xl text-[15px] font-medium text-[#557799] bg-white/10 active:bg-white/20 transition-colors">
                    OK
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
