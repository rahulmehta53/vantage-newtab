# Vantage — Minimalist New Tab Dashboard

> A high-performance, distraction-free new-tab productivity dashboard engineered with **SolidJS**, **Kobalte**, and **WXT (Web Extension Tools)** for Chrome Manifest V3.

![Extension Architecture](https://img.shields.io/badge/Manifest-V3-blue.svg)
![Framework](https://img.shields.io/badge/Framework-SolidJS_1.9-4f81c7.svg)
![Toolchain](https://img.shields.io/badge/Toolchain-WXT_0.20-green.svg)
![Language](https://img.shields.io/badge/Language-TypeScript_5.9-3178c6.svg)
![Bundle Size](https://img.shields.io/badge/Bundle_Size-%3C75_kB-success.svg)

---

## ⚡ Highlights

- **Instant Sub-50ms Launch**: Built with SolidJS fine-grained reactivity, avoiding virtual DOM reconciliation overhead for instantaneous new tab displays.
- **Glassmorphism Modular Architecture**:
  - **Console Drawer**: Live interactive command console and quick state toggles.
  - **Reflect Drawer**: Focused journaling and cognitive state checkpoints.
  - **Reload & Habit Triggers**: Frictionless reset mechanisms for daily task workflows.
  - **Settings Drawer**: Persistent user configuration with dynamic theming.
- **Ultra-Lean Footprint**: Production distribution package is under **72 kB**, with zero background memory bloat.
- **Strict Manifest V3 Compliance**: Clean separation of service worker lifecycle and client-side storage via `chrome.storage.local`.

---

## 🛠️ Tech Stack & Primitives

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **UI Framework** | [SolidJS](https://www.solidjs.com/) | Fine-grained reactive signals and declarative DOM bindings |
| **Extension Framework** | [WXT](https://wxt.dev/) | Next-generation Chrome extension bundler and toolchain |
| **Accessible Primitives**| [@kobalte/core](https://kobalte.dev/) | Headless, accessible UI dialogs, drawers, and tabs |
| **Icons** | [@tabler/icons-solidjs](https://tabler-icons.io/) | Crisp SVG vector icon system |
| **Styling** | Custom Modern CSS | Scoped glassmorphic aesthetics, flexbox/grid layout |
| **Runtime & Bundler** | Bun & Vite | High-velocity build pipeline with Hot Module Replacement (HMR) |

---

## 📂 Project Structure

```text
vantage/
├── entrypoints/
│   ├── background.ts                 # Service worker runtime initialization
│   └── newtab/
│       ├── App.tsx                   # Main new tab shell & reactive state provider
│       ├── background.ts             # Canvas/visual background logic
│       ├── index.html                # HTML entrypoint
│       ├── main.tsx                  # Client mount & root hydration
│       ├── storage.ts                # chrome.storage typed wrapper
│       ├── style.css                 # Theme & glassmorphic layout tokens
│       ├── types.ts                  # State & drawer interfaces
│       └── components/
│           ├── BgFooter.tsx          # Status indicators and footer metrics
│           ├── Console.tsx           # Quick action command panel
│           ├── ReflectDrawer.tsx     # Daily reflection & notes panel
│           ├── ReloadDrawer.tsx      # Fast session resets & habit refresh
│           ├── SettingsDrawer.tsx    # Appearance & feature configuration
│           └── Topbar.tsx            # Navigation, clock, and action triggers
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # Strict TypeScript rules
└── wxt.config.ts                     # WXT manifest configurations
```

---

## 🚀 Quickstart & Development

### 1. Installation

Ensure you have [Bun](https://bun.sh/) (or Node.js 18+) installed:

```bash
bun install
```

### 2. Local Development

Run the live hot-reload development server (opens Chrome with extension pre-loaded):

```bash
bun run dev
```

For Firefox:
```bash
bun run dev:firefox
```

### 3. Production Build

Compile optimized production assets into `.output/chrome-mv3`:

```bash
bun run build
```

To create a zipped distribution bundle for Chrome Web Store submission:
```bash
bun run zip
```

---

## 📄 License
MIT License. Built by [Rahul Mehta](https://github.com/rahulmehta53).
