import { createSignal, createEffect, Show } from 'solid-js';
import { IconSettings, IconCheck } from '@tabler/icons-solidjs';
import { VantageBackground } from '../background';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsDrawer(props: SettingsDrawerProps) {
  const [source, setSource] = createSignal<'picsum' | 'unsplash'>('picsum');
  const [unsplashWorkerUrl, setUnsplashWorkerUrl] = createSignal('');
  const [unsplashMode, setUnsplashMode] = createSignal<'official' | 'search'>('official');
  const [unsplashQuery, setUnsplashQuery] = createSignal('nature,minimalist');
  const [unsplashAuthType, setUnsplashAuthType] = createSignal<'worker' | 'api'>('worker');
  const [unsplashAccessKey, setUnsplashAccessKey] = createSignal('');
  
  const [rotation, setRotation] = createSignal('manual');
  const [style, setStyle] = createSignal('color');
  const [overlay, setOverlay] = createSignal(38);
  const [statusText, setStatusText] = createSignal('');
  const [statusType, setStatusType] = createSignal<'success' | ''>('');

  createEffect(() => {
    if (props.open) {
      const settings = VantageBackground.getSettings();
      setSource(settings.source);
      setUnsplashWorkerUrl(settings.unsplashWorkerUrl);
      setUnsplashMode(settings.unsplashMode);
      setUnsplashQuery(settings.unsplashQuery);
      setUnsplashAuthType(settings.unsplashAuthType || 'worker');
      setUnsplashAccessKey(settings.unsplashAccessKey || '');
      
      setRotation(settings.rotation);
      setStyle(settings.style);
      setOverlay(settings.overlay);
      setStatusText('');
      setStatusType('');
    }
  });

  function handleSave() {
    VantageBackground.updateSettings({
      source: source(),
      unsplashWorkerUrl: unsplashWorkerUrl().trim(),
      unsplashMode: unsplashMode(),
      unsplashQuery: unsplashQuery().trim(),
      unsplashAuthType: unsplashAuthType(),
      unsplashAccessKey: unsplashAccessKey().trim(),
      rotation: rotation(),
      style: style(),
      overlay: overlay(),
    });

    setStatusText('Settings saved.');
    setStatusType('success');

    setTimeout(() => {
      props.onClose();
    }, 500);
  }

  return (
    <div
      class={`drawer-overlay ${props.open ? 'open' : ''}`}
      onClick={(e) => e.target === e.currentTarget && props.onClose()}
    >
      <div class="drawer settings-drawer">
        <div class="drawer-header">
          <IconSettings class="drawer-header-icon" size="22" stroke={1.8} />
          <h3>Background settings</h3>
        </div>
        <p class="drawer-sub">
          Choose between Picsum Photos (ready-to-use) and Unsplash (curated photography via API key or proxy worker).
        </p>

        <label class="field-label">Background Source</label>
        <select
          value={source()}
          onChange={(e) => setSource(e.currentTarget.value as 'picsum' | 'unsplash')}
        >
          <option value="picsum">Picsum Photos (Free, Keyless)</option>
          <option value="unsplash">Unsplash (API Key / Proxy)</option>
        </select>

        <Show when={source() === 'unsplash'}>
          <label class="field-label">Unsplash Connection Method</label>
          <select
            value={unsplashAuthType()}
            onChange={(e) => setUnsplashAuthType(e.currentTarget.value as 'worker' | 'api')}
          >
            <option value="worker">Cloudflare Worker Proxy</option>
            <option value="api">Direct API Key</option>
          </select>

          <Show when={unsplashAuthType() === 'worker'}>
            <label class="field-label">Cloudflare Worker Proxy URL</label>
            <textarea
              value={unsplashWorkerUrl()}
              onInput={(e) => setUnsplashWorkerUrl(e.currentTarget.value)}
              placeholder="https://your-worker-name.workers.dev"
              rows="2"
              style={{ "font-family": "var(--font-mono)", "font-size": "0.8rem" }}
            />
          </Show>

          <Show when={unsplashAuthType() === 'api'}>
            <label class="field-label">Unsplash API Access Key</label>
            <input
              type="password"
              value={unsplashAccessKey()}
              onInput={(e) => setUnsplashAccessKey(e.currentTarget.value)}
              placeholder="Enter Unsplash Access Key"
              style={{ "font-family": "var(--font-mono)", "font-size": "0.8rem" }}
            />
            <p style={{ "font-size": "0.72rem", "color": "var(--text-muted)", "margin-top": "2px", "line-height": "1.3" }}>
              Get a free developer account and API key at <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer" style={{ "color": "var(--accent)", "text-decoration": "underline" }}>unsplash.com/developers</a>.
            </p>
          </Show>

          <label class="field-label">Unsplash Mode</label>
          <select
            value={unsplashMode()}
            onChange={(e) => setUnsplashMode(e.currentTarget.value as 'official' | 'search')}
          >
            <option value="official">Official Curated Collection</option>
            <option value="search">Search Keywords</option>
          </select>

          <Show when={unsplashMode() === 'search'}>
            <label class="field-label">Search Keywords (comma-separated)</label>
            <textarea
              value={unsplashQuery()}
              onInput={(e) => setUnsplashQuery(e.currentTarget.value)}
              placeholder="minimalist, nature, space"
              rows="2"
              style={{ "font-family": "var(--font-mono)", "font-size": "0.8rem" }}
            />
          </Show>
        </Show>

        <label class="field-label">Rotation</label>
        <select
          value={rotation()}
          onChange={(e) => setRotation(e.currentTarget.value)}
        >
          <option value="manual">Manual (change only on click)</option>
          <option value="15">Every 15 minutes</option>
          <option value="60">Hourly</option>
          <option value="1440">Daily</option>
        </select>

        <label class="field-label">Image style</label>
        <select
          value={style()}
          onChange={(e) => setStyle(e.currentTarget.value)}
        >
          <option value="color">Full color</option>
          <option value="grayscale">Grayscale</option>
          <option value="blur">Soft blur</option>
        </select>

        <label class="field-label">Overlay darkness ({overlay()}%)</label>
        <input
          type="range"
          min="0"
          max="80"
          value={overlay()}
          onInput={(e) => setOverlay(parseInt(e.currentTarget.value, 10))}
        />

        <div class={`drawer-status ${statusType()}`}>
          {statusType() === 'success' && <IconCheck size={15} />}
          <span>{statusText()}</span>
        </div>

        <div class="drawer-actions">
          <button class="ghost-btn" onClick={props.onClose}>
            Close
          </button>
          <button class="primary-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
