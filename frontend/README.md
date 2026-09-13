# Minuit — Frontend

Interface web de [Minuit](../README.md) : landing de présentation + tableau des séances de cinéma à Strasbourg.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 (thème `ink` / `amber` dans `src/index.css`)
- Motion (animations, respecte `prefers-reduced-motion`)
- React Router (lazy loading par page)
- Polices auto-hébergées via `@fontsource-variable/*`

## Développement

```sh
npm install
npm run dev        # http://localhost:5173 — /api proxyé vers localhost:3333
```

Le backend doit tourner (voir `../backend`). Aucune variable d'environnement nécessaire en dev.

## Build

```sh
npm run build      # sortie dans dist/
npm run preview
```

## Docker

`docker compose up` depuis la racine construit et sert le frontend via nginx sur le port 8080. Les requêtes `/api/*` sont proxyées vers le conteneur `backend`.

## Structure

```
src/
├── main.tsx              # routeur + polices
├── index.css             # tokens de design, grain, marquee, skeletons
├── lib/api.ts            # client API typé (docs/API.md)
├── lib/utils.ts          # cn()
├── components/Layout.tsx # header sticky, footer
└── pages/
    ├── LandingPage.tsx   # hero, marquee salles, features, section API, CTA
    └── DashboardPage.tsx # sélecteur 7 jours, filtres salles, films, séances
```