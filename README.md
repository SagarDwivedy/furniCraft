# FurniCraft — Production 3D Furniture Configurator

A portfolio-grade SaaS demo built with React, Three.js, Zustand, Tailwind CSS, and Node.js/Express.

## Project Structure

```
furniture-saas/
├── frontend/                  # React + Vite + Three.js
│   ├── src/
│   │   ├── three/
│   │   │   └── SceneManager.js       # Pure Three.js class — all 3D logic
│   │   ├── services/
│   │   │   ├── pricingService.js     # Volume-based pricing engine
│   │   │   ├── materialService.js    # PBR material builder + texture loader
│   │   │   └── configService.js      # Save/load via API + localStorage fallback
│   │   ├── store/
│   │   │   └── useConfigStore.js     # Zustand global state
│   │   └── components/
│   │       ├── scene/ThreeCanvas.jsx # Mounts SceneManager, bridges store ↔ 3D
│   │       └── ui/
│   │           ├── Header.jsx
│   │           ├── Sidebar.jsx
│   │           ├── DimensionControls.jsx
│   │           ├── MaterialPicker.jsx
│   │           ├── PricePanel.jsx
│   │           ├── SharePanel.jsx
│   │           ├── UploadOverlay.jsx
│   │           └── ViewportBar.jsx
└── backend/                   # Node.js + Express API
    └── src/
        └── index.js           # Config save/load routes
```

## Quick Start

### 1. Backend
```bash
cd backend
npm install
npm run dev
# API running at http://localhost:4000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# App at http://localhost:5173
```

### 3. Load your model
Drop your `table_model.glb` onto the upload area.

## Features

### Price Calculation
- Volume-based: `(W × T × D) + 2×(T × H × D)` in cm³
- Material rate per cm³ (oak: $0.008, walnut: $0.014, steel: $0.020)
- Fixed craft fee per material
- Thickness surcharge tiers
- All logic in `pricingService.js` — easy to modify rates

### Save & Share
- Click "Generate Share Link" in the sidebar
- Config POSTed to Express → gets a nanoid
- Shareable URL: `http://localhost:5173/config/V1StGXR8_Z`
- Loading that URL restores dimensions + material automatically
- Falls back to localStorage if backend is offline

### PBR Materials
To enable real textures, add folders to `frontend/public/textures/`:
```
public/textures/
├── oak/
│   ├── color.jpg
│   ├── roughness.jpg
│   └── normal.jpg
├── walnut/   (same structure)
└── metal/    (same structure)
```
Free PBR textures: https://polyhaven.com/textures

### HDRI Lighting
Add `studio.hdr` to `frontend/public/hdri/` for realistic environment reflections.
Free HDRIs: https://polyhaven.com/hdris

## Architecture Decisions

**SceneManager as a class, not React:**
Three.js does not belong in React's render cycle. By isolating it in a plain class,
we avoid re-render issues and keep 3D code testable and portable.

**Zustand over Context:**
Context re-renders the entire tree on every change.
Zustand uses selectors — only components that subscribe to a specific slice re-render.
With 4 sliders updating 60fps, this matters.

**Service layer:**
Pricing, material, and config logic are pure functions — no UI, no 3D.
Swap the backend URL, change pricing rates, or add textures without touching components.

## Scaling to Production

1. **Database**: Replace the in-memory Map with MongoDB
   ```js
   // backend: swap store.set/get with:
   await Config.create({ id, config });
   await Config.findOne({ id });
   ```

2. **Auth**: Add JWT middleware to protect config routes

3. **CDN**: Host GLB models and textures on S3/CloudFront

4. **Deployment**:
   - Frontend: Vercel (just `npm run build`, connect repo)
   - Backend: Railway or Render (free tier available)

## Interview Talking Points

- **Separation of concerns**: Three.js in `SceneManager`, state in Zustand, UI in React, logic in services
- **Real-time price engine**: pure function, volume-based, modular rates
- **Save & Share**: REST API + localStorage fallback, URL-driven state restore
- **PBR materials**: texture maps (color, roughness, normal) + HDRI environment
- **Performance**: SceneManager never re-renders React, Zustand selectors prevent unnecessary updates
