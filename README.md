# RONIN AI LAB - High Performance Commercial AI Workbench

RONIN AI LAB is a distinct, minimalist, and highly polished AI aggregator SaaS workbench built with **Vite + React + Express + TypeScript + Tailwind CSS**. It connects directly to your high-performance **New API** server base without exposing credentials of any kind to the public frontend web layers.

Designed from the ground up to prevent downstream bloat, featuring high-contrast light aesthetics ("Swiss design"), premium floating background blobs, responsive layout density, and Miro/FigJam-inspired productive whiteboards.

---

## ⚡ Key Core Workspaces & Routes

1. **AI Dialogue Terminal (AI Chat)**
   * Streamlines communication via multiple top-tier models (`gpt-4o-mini`, `gpt-4o`, `deepseek-v3`, `deepseek-r1`, `claude-3-5-sonnet`).
   * Backed by interactive sidebar conversation caching stored instantly in user `localStorage` buffers.
2. **AI Drawing Center (AI Creative Studio)**
   * Built for creative outputs using `gpt-image-1` (design layouts/posters) and `stable-diffusion-3.5`.
   * High-definition asset previews, instant modal zoom triggers, and one-click base64 asset downloads.
3. **Infinite Creative Workspace (Miro/FigJam Whiteboard)**
   * **Mathematical Physics Panning & Zooming**: Built-in coordinates offsets calculated under zoom scaling (from 40% to 200%).
   * **Inspector Properties Panel**: Active card detectors allow live editing of custom card dimensions (stretch slider from 180px to 600px), header tags, and core contents.
   * **Card Type Sets**: Supports Post-it Sticky notes (`note`), Prompt templates (`prompt`), AI Output copyholders (`result`), and Polaroid/Art canvas frames (`image`).
   * **Workspace Native Generation**: Direct canvas prompts to run paint actions on the sandbox. Auto-centers generated objects in your current viewpoint.
   * **Persistence Serialization**: Supports sandbox configuration backups! Export whiteboard states to local JSON files and restore live whiteboards on the fly.
4. **Model Marketplace & Plan Packages**
   * Pre-populated with real corporate intelligence models, detailed prompt tokens pricing, and static subscription packages with secure console redirectional links.

---

## 🔒 Security & Architecture Design

To ensure a secure commercial setup, **no keys are hardcoded: any public access token is forbidden in local client source files**.
* **Unified Server Proxy**: The Express backend in `server.ts` handles all incoming POST queries. It checks user authority, injects `NEWAPI_KEY` from strict system environment variables, forwards payload, and handles downstream balance/quota limits gracefully.
* **Access Control Protect Unit**: The `APP_ACCESS_CODE` is enforced natively. If configured in the environment, anonymous users cannot invoke your premium API channels and will be prompted with a secure verification modal. Code entries are safely cached locally inside client cookies.

---

## 📦 Directory Structure

* `/server.ts` - Ultra-reliability full-stack proxy server with timeout configurations, verification middlewares, and Vite asset fallbacks.
* `/src/App.tsx` - Heart of the frontend. Highly structured route selectors and infinite whiteboard canvas event handlers.
* `/src/types.ts` - Centralized absolute typings preventing any build or runtime runtime type exceptions.
* `/src/data.ts` - Fully detailed models pricing sheets, static documentation indexes, and templates.
* `/.env.example` - Template showing required keys.

---

## ⚙️ Environment Configuration

Create a `.env` in the root folder using `.env.example` as a starting guide:

```env
# Server runner port (Defaults to 3001)
PORT=3001

# Your New API server address (Default base)
NEWAPI_BASE_URL="https://ai.ronin77.xyz/v1"

# Your premium high-quota key (Keep safe, server-only)
NEWAPI_KEY="sk-xxxxx..."

# Security gatekeeper pass (Bypassed if left completely empty)
APP_ACCESS_CODE="RONIN77"
```

---

## 🚀 Speed-run Setup Guide

### 1. Install Workspace Dependencies
```bash
npm install
```

### 2. Launch Local Dev Sandbox
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) to interact with the platform.

### 3. Build Compiled Production Bundle
The build system utilizes `esbuild` to compile your TypeScript server logic into a standalone, ultra-fast, self-contained CommonJS target (`dist/server.cjs`), eliminating ESM import checks completely.
```bash
npm run build
```

### 4. Boot Standalone Server
```bash
npm start
```

---

*Crafted by RONIN AI LAB Team. Universal permissions applied.*
