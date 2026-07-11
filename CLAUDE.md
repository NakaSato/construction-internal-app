# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Solar construction project-management SPA. React 19 + TypeScript + Vite, styled with **both MUI v7 and Tailwind CSS v4** (MUI provides the theme/components; Tailwind overrides via `StyledEngineProvider injectFirst` in `src/main.tsx`). Role-based auth (Admin/Manager/User/Viewer), real-time updates (socket.io), PDF report generation, maps (leaflet), OCR (tesseract).

## Runtime & Commands

**Bun is the runtime and package manager** — every script is `bun --bun <tool>`. Never suggest npm/yarn/pnpm.

```bash
bun install
bun run dev            # vite dev server, port 3000, host exposed
bun run build          # production build to dist/
bun run preview
bun run test           # vitest watch
bun run test:run       # vitest single run
bun run test:run src/shared/api/modules/__tests__/authApi.test.ts   # single file
bun run type-check     # tsc --noEmit
bun run lint           # eslint, tolerates up to 50 warnings
bun run lint:strict    # eslint, --max-warnings 0
bun run build:analyze  # ANALYZE=true → dist/stats.html bundle report
```

Test setup lives in `src/test/setup.ts` (imports `@testing-library/jest-dom`, RTL `cleanup` after each test), wired via `vitest.config.ts` `setupFiles`.

Note the **copilot instructions** (`.github/copilot-instructions.md`) reference a Rolldown multi-build system (`vite.config.rolldown.ts`, `dev:rolldown`, `BUILD_TARGET`) and React 18 — none of that exists in the current code. Treat that file as partly stale; this CLAUDE.md reflects actual state.

## Architecture

Feature-based layout with import aliases defined in **both** `vite.config.ts` and `tsconfig.json` (keep them in sync when adding aliases): `@/`, `@components`, `@features`, `@shared`, `@pages`, `@widgets`, `@lib`, `@utils`, `@types`, `@api`, `@hooks`.

```
src/
├── main.tsx            # bootstrap: MUI ThemeProvider + Tailwind, mounts App
├── app/                # App.tsx (ErrorBoundary + AuthProvider), AppRoutes.tsx, LazyPages.tsx
├── features/           # auth, projects, dashboard, reports, analytics, charts
├── pages/              # route targets (auth/, core/, projects/, reports/)
├── components/         # ui/, layout/, feedback/ — reusable presentational
├── widgets/            # complex composite UI (Navigation, ApiStatus)
└── shared/
    ├── api/            # modular API layer (see below)
    ├── config/env.ts   # single source for VITE_API_BASE_URL / VITE_ENV
    ├── contexts/       # AuthContext, DashboardContext
    ├── hooks/          # useAuth, useProjects, useProjectManagement (large domain hooks)
    ├── utils/          # apiClient, authService, projectsApi, progressCalculation, ...
    └── types/          # TS interfaces
```

### API layer — two coexisting styles

There are two API surfaces; know which you're touching:

- **Modular (preferred, newer)**: `src/shared/api/solarProjectApiRefactored.ts` exposes a `SolarProjectApi` class composing domain modules from `src/shared/api/modules/` (`auth`, `projects`, `dailyReports`, `utility`). Singleton exported as `solarProjectApi`. All modules share one `ApiClient` instance.
- **Legacy monolith**: `src/shared/api/solarProjectApi.ts` and the flat `src/shared/utils/projectsApi.ts` (`ProjectsApiService`, 26KB). Still imported in places.

`src/shared/utils/apiClient.ts` (`ApiClient`) is the low-level fetch wrapper — base URL from `env.API_BASE_URL`, JSON headers. **Demo mode**: when `VITE_API_BASE_URL` is empty (production `.env.production`), the client runs with an empty base URL and no backend.

Barrels re-export widely: `src/shared/utils/index.ts`, `src/shared/api/index.ts`. Adding a util? Wire it into the barrel to match convention.

### Auth flow

`AuthProvider` (`src/shared/contexts/AuthContext.tsx`) wraps the app in `App.tsx`. `AppRoutes.tsx` uses React 19's `use()` to suspend on an `initializationPromise` from `useAuth()` during auth bootstrap. Consume auth via `useAuth()`; guard routes with `<ProtectedRoute>` from `src/features/auth/`. Tokens are managed in `authService.ts` (localStorage).

### Routing & code-splitting

`react-router-dom` v7 in `AppRoutes.tsx`. Heavy pages are lazy-loaded via `src/app/LazyPages.tsx` (each wraps `React.lazy` + `Suspense`). Add new heavy routes there, not inline.

### Build chunking

`vite.config.ts` manualChunks splits `vendor` (react), `router`, `ui` (framer-motion/toast), `pdf` (@react-pdf/renderer). Output uses hash-only filenames. `chunkSizeWarningLimit` raised to 1000 for the PDF lib.

## Conventions

- TypeScript only, functional components + hooks.
- Domain logic concentrates in large `shared/hooks/*` (e.g. `useProjectManagement.ts` ~22KB, `useDailyReports.ts` ~17KB) rather than in components — look there before adding project/report logic.
- API responses follow `{ success, message, data?, errors?, pagination? }` — check `response.success` before reading `data`.
- Progress/scheduling math lives in `src/shared/utils/progressCalculation.ts` and `solarProjectTemplate.ts` — reuse, don't reinvent.
