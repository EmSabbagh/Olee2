'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Compass,
  Grid2X2,
  Map,
  Maximize,
  Minus,
  Plus,
  Volume2,
  VolumeX,
  Image as ImageIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { createAmbience } from '@/lib/ambience';
import { islands, type IslandId, getLocation } from '@/lib/world';
import WorldMapScene from '@/components/scene3d/WorldMapScene';

const motes = [
  [21, 33, 0, 9],
  [36, 27, 2, 12],
  [26, 61, 5, 10],
  [44, 57, 1, 14],
  [33, 78, 7, 11],
  [71, 18, 3, 13],
  [83, 29, 6, 10],
  [66, 36, 1, 12],
  [69, 69, 4, 14],
  [83, 74, 8, 11],
  [73, 85, 2, 13],
  [58, 56, 5, 15],
];

function Atmosphere() {
  return (
    <div className="ambient-motes" aria-hidden="true">
      {motes.map(([x, y, delay, duration], i) => (
        <span
          key={i}
          style={{
            left: `${x}%`,
            top: `${y}%`,
            animationDelay: `-${delay}s`,
            animationDuration: `${duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<IslandId | null>(null);
  const [collection, setCollection] = useState<string | null>(null);
  const [hovered, setHovered] = useState<IslandId | null>(null);
  const [visited, setVisited] = useState<IslandId[]>([]);
  const [indexOpen, setIndexOpen] = useState(false);
  const [music, setMusic] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [zoom, setZoom] = useState(1);
  const audioRef = useRef<ReturnType<typeof createAmbience> | null>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const island = islands.find((item) => item.id === active);
  const preview = islands.find((item) => item.id === hovered);

  useEffect(() => setMounted(true), []);

  const navigate = useCallback((id: IslandId | null, category?: string) => {
    const hash = id
      ? `#${id}${category ? '/' + encodeURIComponent(category) : ''}`
      : '#world';
    if (window.location.hash !== hash) window.location.hash = hash;
    setIndexOpen(false);
    setHovered(null);
  }, []);

  useEffect(() => {
    const sync = () => {
      const next = getLocation(window.location.hash);
      setActive(next.island);
      setCollection(next.collection);
      setZoom(1);
      if (next.island) {
        setVisited((old) =>
          old.includes(next.island!) ? old : [...old, next.island!],
        );
      }
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  useEffect(() => {
    if (active) backRef.current?.focus({ preventScroll: true });
  }, [active]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && active && !collection && !indexOpen)
        navigate(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [active, collection, indexOpen, navigate]);

  useEffect(
    () => () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    },
    [],
  );

  async function toggleAudio() {
    try {
      if (!audioRef.current) audioRef.current = createAmbience();
      const enabled = !music;
      await audioRef.current.setPlaying(enabled);
      setMusic(enabled);
      setAudioError('');
    } catch {
      setMusic(false);
      setAudioError('Sound is unavailable in this browser.');
    }
  }

  function openCollection(name: string) {
    if (!active) return;
    if (active === 'social' && name === 'Reels') navigate('reels');
    else navigate(active, name);
  }

  // Dragging or arrow-keying the 3D scene reports which island is now
  // facing front. While exploring, that follow-through commits to the new
  // island; on the world overview it's only a hover-style preview.
  const handleStopChange = useCallback(
    (index: number) => {
      const id = islands[index]?.id;
      if (!id) return;
      if (active) {
        if (id !== active) navigate(id, undefined);
      } else {
        setHovered(id);
      }
    },
    [active, navigate],
  );

  const focusIndex = active
    ? islands.findIndex((item) => item.id === active)
    : null;

  return (
    <main className={`world-app ${active ? 'is-exploring' : ''}`}>
      <a
        href="#navigation"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('navigation')?.focus();
        }}
      >
        Skip to island navigation
      </a>
      <header className="site-header">
        <button
          className="brand"
          onClick={() => navigate(null)}
          aria-label="Ali Sabbagh, return to world map"
        >
          <span className="monogram" aria-hidden="true">
            as<span>✦</span>
          </span>
          <span className="brand-copy">
            <strong>ALI SABBAGH</strong>
            <span>DESIGNER & VISUAL STORYTELLER</span>
          </span>
        </button>
        <nav className="header-nav" aria-label="Portfolio navigation">
          <button
            className={`nav-link ${!active ? 'current' : ''}`}
            onClick={() => navigate(null)}
          >
            <Map size={16} />
            World map
          </button>
          <button className="nav-link" onClick={() => setIndexOpen(true)}>
            <Grid2X2 size={16} />
            Work index
            <ArrowUpRight size={14} />
          </button>
        </nav>
        <div className="header-note">
          <span className="live-dot" /> A WORLD IN THE MAKING
        </div>
      </header>

      <section
        className="map-stage"
        aria-label={
          island ? `${island.name} island` : 'Interactive portfolio world map'
        }
      >
        <div className="world-intro">
          <span className="eyebrow">
            <span className="tiny-square" /> WELCOME, EXPLORER
          </span>
          <h1>
            Every idea.
            <br />A new <span>adventure.</span>
          </h1>
          <p>
            A few islands. A whole world of design.
            <br />
            Drag to look around, or click to land.
          </p>
        </div>

        {island && (
          <div className="island-heading" key={island.id}>
            <button
              className="back-link"
              ref={backRef}
              onClick={() => navigate(null)}
            >
              <ArrowLeft size={16} /> Back to the world
            </button>
            <span className="eyebrow">
              ISLAND {island.number} / {island.epithet}
            </span>
            <h1>
              {island.name}
              <span>.</span>
            </h1>
            <p>{island.description}</p>
          </div>
        )}

        <div className="map-canvas">
          {mounted ? (
            <WorldMapScene
              onStopChange={handleStopChange}
              focusIndex={focusIndex}
              zoom={active ? 1.2 : zoom}
            />
          ) : (
            <div className="world-scene-3d scene-loading" aria-hidden="true" />
          )}
          <Atmosphere />
          <div className="sea-label sea-label-one">
            THE SEA OF POSSIBILITIES
          </div>
          <div className="sea-label sea-label-two">UNEXPLORED WATERS</div>
        </div>

        <div className="compass-widget" aria-hidden="true">
          <span>N</span>
          <Compass size={54} strokeWidth={1} />
          <span className="compass-caption">FOLLOW YOUR CURIOSITY</span>
        </div>
        {!active && (
          <div className="map-legend">
            <span className="legend-line" />
            <span>ONE DESIGNER. MANY DIRECTIONS.</span>
          </div>
        )}
        {!active && (
          <button
            type="button"
            className="explorer-card"
            aria-live="polite"
            disabled={!preview}
            onClick={() => preview && navigate(preview.id)}
          >
            <div className="card-icon">
              {preview ? <ArrowUpRight size={23} /> : <Compass size={23} />}
            </div>
            <div>
              <span className="eyebrow">
                {preview
                  ? `YOUR NEXT STOP / ${preview.number}`
                  : 'A LITTLE CURIOSITY GOES A LONG WAY'}
              </span>
              <p>
                {preview
                  ? preview.description
                  : 'Drag or use ← → to face an island, then click here to land.'}
              </p>
            </div>
            <span className="card-arrow" aria-hidden="true">
              ↗
            </span>
          </button>
        )}
        {island && (
          <div className="collection-dock" id="navigation" tabIndex={-1}>
            <div className="dock-heading">
              <span className="eyebrow">EXPLORE THE ISLAND</span>
              <span>
                {String(island.collections.length).padStart(2, '0')} COLLECTION
                {island.collections.length > 1 ? 'S' : ''}
              </span>
            </div>
            <div className="collection-links">
              {island.collections.map((name, i) => (
                <button key={name} onClick={() => openCollection(name)}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {name}
                  <ArrowUpRight size={15} />
                </button>
              ))}
            </div>
          </div>
        )}
        {!active && (
          <div className="zoom-controls" aria-label="Map zoom">
            <button
              aria-label="Zoom out"
              disabled={zoom <= 1}
              onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
            >
              <Minus size={17} />
            </button>
            <button aria-label="Reset map zoom" onClick={() => setZoom(1)}>
              <Maximize size={16} />
            </button>
            <button
              aria-label="Zoom in"
              disabled={zoom >= 1.2}
              onClick={() => setZoom((z) => Math.min(1.2, z + 0.1))}
            >
              <Plus size={17} />
            </button>
          </div>
        )}
        <div className="map-coordinates" aria-hidden="true">
          {island
            ? `${island.number}° CREATIVE LATITUDE`
            : '00° 00′ N · 00° 00′ E'}
        </div>
      </section>

      <footer className="world-footer">
        <div className="exploration-status">
          <span className="live-dot" />
          <span>
            {String(visited.length).padStart(2, '0')} / 03 ISLANDS EXPLORED
          </span>
          <div className="progress-pixels" aria-hidden="true">
            {islands.map((item) => (
              <i
                key={item.id}
                className={visited.includes(item.id) ? 'discovered' : ''}
              />
            ))}
          </div>
        </div>
        <nav
          id={!active ? 'navigation' : undefined}
          className="quick-nav"
          tabIndex={-1}
          aria-label="Islands"
        >
          {islands.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={active === item.id ? 'selected' : ''}
            >
              {item.name}
              {visited.includes(item.id) && <Check size={12} />}
            </button>
          ))}
        </nav>
        <button
          className={`sound-toggle ${music ? 'playing' : ''}`}
          onClick={toggleAudio}
          aria-pressed={music}
          aria-label={
            music ? 'Turn ambient music off' : 'Turn ambient music on'
          }
        >
          {music ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>SOUND {music ? 'ON' : 'OFF'}</span>
          <span className="sound-bars" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        </button>
      </footer>
      {audioError && <output className="audio-error">{audioError}</output>}
      <output className="sr-only" aria-live="polite">
        {island
          ? `Now exploring ${island.name}. Choose a collection from the list below.`
          : 'World map. Drag or use arrow keys to face Campaigns, Reels, or Social Media, then land to explore.'}
      </output>
      <Sheet open={indexOpen} onOpenChange={setIndexOpen}>
        <SheetContent className="work-index">
          <SheetHeader>
            <span className="eyebrow">THE SHORT WAY AROUND</span>
            <SheetTitle>
              Work index<span>.</span>
            </SheetTitle>
            <SheetDescription>Find your way to a collection.</SheetDescription>
          </SheetHeader>
          <div className="index-list">
            {islands.map((item) => (
              <section key={item.id}>
                <button
                  className="index-title"
                  onClick={() => navigate(item.id)}
                >
                  <span>{item.number}</span>
                  {item.name}
                  <ArrowUpRight size={20} />
                </button>
                <div>
                  {item.collections.map((name) => (
                    <button
                      key={name}
                      onClick={() =>
                        item.id === 'social' && name === 'Reels'
                          ? navigate('reels')
                          : navigate(item.id, name)
                      }
                    >
                      {name}
                      <ArrowRight size={14} />
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <p className="index-note">More islands are on the horizon.</p>
        </SheetContent>
      </Sheet>
      <Dialog
        open={!!collection}
        onOpenChange={(open) => {
          if (!open) navigate(active);
        }}
      >
        <DialogContent className="collection-dialog">
          <div className="collection-banner">
            <span className="eyebrow">{island?.name} / THE COLLECTION</span>
            <DialogTitle>
              {collection}
              <span>.</span>
            </DialogTitle>
            <DialogDescription>
              A space for ideas, brought to life.
            </DialogDescription>
          </div>
          <div className="collection-empty">
            <span className="empty-icon">
              <ImageIcon size={28} strokeWidth={1.3} />
            </span>
            <span className="eyebrow">THE STORY IS STILL UNFOLDING</span>
            <h3>Good things take a little exploring.</h3>
            <p>
              This collection is coming soon.
              <br />
              There’s more to discover on the map.
            </p>
            <button className="yellow-button" onClick={() => navigate(active)}>
              <ArrowLeft size={16} />
              Back to {island?.name}
            </button>
          </div>
          <div className="dialog-bottom">
            <span>ALI SABBAGH / SELECTED WORK</span>
            <span>
              COMING SOON <span className="live-dot" />
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
