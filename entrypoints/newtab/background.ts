import type { BgImage, BgSettings, BgState } from './types';

const BG_STORAGE_KEY = 'vantage_bg_state';
const BG_SETTINGS_KEY = 'vantage_bg_settings';

const DEFAULT_SETTINGS: BgSettings = {
  rotation: 'manual', // "manual" | "15" | "60" | "1440"
  style: 'color',     // "color" | "grayscale" | "blur"
  overlay: 38,        // 0-80
  source: 'picsum',
  unsplashWorkerUrl: '',
  unsplashMode: 'official',
  unsplashQuery: 'nature,minimalist',
  unsplashAuthType: 'worker',
  unsplashAccessKey: ''
};

export const VantageBackground = (() => {
  let settings = { ...DEFAULT_SETTINGS };
  let history: BgImage[] = [];
  let pointer = -1;
  let nextCache: BgImage | null = null;
  let paused = false;
  let rotationTimer: any = null;

  const layerA = () => document.getElementById('bgLayerA');
  const layerB = () => document.getElementById('bgLayerB');
  const creditEl = () => document.getElementById('bgCredit');

  let activeLayer = 'A';

  function randomSeed() {
    return Math.random().toString(36).slice(2, 10);
  }

  async function fetchImage(): Promise<BgImage> {
    if (settings.source === 'unsplash') {
      if (settings.unsplashAuthType === 'api' && settings.unsplashAccessKey) {
        try {
          const query = settings.unsplashMode === 'search' ? settings.unsplashQuery : 'nature,minimalist';
          const url = new URL('https://api.unsplash.com/photos/random');
          url.searchParams.set('client_id', settings.unsplashAccessKey.trim());
          if (settings.unsplashMode === 'search') {
            url.searchParams.set('query', query);
          }

          const res = await fetch(url.toString());
          if (res.ok) {
            const data = await res.json();
            // Trigger download tracking as required by Unsplash guidelines
            if (data.links?.download_location) {
              const downloadTrackUrl = new URL(data.links.download_location);
              downloadTrackUrl.searchParams.set('client_id', settings.unsplashAccessKey.trim());
              fetch(downloadTrackUrl.toString()).catch(() => {});
            }
            
            const photographer = data.user?.name || 'Unknown';
            const profileUrl = data.user?.links?.html
              ? `${data.user.links.html}?utm_source=vantage&utm_medium=referral`
              : 'https://unsplash.com';
            const imageUrl = data.urls?.raw
              ? `${data.urls.raw}&w=1920&q=80&fit=max`
              : (data.urls?.regular || '');

            return {
              url: imageUrl,
              id: data.id || randomSeed(),
              author: photographer,
              seed: profileUrl
            };
          } else {
            console.error('Unsplash API fetch failed with status:', res.status, await res.text());
          }
        } catch (e) {
          console.error('Failed to fetch from Unsplash API, falling back:', e);
        }
      } else if (settings.unsplashWorkerUrl) {
        try {
          const query = settings.unsplashMode === 'search' ? settings.unsplashQuery : 'nature,minimalist';
          const url = new URL(settings.unsplashWorkerUrl);
          url.searchParams.set('query', query);

          const res = await fetch(url.toString());
          if (res.ok) {
            const data = await res.json();
            // Trigger download tracking as required by Unsplash guidelines
            if (data.downloadUrl) {
              fetch(data.downloadUrl).catch(() => {});
            }
            return {
              url: data.imageUrl,
              id: data.imageUrl,
              author: data.photographer,
              seed: data.profileUrl // Store photographer's Unsplash profile URL in seed
            };
          }
        } catch (e) {
          console.error('Failed to fetch from Unsplash proxy, falling back to Picsum:', e);
        }
      }
    }

    // Picsum fallback / default
    const seed = randomSeed();
    const width = 1920;
    const height = 1080;
    const imageUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;

    let author = 'Unknown';
    let id = seed;
    try {
      const numericId = await resolveId(seed, width, height);
      const infoRes = await fetch(`https://picsum.photos/id/${numericId}/info`);
      if (infoRes.ok) {
        const info = await infoRes.json();
        author = info.author || author;
        id = info.id || id;
      }
    } catch (e) {
      // fallback
    }

    return { url: imageUrl, id, author, seed };
  }

  async function resolveId(seed: string, width: number, height: number): Promise<string> {
    try {
      const res = await fetch(`https://picsum.photos/seed/${seed}/${width}/${height}`, { method: 'GET' });
      const finalUrl = res.url;
      const match = finalUrl.match(/\/id\/(\d+)\//);
      return match ? match[1] : '0';
    } catch (e) {
      return '0';
    }
  }

  function preload(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  function applyStyleClasses(el: HTMLElement) {
    el.classList.remove('grayscale', 'blur');
    if (settings.style === 'grayscale') el.classList.add('grayscale');
    if (settings.style === 'blur') el.classList.add('blur');
  }

  function applyOverlay() {
    document.documentElement.style.setProperty(
      '--scrim-opacity',
      (settings.overlay / 100).toFixed(2)
    );
  }

  function renderCredit(item: BgImage | null) {
    const el = creditEl();
    if (!el) return;
    if (!item) {
      el.innerHTML = '';
      return;
    }
    // If seed contains http, it's an Unsplash profile URL
    if (item.seed && item.seed.startsWith('http')) {
      el.innerHTML = `Photo by <a href="${item.seed}" target="_blank" rel="noopener noreferrer">${item.author}</a> / <a href="https://unsplash.com?utm_source=vantage&utm_medium=referral" target="_blank" rel="noopener noreferrer">Unsplash</a>`;
    } else {
      el.innerHTML = `Photo by <a href="https://picsum.photos/id/${item.id}/info" target="_blank" rel="noopener noreferrer">${item.author}</a> / Picsum`;
    }
  }

  function swapLayer(item: BgImage) {
    const showLayer = activeLayer === 'A' ? layerA() : layerB();
    const hideLayer = activeLayer === 'A' ? layerB() : layerA();

    if (showLayer && hideLayer) {
      hideLayer.style.backgroundImage = `url("${item.url}")`;
      applyStyleClasses(hideLayer);

      requestAnimationFrame(() => {
        hideLayer.classList.add('active');
        showLayer.classList.remove('active');
      });

      activeLayer = activeLayer === 'A' ? 'B' : 'A';
      renderCredit(item);
    }
  }

  async function ensureNextCached() {
    if (nextCache) return;
    const item = await fetchImage();
    const ok = await preload(item.url);
    if (ok) nextCache = item;
  }

  async function showCurrent() {
    if (pointer < 0 || pointer >= history.length) return;
    const item = history[pointer];
    await preload(item.url);
    swapLayer(item);
    persist();
    ensureNextCached();
  }

  async function next() {
    if (pointer < history.length - 1) {
      pointer++;
    } else {
      let item = nextCache;
      nextCache = null;
      if (!item) item = await fetchImage();
      history.push(item);
      pointer = history.length - 1;
      if (history.length > 20) {
        history = history.slice(history.length - 20);
        pointer = history.length - 1;
      }
    }
    await showCurrent();
  }

  async function prev() {
    if (pointer > 0) {
      pointer--;
      await showCurrent();
    }
  }

  function setupRotationTimer() {
    if (rotationTimer) clearInterval(rotationTimer);
    rotationTimer = null;
    if (settings.rotation === 'manual' || paused) return;
    const minutes = parseInt(settings.rotation, 10);
    if (!minutes) return;
    rotationTimer = setInterval(() => {
      if (!paused) next();
    }, minutes * 60 * 1000);
  }

  function persist() {
    chrome.storage.local.set({
      [BG_STORAGE_KEY]: { history, pointer, paused }
    });
  }

  function persistSettings() {
    chrome.storage.local.set({ [BG_SETTINGS_KEY]: settings });
  }

  function loadState(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.get([BG_STORAGE_KEY, BG_SETTINGS_KEY], (res) => {
        if (res[BG_SETTINGS_KEY]) {
          settings = { ...DEFAULT_SETTINGS, ...res[BG_SETTINGS_KEY] };
        }
        if (res[BG_STORAGE_KEY] && Array.isArray(res[BG_STORAGE_KEY].history) && res[BG_STORAGE_KEY].history.length) {
          history = res[BG_STORAGE_KEY].history;
          pointer = res[BG_STORAGE_KEY].pointer ?? history.length - 1;
          paused = !!res[BG_STORAGE_KEY].paused;
        }
        resolve();
      });
    });
  }

  // ── Public API ──────────────────────────────────────────────
  async function init() {
    await loadState();
    applyOverlay();

    // Setup initial layer
    const firstLayer = layerA();
    if (firstLayer && history.length > 0) {
      const item = history[pointer];
      firstLayer.style.backgroundImage = `url("${item.url}")`;
      firstLayer.classList.add('active');
      applyStyleClasses(firstLayer);
      renderCredit(item);
    }

    if (history.length === 0) {
      await next();
    } else {
      ensureNextCached();
    }
    setupRotationTimer();
  }

  function getSettings(): BgSettings {
    return { ...settings };
  }

  function updateSettings(partial: Partial<BgSettings>) {
    const prevRotation = settings.rotation;
    settings = { ...settings, ...partial };
    persistSettings();
    applyOverlay();

    const currentLayer = activeLayer === 'A' ? layerB() : layerA();
    if (currentLayer) {
      applyStyleClasses(currentLayer);
    }

    if (settings.rotation !== prevRotation) {
      setupRotationTimer();
    }
  }

  function isPaused() {
    return paused;
  }

  function togglePause() {
    paused = !paused;
    persist();
    setupRotationTimer();
    return paused;
  }

  return { init, next, prev, getSettings, updateSettings, isPaused, togglePause };
})();
