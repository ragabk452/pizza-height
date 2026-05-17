# 🍕 Pizza Height

> **Elevate Your Taste** — A luxury pizza ordering platform built as a portfolio showcase.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-22%20LTS-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![NestJS](https://img.shields.io/badge/NestJS-11-red)

---

## 🎯 About

**Pizza Height** is a full-stack restaurant ordering platform showcasing modern web development practices. Built as a portfolio piece, it features a luxurious dark aesthetic, smooth animations, and a complete ordering flow from menu browsing to kitchen display.

## ✨ Tech Stack

### Frontend
- **Next.js 16** (App Router + Turbopack) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first config)
- **Framer Motion** (animations) + **Radix Slot** + **Vaul** (drawers) + **Sonner** (toasts)
- **Zustand** (state, with localStorage persist) + **TanStack Query** (data fetching)
- **lucide-react** (icons; brand icons supplied as inline SVG)

### Backend
- **NestJS 11** + **Prisma 6** + **PostgreSQL 17**
- **Redis** (planned: cache + pub/sub) + **Socket.io** (realtime broadcasts)
- **JWT** (access + refresh tokens) + **bcrypt** (12 rounds)
- **Helmet**, **Throttler**, **nestjs-pino** (logging), **Swagger** (OpenAPI docs)

### DevOps
- **Turborepo** (monorepo) + **pnpm** workspaces
- **Docker Compose** (local Postgres + Redis)
- **Husky** + **lint-staged** + **commitlint** (conventional commits)

---

## 📁 Project Structure

```
pizza-height/
├── apps/
│   ├── web/          # Customer-facing site (Next.js, port 3000)
│   ├── admin/        # Admin dashboard (Next.js, port 3001)
│   └── api/          # Backend API (NestJS, port 4000)
├── packages/
│   ├── ui/           # Shared React components
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared configs (Tailwind, TS)
├── docker-compose.yml
└── turbo.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 22 LTS (`nvm install --lts=jod`)
- **pnpm** 11+ (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Docker Desktop** (for PostgreSQL + Redis)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/admin/.env.example apps/admin/.env

# 3. Start PostgreSQL + Redis
pnpm docker:up

# 4. Run all apps in development
pnpm dev
```

Then open:
- 🌐 Customer site: http://localhost:3000
- 👨‍💼 Admin dashboard: http://localhost:3001
- ⚙️ API: http://localhost:4000/api/v1

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Lint all apps |
| `pnpm type-check` | Type-check all apps |
| `pnpm test` | Run tests across all apps |
| `pnpm format` | Format code with Prettier |
| `pnpm docker:up` | Start PostgreSQL + Redis |
| `pnpm docker:down` | Stop containers |

---

## 🎨 Design System

**Palette: Modern Luxe**

| Token | Color | Hex |
|-------|-------|-----|
| Background | ⬛ Almost Black | `#1C1917` |
| Primary | 🟡 Antique Gold | `#C9A961` |
| Text | 🤍 Pure Cream | `#FAFAF9` |
| Accent | 🟠 Burnt Sienna | `#B8431F` |
| Surface | ⬛ Warm Charcoal | `#292524` |

**Typography**: DM Serif Display (headlines) + Manrope (body) + Cairo (Arabic)

---

## 📋 Roadmap

See [restaurant-ordering-project-plan.md](./restaurant-ordering-project-plan.md) for the full 9-sprint plan.

### Future Features
- 📱 Mobile App (React Native)
- 🚚 Driver App + Live Tracking
- 🎁 Loyalty Program + Gift Cards
- 🤖 AI-powered Recommendations
- 🏪 Multi-branch Management

---

## 📄 License

MIT
