# Project: Prediction Market Tools

## Architecture
This is a pnpm monorepo (Turborepo) with the following packages:

- `packages/shared` - Shared TypeScript types and utilities
- `packages/web` - Next.js 15 (App Router) frontend
- `packages/server` - Python backend (placeholder for now)

## Design Documents
- `docs/plans/2026-03-17--system-design.md` - Backend system design
- `docs/plans/2026-03-17--frontend-design.md` - Frontend design (MUST READ for UI work)

## Tech Stack (Frontend)
- Next.js 15 with App Router
- TypeScript strict mode
- Tailwind CSS + shadcn/ui
- Framer Motion for animations
- Recharts for charts
- Zustand for state
- TanStack Query for data fetching
- MSW for mock data (V1)

## Style
- Dark Glassmorphism theme (see frontend design doc for exact tokens)
- Color: Deep space blue-black (#0A0E1A) + Purple (#8B5CF6) + Gold (#F59E0B) + Cyan (#06B6D4)
- Glass cards with backdrop-blur
- JetBrains Mono for data/numbers, Inter for body, Space Grotesk for display

## Rules
- All mock data must feel realistic (real prediction market names, reasonable prices)
- Every component must handle loading/error/empty states
- Mobile responsive required
