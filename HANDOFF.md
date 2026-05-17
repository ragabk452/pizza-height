# 🍕 Pizza Height — Project Handoff

> **هذا الملف هو نقطة البداية لأي شات جديد لإكمال المشروع.**
> اقرأه بالكامل قبل الكتابة، ثم ابدأ من قسم "🚀 الخطوة التالية".

---

## 1. السياق

**اسم المشروع:** Pizza Height (بيتزا هايت)
**النوع:** مشروع Portfolio — مش لمطعم حقيقي. الهدف يبهر مراجعي الـ Portfolio في 30 ثانية.
**المالك:** Ragab Mostafa (`ragabk452@gmail.com`)
**المسار:** `/Users/ragab1512/Documents/KAREEM/مبرمج/Requests/`
**اللغة الأساسية للمحادثة:** عربي (مع كود إنجليزي).

### الهوية البصرية (Modern Luxe Palette)
| Token | HEX | الاستخدام |
|-------|-----|-----------|
| Background | `#1C1917` | خلفية رئيسية |
| Primary | `#C9A961` | Gold للـ CTAs |
| Text | `#FAFAF9` | نصوص فاتحة |
| Accent | `#B8431F` | Burnt Sienna (spicy badges) |
| Surface | `#292524` | Cards |

**Typography:** DM Serif Display (عناوين) + Manrope (نصوص) + Cairo (عربي)
**Dark Mode:** افتراضي (الـ light mode موجود كـ class fallback)

---

## 2. تفضيلات المستخدم المهمة

1. **يجب أخذ الإذن قبل بدء كل Sprint** — لا تنتقل تلقائياً من Sprint لـ Sprint.
2. **التركيز على "البريق البصري"** — أنيميشن، gradients، 3D، glassmorphism. الـ wow factor أهم من feature count.
3. **مشروع تجريبي** — استخدم بيانات وهمية، sandbox Paymob, mock SMS. لا حسابات حقيقية.
4. **عند كتابة JSON/config يحددها المستخدم بنصه**: اكتب بالظبط ما طلب، لا تضف fields لم يطلبها.
5. **عند فحص URLs أو images:** الـ HTTP 200 وحده مش كافي — افحص الـ content-type وارجاع content حقيقي.

---

## 3. الـ Stack المثبت

### Monorepo (Turborepo + pnpm workspaces)
```
apps/
  web/    # Next.js 16 — Customer site (port 3000)
  admin/  # Next.js 16 — Admin dashboard (port 3001)
  api/    # NestJS 11 — Backend API (port 4000)
packages/
  ui/     # Shared React components (stub)
  types/  # Shared TypeScript types (enums)
  config/ # Tailwind tokens + TS configs
```

### Versions الفعلية المثبتة
- **Node.js:** v22.22.3 (LTS via nvm `lts/jod`)
- **pnpm:** 11.1.2
- **Docker:** 29.4.1 (PostgreSQL 17 + Redis 7 via compose)
- **Next.js:** 16.2.6 (App Router + Turbopack + React 19.2.4)
- **NestJS:** 11
- **Prisma:** 6.19.3 (⚠️ Prisma 7 له breaking changes، لا تترقّى)
- **Tailwind:** v4 (CSS-first config في `globals.css`)

### Web app dependencies
- framer-motion, next-themes, lucide-react (v1.x — **لا يحتوي brand icons**)
- @tanstack/react-query + devtools
- zustand (مع persist middleware)
- vaul (drawers)
- sonner (toasts)
- @radix-ui/react-slot, class-variance-authority

### API dependencies
- @prisma/client + @nestjs/{config,jwt,passport,swagger,throttler,websockets}
- bcrypt(12), class-validator + class-transformer
- helmet, cookie-parser, socket.io
- nestjs-pino + pino-pretty
- cloudinary (configured to no-op without credentials)

---

## 4. الـ Sprints المنجزة (0 → 10) — المشروع LIVE 🎉

> الـ Sprints 0→3 ملخصها هنا. Sprints 4→10 details + post-sprint audits في **قسم 5**.

**Live URLs:**
- 🌐 Web: https://pizza-height.vercel.app
- 👨‍💼 Admin: https://pizza-height-admin.vercel.app
- ⚙️ API: https://api-production-d421.up.railway.app (Swagger at `/api/docs`)

### ✅ Sprint 0 — Setup & Foundation
- Turborepo monorepo (Mono-repo اختياره)
- Next.js apps + NestJS API + 3 shared packages
- docker-compose.yml (Postgres + Redis مع healthcheck)
- ESLint, Prettier, Husky (pre-commit + commit-msg)
- Conventional commits via commitlint
- Git init + first commit

### ✅ Sprint 1 — Design System & Hero
- Modern Luxe palette في `apps/web/src/app/globals.css`
- Fonts via `next/font` (DM Serif + Manrope + Cairo)
- next-themes (Dark افتراضي)
- Custom utilities: `text-gradient-gold`, `bg-mesh-gold`, `glass`
- Animations: marquee, gradient-shift, float, shimmer
- Components: Navbar (glass on scroll), Hero (rotating ring + emoji), FeaturedItems (marquee), BentoCategories, Testimonials (3D tilt), CTA, Footer
- Button component (cva variants: default/outline/ghost/accent/link، 5 sizes)
- Inline SVG icons للـ Instagram/Twitter/Facebook (lucide v1 شال brands)

### ✅ Sprint 2 — Database & Backend Core
**Prisma Schema (17 models):**
- Users, Customers, Addresses
- Categories, MenuItems, ItemSizes, ModifierGroups, Modifiers
- Orders, OrderItems, OrderItemModifiers, OrderStatusHistory
- Payments, Coupons, CouponUsage, Reviews, Settings
- Soft delete (`deletedAt`) + audit fields على الجداول المهمة
- Indexes على FKs + slugs + statuses
- Decimal للأسعار + Json للـ settings

**Seed data (`apps/api/prisma/seed.ts`):**
- 6 categories, 26 menu items (10 pizzas + 16 sides)
- 40 sizes (S/M/L/XL لكل بيتزا)
- 20 modifier groups + 100 modifiers (Crust + Extra Toppings)
- 3 staff users، 3 customers، 5 coupons
- 8 settings (VAT 14%, min order $15, working hours JSON)
- صور Unsplash CDN (موثوقة، لا rate-limits)

**API modules:**
- `AuthModule` — JWT access + refresh (secrets منفصلة)، bcrypt(12)، staff login (email) + customer login (phone)
- `PrismaModule` (global) — مع override لـ `Decimal.prototype.toJSON` (لكن استبدلناه بـ interceptor لاحقاً)
- `CategoriesModule` — CRUD، public reads، Admin/Manager writes
- `MenuItemsModule` — filters (category/popular/search)، sizes + modifiers في الـ detail endpoint
- `SettingsModule` — key-value، public reads
- `UploadModule` — Cloudinary (يـ no-op بدون credentials)
- `HealthModule` — `/health` مع DB ping
- `RealtimeModule` (global) — Socket.io gateway على namespace `/realtime` (placeholder لـ Sprint 4)

**Cross-cutting (في `main.ts`):**
- Helmet + CORS whitelist
- ValidationPipe (whitelist + forbidNonWhitelisted + transform)
- ClassSerializerInterceptor + **DecimalToNumberInterceptor** (يحول كل Decimal لـ number recursively)
- AllExceptionsFilter موحد
- Swagger UI على `/api/docs` (38 operations across 11 tags as of Sprint 7)
- nestjs-pino logger (pino-pretty في dev)
- Throttler (100 req/min default)
- JwtAuthGuard كـ APP_GUARD (مع `@Public()` decorator)
- RolesGuard مع `@Roles(UserRole.ADMIN, ...)` decorator

### ✅ Sprint 3 — Menu & Cart Experience
**Frontend infra:**
- `lib/api.ts` — fetch wrapper مع ApiError + query builder
- `lib/api-types.ts` — mirror لـ Prisma models
- `hooks/use-menu.ts` — TanStack Query hooks (useCategories, useMenuItems, useMenuItem, useSettings)
- `components/providers/query-provider.tsx` + Devtools في dev

**State (Zustand):**
- `store/cart-store.ts` — `useCartStore` بـ localStorage persist (مفتاح `pizza-height-cart`). Line-ID نظام (نفس البيتزا بـ modifiers مختلفة = lines منفصلة)
- `store/ui-store.ts` — `cartOpen`, `detailsItemSlug` للـ drawers

**Pages + Components:**
- `/menu` page — categories sticky tabs (Framer Motion layoutId)، debounced search (250ms)، responsive grid، skeleton + empty + error states
- `ItemCard` — image zoom on hover، dietary badges (Popular/Spicy/Vegan/etc)، sold-out treatment
- `ItemDetailsDrawer` (Vaul) — size picker، modifier groups (single/multi)، quantity، notes، live total، toast confirmation
- `CartDrawer` (Vaul) — items list (animated)، VAT/delivery breakdown، min-order indicator، checkout placeholder
- `Navbar` — cart count badge بـ live updates، links لـ `/menu`
- Hero/CTA/Bento بيلوكوا لـ `/menu`

---

## 5. الـ Bugs المكتشفة والمصلحة + Sprint summaries

> الجدول الأول = bugs من Sprints 0→3. تحته = sprint-by-sprint summaries (Sprint 4→7) + post-sprint audit fixes (Sprint 4, 5, 6).

| # | الـ Bug | الحل |
|---|---------|------|
| 1 | Sprint 0: lint عام في api/main.ts (no-floating-promises) | `void bootstrap()` |
| 2 | Sprint 0: packages/ui بدون eslint مثبت | استبدلت script بـ no-op placeholder |
| 3 | Sprint 1: `&apos;` حرفي في testimonials JS string | استخدام double-quoted string |
| 4 | Sprint 1: pizza emoji 16rem كبير على mobile | responsive: `text-[8rem] sm:text-[12rem] lg:text-[16rem]` |
| 5 | Sprint 1: lucide-react v1 شال Instagram/Twitter/Facebook | inline SVGs مكانهم |
| 6 | Sprint 1: `<a href="/">` بدل `<Link>` للـ logo | استبدلت بـ next/link |
| 7 | Sprint 2: Prisma 7 schema breaking (url في schema) | Downgrade لـ Prisma 6 |
| 8 | Sprint 2: JWT `expiresIn` type strict | cast as `number` |
| 9 | Sprint 2: Interface types ليست exported | export AuthTokens & UploadResult |
| 10 | Sprint 2: Build output في dist/src/ بدل dist/ | أضفت `rootDir: ./src` |
| 11 | Sprint 2: `baseUrl` deprecated في TS 6 | حذفته |
| 12 | Sprint 2: Decimal serialization قبيح | DecimalToNumberInterceptor (recursive) |
| 13 | Sprint 2: Unsafe access في current-user.decorator | typed `Request & { user }` |
| 14 | Sprint 3: Type mismatch في useMenuItems query | cast as Record<string, ...> |
| 15 | Sprint 3: setState in effect في SearchBar | شلت useEffect غير الضروري |
| 16 | Sprint 3: setState in effect في ItemDetailsDrawer | استخدمت `key={slug}` للـ remount + derived state |
| 17 | Sprint 3: Cart totals stale لما items تتغير | حذفت `useMemo(() => totals(), [totals])`، حسبت inline من `[items, vatPercent, deliveryFee]` |
| 18 | Image fix: arbitrary Unsplash IDs (garlic bread = portrait) | استبدلت IDs المعروف خطأها + غيرت affogato (كان duplicate لـ bbq) |
| 19 | Audit: `/menu-items?category=fake` رجع كل الـ 26 item | short-circuit `return []` لو category مش موجودة |
| 20 | **Browser fix:** "This page couldn't load" بعد ما `.env` تم إنشاؤه بعد الـ build | `rm -rf .next && pnpm build` — Next.js bakes NEXT_PUBLIC_* at build time |

**Sprint 10 — Production Deploy to Vercel + Railway (2026-05-18):**
- **Railway project `pizza-height`** (region: us-west, Metal builder) hosts:
  - `api` service — NestJS API at https://api-production-d421.up.railway.app (Dockerfile build, internal port 4000).
  - `Postgres` — managed plugin, exposed to `api` via `${{Postgres.DATABASE_URL}}` reference variable. `prisma migrate deploy` runs on every container start (Dockerfile CMD); seeded once from local machine over the public connection string.
  - `Redis` — managed plugin, exposed via `${{Redis.REDIS_URL}}`. Not actively used yet (Socket.io is in-process), but wired so future pub/sub work has it ready.
  - Env vars set on `api`: `NODE_ENV=production`, `PORT=4000`, `JWT_SECRET` + `JWT_REFRESH_SECRET` (`openssl rand -base64 64`), `JWT_ACCESS_EXPIRY=15m`, `JWT_REFRESH_EXPIRY=7d`, `DATABASE_URL`/`REDIS_URL` reference vars, `CORS_ORIGINS=https://pizza-height.vercel.app,https://pizza-height-admin.vercel.app`, `PAYMOB_MOCK_BASE_URL=https://pizza-height.vercel.app`.
  - Project link lives at the **monorepo root** (not `apps/api`) so the Dockerfile build context is the whole tree — `pnpm-workspace.yaml`, `packages/`, and `apps/api/` are all required by the Dockerfile.
  - The root `railway.toml` declares `dockerfilePath = "apps/api/Dockerfile"`.
- **Vercel — 2 projects:**
  - `pizza-height` (web) — root directory `apps/web`, framework Next.js, region fra1. Env: `NEXT_PUBLIC_API_URL=https://api-production-d421.up.railway.app/api/v1`, `NEXT_PUBLIC_WS_URL=https://api-production-d421.up.railway.app`, `NEXT_PUBLIC_APP_URL=https://pizza-height.vercel.app`.
  - `pizza-height-admin` — root directory `apps/admin`, framework Next.js, region fra1. Env: same `NEXT_PUBLIC_API_URL` + `NEXT_PUBLIC_WS_URL` as web; admin doesn't need `NEXT_PUBLIC_APP_URL`.
  - Both deployed via `vercel deploy --prod --yes` from the monorepo root (the `.vercel/project.json` is moved between deploys since one `rootDirectory` setting per project means the link can only point at one project at a time).
- **Dockerfile fixes for Railway's Metal builder:** dropped the `--mount=type=cache,id=pnpm,...` annotation — Metal rejects unscoped `id=` and requires an `s/<cacheKey>/...` prefix that doesn't transfer back to local Docker BuildKit. Plain install costs ~30s extra per build, not worth the maintenance burden.
- **Vercel project setup gotcha:** `vercel link` from `apps/web` creates a link but doesn't set the project's `rootDirectory` field server-side. Without it, Vercel runs the build from the upload root (the tarball was apps/web alone) and the `cd ../..` in `vercel.json`'s buildCommand exits the tarball → "No Next.js version detected" error. Fix: PATCH `rootDirectory = apps/web` (or `apps/admin`) on the Vercel project via the API, then move `.vercel/` to the monorepo root and deploy from there so the upload context is the whole monorepo. Same fix for admin.
- **Verified live (every layer):**
  - Web: all 9 routes (`/`, `/menu`, `/login`, `/register`, `/checkout`, `/orders`, `/payment/mock`, `/sitemap.xml`, `/robots.txt`) return 200. JSON-LD `@id` URLs all start with `https://pizza-height.vercel.app/` (the `site-url.ts` fail-fast worked — `NEXT_PUBLIC_APP_URL` was set in Vercel before the build). `/menu` page contains all 26 `MenuItem` JSON-LD nodes from the production API.
  - Admin: all 8 routes return 200, including chrome-less `/kds`.
  - API: `/api/v1/health` → 200, `/api/docs` Swagger UI loads, all CORS headers correct (`pizza-height.vercel.app` + `pizza-height-admin.vercel.app` allowed; `evil.com` rejected — no allow-origin header).
  - First production order: `PH-2026-0001` placed by Layla Hassan via the live API with proper modifier validation, total $27.36, payment CASH/PENDING. Customer login works, staff login works, admin stats endpoint works.

**Sprint 9 — Admin completionist: Menu CRUD + Settings editor + Customer drawer (2026-05-17):**
- **Backend (nested MenuItem CRUD):**
  - `CreateMenuItemDto` + `UpdateMenuItemDto` now accept optional `sizes?: SizeDto[]` + `modifierGroups?: ModifierGroupDto[]` (each group nests its own `modifiers[]`). Class-validator + class-transformer drive the nested validation.
  - `MenuItemsService.create` + `.update` wrap the writes in a Prisma `$transaction`. On update, sizes and modifier groups are **replaced** atomically (delete-then-create) — keeps the admin UI dead simple. `OrderItemModifier` FK is `Restrict`, so deleting a modifier referenced by past orders throws `P2003` → caught and returned as `BadRequestException` with a friendly "toggle isAvailable instead" message.
  - Categories CRUD already existed (POST/PATCH/DELETE under `@Roles(ADMIN, MANAGER)`, DELETE soft-deletes). No backend changes needed there.
  - Settings: existing `PUT /settings/:key` (accepts `{ value: unknown }`) is used as-is. Per-key validation happens client-side in the admin (server stays permissive).
- **Admin app — hooks (`use-admin-data.ts`):**
  - New mutations: `useCreateCategory`, `useUpdateCategory`, `useDeleteCategory`, `useCreateMenuItem`, `useUpdateMenuItem`, `useDeleteMenuItem`, `useToggleMenuItemAvailability`, `useUpdateSetting`. All invalidate the relevant query keys on success.
  - New query: `useAdminMenuItem(slugOrId)` for the edit drawer's full detail load.
  - `useAdminCategories` now passes `includeInactive: true` so admins can see/restore soft-deleted categories (the public catalogs filter them out themselves).
- **Admin app — new types (`api-types.ts`):** added `ItemSize`, `Modifier`, `ModifierGroup`, `SizePayload`, `ModifierPayload`, `ModifierGroupPayload`, `MenuItemCreatePayload`, `MenuItemUpdatePayload`, `CategoryCreatePayload`, `CategoryUpdatePayload`. Existing `MenuItem` interface extended with optional `sizes` + `modifierGroups`.
- **Admin app — UI:**
  - `components/ui/confirm-dialog.tsx` — shared centered-modal confirm built on Vaul (focus trap + scroll lock + ESC handled for free). Used by both deletes in `/menu`.
  - `components/menu/category-drawer.tsx` — luxe right-side drawer with name/slug (auto-slugify), description, image URL, sort order, visibility toggle. Outer wrapper owns the `Drawer.Root`; inner `CategoryForm` is rekey'd to `category?.id ?? 'new'` so each (re)open gets fresh `useState` init — no setState-in-effect.
  - `components/menu/menu-item-drawer.tsx` — two-stage drawer: outer wraps `Drawer.Root`, `MenuItemLoader` fetches detail when editing then renders `MenuItemForm` with `initial` derived from props. Form covers scalar fields + tag toggles + **inline sizes editor** (move up/down, set-default, delete) + **inline modifier-groups editor** (each group has name + required + min/max + nested modifiers with `isAvailable` toggle + remove).
  - `components/customers/customer-detail-drawer.tsx` — right-side drawer over the customer list: avatar + verified phone/email + lifetime spend + order count + saved addresses + last-25 non-cancelled orders. Clicking a row routes to `/orders?id=<orderId>` so the existing OrderDetailDrawer picks it up.
  - `app/(protected)/menu/page.tsx` — full rewrite. Per-category sections with "+ Item" inline, sold-out toggle pill on each card, edit/delete pencil/trash. Empty-state CTA when no categories exist. Confirmations route through `ConfirmDialog`.
  - `app/(protected)/settings/page.tsx` — full rewrite. Hand-curated allowlist (`DEFS`) of editable keys with per-field type (`string` / `number` / `percent` / `currency` / `workingHours`) and per-key validator (VAT/service-charge 0–100, currency = 3-letter uppercase, min order ≥ 0, working hours = JSON shape `{day: {open, close}}`). Inline edit/save/cancel per row. Anything in the API response not in the allowlist surfaces in a read-only "Other settings" section. Editor component rekey'd to value+key so each edit gets fresh `useState` init.
  - `app/(protected)/customers/page.tsx` — rows are now full-width buttons that open the new drawer.
- **Sprint 7 leftover lint fix:** `MockPaymobClient.createSession` had `async` with no `await`. Dropped `async` + wrapped return in `Promise.resolve` — same interface shape, lint passes.
- **Verified end-to-end** (servers restarted on Sprint 9 builds):
  - API smoke: login → create category → create menu item with 2 sizes + 1 modifier group (2 modifiers) → PATCH item with 3 sizes (sizes correctly replaced, default size moved) → toggle availability OFF then ON → update setting → fetch customer detail → cleanup (DELETE returns 204).
  - Role guards: KITCHEN can toggle availability (allowed) but `DELETE /menu-items/:id` returns 403, and `POST /categories` returns 403.
  - Admin pages all return 200: `/`, `/menu`, `/settings`, `/customers`, `/login`.
  - Type-check + lint + build clean on all 3 apps.

**Sprint 8 — Polish + SEO + Deploy-readiness (2026-05-17):**
- **SEO foundation:**
  - `apps/web/src/components/seo/json-ld.tsx` — server-component `<script type="application/ld+json">` builder. Exports `RestaurantJsonLd`, `OrganizationJsonLd`, `WebsiteJsonLd` (mounted in root layout), `MenuJsonLd` + `BreadcrumbJsonLd` (mounted in `/menu/layout.tsx`).
  - `apps/web/src/app/menu/layout.tsx` — new server component that wraps the existing client `page.tsx`, server-fetches categories + items from API with `next: { revalidate: 3600 }`, and renders a full schema.org `Menu` with 6 `MenuSection`s + 26 `MenuItem`s + 26 `Offer`s. Falls back gracefully (no MenuJsonLd) if API unreachable.
  - `apps/web/src/app/sitemap.ts` + `apps/web/src/app/robots.ts` — Next.js convention routes. Sitemap lists public pages (/, /menu, /login, /register). Robots allows /, disallows authed routes (/checkout, /order/, /orders, /payment/, /api/).
  - `apps/admin/src/app/robots.ts` — disallows everything (admin must not be indexed).
  - Root `apps/web/src/app/layout.tsx` metadata expanded: `alternates.languages` (en-US + ar-EG), `openGraph.images` (1200×630 reference to `/og-image.png`), `twitter.creator`, `robots.googleBot`, `formatDetection`, full `keywords` list.
- **A11y improvements:**
  - Skip-to-content link in root layout (hidden until focused, jumps to `#main-content`).
  - Every page-level `<main>` now has `id="main-content"` (web home, menu, checkout, orders, order/[id], order/success, order/cancelled, payment/mock, AuthShell for /login + /register).
  - `globals.css`: `@media (prefers-reduced-motion: reduce)` global override — animations/transitions/scroll-behavior all cut to 0.01ms when the OS preference is set.
  - Navbar: `role="banner"` on header, `aria-label="Primary"` / `"Mobile"` on the two `<nav>`s, `aria-expanded` + `aria-controls` on the mobile menu toggle, icons inside buttons marked `aria-hidden`, cart badge is `aria-hidden` (count is announced via the button label instead — fixes redundant SR reading).
- **Performance:**
  - `apps/web/next.config.ts` + `apps/admin/next.config.ts` — bundle analyzer (gated by `ANALYZE=true`), `images.remotePatterns` allowlist (Unsplash + Cloudinary), AVIF/WebP formats, `experimental.optimizePackageImports` for `lucide-react`, `framer-motion`, `sonner`, security headers (X-Frame-Options, Referrer-Policy, Permissions-Policy on web; +X-Robots-Tag on admin).
  - `pnpm --filter @pizza-height/{web,admin} analyze` opens an interactive treemap.
- **Production hardening (API):**
  - `main.ts` helmet: `contentSecurityPolicy: false` → explicit directives that still let Swagger work (`unsafe-inline`/`unsafe-eval` only for script/style — needed by the bundled Swagger UI). `crossOriginEmbedderPolicy: false`, `crossOriginResourcePolicy: 'cross-origin'`.
  - `AllExceptionsFilter`: non-`HttpException` errors no longer echo `error.message` / `error.name` to the client in production — only the generic `"Internal server error"` goes out. Stack traces still go to internal logger.
  - Auth controller: `@Throttle({ default: { limit: 5, ttl: 60_000 } })` on `/auth/staff/login`, `/auth/customer/login`, `/auth/customer/register`. `/auth/refresh` gets 20/min (legitimate auto-refresh on 401 was hitting the cap). Default elsewhere stays 100/min.
  - Payments: `@SkipThrottle()` on `/payments/webhook/paymob` — Paymob retries up to 10× with backoff and would otherwise hit the global limit.
  - `prisma:migrate:deploy` script added for the production container CMD.
- **Sprint 7 leftover bug fix:** `CreateSessionParams` interface didn't declare `merchantOrderId` even though both the service and mock client used it — `pnpm type-check` was failing. Added it to the interface (real `PaymobClient` ignores it).
- **Deploy-readiness:**
  - `apps/api/Dockerfile` (multi-stage: base → deps → build → runner; non-root user, tini PID 1, runs `prisma migrate deploy && node dist/main` as CMD). `apps/api/.dockerignore` keeps the build context small. **Important gotcha discovered + fixed:** pnpm's `apps/api/node_modules` is a tree of symlinks that point `../../../../node_modules/.pnpm/...` — so the runner stage MUST preserve the workspace-root `/repo/node_modules` *and* the apps/api one *and* the packages/ folder, otherwise every `require('@nestjs/...')` blows up with MODULE_NOT_FOUND. The runner image keeps the full `/repo/{node_modules,packages,apps/api,package.json,pnpm-workspace.yaml}` shape and runs from `/repo/apps/api`.
  - `apps/api/railway.toml` (Dockerfile builder + `/api/v1/health` healthcheck + ON_FAILURE restart policy with 5 retries).
  - `apps/web/vercel.json` + `apps/admin/vercel.json` (framework=nextjs, monorepo-aware install/build commands via Turborepo, `turbo-ignore` so a touch on API alone skips a frontend rebuild, fra1 region).
  - `apps/{web,admin,api}/.env.production.example` — full templates with notes (NEXT_PUBLIC_* baked at build, CORS_ORIGINS must be comma-separated, JWT secrets generated with `openssl rand -base64 64`).
  - README updated with full Vercel + Railway deploy instructions.
- **Verified live** (after restarting all three servers fresh against the new builds):
  - `/sitemap.xml` returns valid XML with 4 URLs; `/robots.txt` (web) allows `/`, disallows authed routes; `/robots.txt` (admin) disallows all.
  - Home page emits Restaurant/Organization/WebSite/PostalAddress/GeoCoordinates/OpeningHoursSpecification/SearchAction JSON-LD. Menu page adds BreadcrumbList + Menu + 6 MenuSection + 26 MenuItem + 26 Offer.
  - Helmet on `/health`: CSP set with explicit directives, X-Frame-Options=SAMEORIGIN, X-Content-Type-Options=nosniff. Web/admin: Permissions-Policy + Referrer-Policy + X-Robots-Tag (admin) set.
  - Auth throttle confirmed: 5 attempts → 400 (bad creds), 6th → 429. Categories 12/12 successful.
  - Webhook `SkipThrottle` confirmed: 10× POSTs → all 401 (HMAC fail), zero 429.
  - Error filter strips: 401 returns clean `{statusCode, message, error, ...}` JSON, no stack.
  - Docker image: `docker build -f apps/api/Dockerfile -t pizza-height-api .` completes; `docker run` loads `dist/main.js` cleanly, instantiates Nest, and fails fast on missing `DATABASE_URL` (the intended prod behavior — Railway sets it from the Postgres plugin).
- **Deferred to Sprint 9:** actual deploy (waiting on user's Vercel + Railway accounts), Admin Menu CRUD UI, Settings editor, Customer detail drawer.

**Sprint 7 — Payments (Paymob Sandbox + Mock) (2026-05-17):**
- Backend: new `PaymentsModule` with `PaymentProvider` interface + two implementations:
  - `PaymobClient` — real Paymob sandbox client (auth → register order → payment_key → iframe URL; HMAC-SHA512 webhook verification over Paymob's ordered field list).
  - `MockPaymobClient` — drop-in replacement that uses the web's `/payment/mock` page as the "iframe". Same `PaymentProvider` shape, HMAC-SHA512 over the JSON body so the verification code path is identical.
- Factory in `PaymentsModule` picks Real vs Mock based on `PAYMOB_API_KEY`/`INTEGRATION_ID`/`IFRAME_ID`/`HMAC_SECRET` being set AND none matching the `your_...` placeholder pattern. Default for portfolio is mock.
- New endpoints (3): `POST /payments/checkout-session/:orderId` (customer-auth, validates ownership + CARD method + not-already-PAID), `POST /payments/webhook/paymob` (public, raw-body HMAC-verified, idempotent), `POST /payments/mock/complete` (mock-only — signs a mock payload and feeds it through the real webhook handler).
- `main.ts` enables `rawBody: true` so the webhook handler can verify HMAC over the exact bytes the gateway sent.
- Webhook handler: finds Payment by stored `idempotencyKey` (with fallback to `merchantOrderRef`), updates Payment.status, advances Order.status (PENDING→CONFIRMED) on success, broadcasts realtime to `admin`/`kitchen`/`order:{id}` rooms. Replayed callbacks return `alreadyApplied`.
- Frontend (apps/web):
  - Checkout: CARD option enabled (was disabled with "Sprint 7" placeholder). After `placeOrder` succeeds, calls `useCreateCheckoutSession` then `window.location.href = session.iframeUrl`.
  - `/payment/mock` page — gold-bordered "Pizza Height" mock gateway with cardholder/number/exp/cvc pre-filled, `Pay {amount}` + "Cancel and decline" buttons. Sandbox banner discloses mock mode prominently.
  - `/order/cancelled` — luxe failure page for CARD declines, cart stays for retry.
  - `/order/success` — accepts `?id=` or `?orderNumber=` (Paymob echoes the latter). Shows "Almost there — Confirming payment…" while `payment.status === 'PENDING' && method !== 'CASH'`. Polls `/orders/:id` every 2s until PAID. Confetti gated on payment confirmation.
- `.env.example` updated: `PAYMOB_*` moved out of "Planned", documented as optional (blank → mock), new `PAYMOB_MOCK_BASE_URL`.
- Verified 19/19 flows in Puppeteer + real Chrome: mock provider auto-detection, mock page render, full CARD success flow (PENDING→PAID via webhook → order CONFIRMED), success page polls + flips, CARD failure path preserves order for retry, HMAC tampering → 401, idempotency (replay → alreadyApplied), cross-customer auth (Sara → 403 on Layla's order), CARD UI enabled, plus 8 regression checks for Sprints 0-6.

**Sprint 6 — Kitchen Display System (2026-05-17):**
- Backend: new `GET /orders/kds/board` endpoint returning active orders (PENDING/CONFIRMED/PREPARING/READY) sorted by `estimatedReadyAt` asc with nulls last. Capped at 60. Gated to ADMIN/MANAGER/KITCHEN roles.
- Frontend (apps/admin): new `/kds` route OUTSIDE the `(protected)` route group — full-screen chrome-less view designed for kitchen tablets. Header bar has filter pills (All / New / Confirmed / Preparing / Ready), connection-status dot, audio chime toggle (Web Audio API, no audio file shipped), fullscreen button, and exit-X. Body is a responsive grid of `KdsCard`s.
- `KdsCard` — large-typography ticket with order-number suffix, type icon, elapsed-time counter (color-shifts at 10m/20m via `ElapsedTime`), highlighted customer note block, items with quantity+name big, modifiers + per-item notes underneath. One-tap action button advances the status (PENDING→CONFIRMED→PREPARING→READY→[OUT_FOR_DELIVERY|DELIVERED]).
- `useKdsRealtime` — dedicated hook that only joins the `kitchen` room (KITCHEN role can use it), invalidates the KDS feed on every event, fires `onNewOrder` callback for the chime.
- `Chime` component uses `useSyncExternalStore` for the mute preference (passes the React Compiler's set-state-in-effect rule), persists to localStorage with cross-tab sync via storage events. Web Audio API two-tone sine chime — no asset shipped.
- Sidebar gained a "Kitchen Display" link with `target="_blank"` so the kitchen tablet can keep its own window open.
- Verified 8/8 flows + 1 deliberate skip with Puppeteer + real Chrome (no DRIVER user seeded so the negative role test is API-only via `test 7`).

**Sprint 4 — Checkout & Orders + Customer Auth + Live Tracking (2026-05-17):**
- Backend: `OrdersModule` (POST /orders with server-side pricing snapshot + sequential PH-YYYY-NNNN orderNumber + status-transition guards), `AddressesModule` (customer-owned CRUD + default-handling), `CouponsModule` (POST /coupons/validate, customer-auth). `RealtimeGateway` broadcasts `order.created` to admin/kitchen rooms and `order.statusChanged` to per-order rooms; supports `join`/`leave` from browser.
- Frontend (apps/web): customer auth flow (Zustand `auth-store` with persist, `/login` + `/register` luxe two-pane shell, Bearer interceptor in `lib/api.ts` with promise-coalesced refresh-on-401), multi-step `/checkout` with Framer Motion transitions (type → address → payment → review), inline address creation, live coupon validation, sticky order summary. `/order/success` with deterministic confetti, `/order/[id]` tracking timeline subscribed to Socket.io for live status updates, `/orders` history list. Navbar profile dropdown + logout. CartDrawer hoisted to root layout.

**Sprint 5 — Admin Dashboard (2026-05-17):**
- Backend: `CustomersModule` (`GET /customers` + `/customers/:id` with order history), `OrdersService.stats()` exposed at `GET /orders/stats/today`, `RealtimeGateway.staff:join` (JWT-verified) for the `admin`/`kitchen` rooms. `JwtModule` wired into `RealtimeModule`.
- Frontend (`apps/admin`): replaced the create-next-app stub with a full admin console — Modern Luxe globals, persistent staff-auth-store, `/login` page, sidebar+topbar shell with auth-gated `ProtectedShell`, `/` dashboard (4 animated KPI cards + live recent-orders table + status breakdown bar chart), `/orders` (filter pills + live table with status pulse + vaul detail drawer with status-transition workflow + history timeline), `/menu` (read-only category-grouped item grid), `/customers` (debounced search + spend/order count), `/settings` (read-only key/value table). Realtime via `useStaffRealtime` subscribes to `admin`+`kitchen` rooms and toasts on new orders + invalidates caches.
- Verified end-to-end with Puppeteer + real Chrome: 9/9 flows pass.

**Post-Sprint-4 audit (2026-05-17) — additional fixes applied:**
- FREE_DELIVERY coupon no longer reduces the taxable subtotal (was undercharging VAT by ~$0.70 on $50 orders). `couponUsage.discountApplied` now records the actual customer savings (food discount + waived delivery fee).
- `OrderStatus` transitions now allow `CANCELLED` from `READY` and `OUT_FOR_DELIVERY` (real-ops scenarios like customer no-show or accident).
- Disabled (`isAvailable=false`) modifiers are now rejected with a 400 instead of silently dropped — was letting customers satisfy required groups with unavailable items.
- Soft-deleted or inactive categories block their items from being ordered.
- Order-number generator wraps the create call in try/catch on `Prisma.P2002` so concurrent inserts retry instead of 500.
- Realtime gateway: CORS uses `CORS_ORIGINS` (was `'*'`), staff rooms (`admin`/`kitchen`) refuse browser-side `join`, per-socket room cap = 20.
- `POST /coupons/validate` now requires customer auth so `firstOrderOnly` / `maxUsesPerCustomer` apply at preview time (was bypassing them via `@Public()`).
- JWT strategy rejects soft-deleted customers and staff.
- `JWT_SECRET` / `JWT_REFRESH_SECRET` / `DATABASE_URL` throw at boot when `NODE_ENV=production` (no more silent fallback to `'change-me-in-production'`).
- Frontend `useOrder` waits for auth-store rehydration → no more infinite-loader on hard-refresh of `/order/success` or `/order/[id]`.
- `useOrderTracking` reads `NEXT_PUBLIC_WS_URL`, drops the singleton socket on disconnect, and invalidates on remount (fixes stale status on back-nav).
- `tryRefresh` only clears auth on 401/403 — network blips no longer log the customer out mid-checkout.
- Cart store has a `hydrated` flag; navbar badge waits for hydration → no SSR/client cart-count mismatch.
- `OrderSummary` now mirrors the backend pricing model exactly: `serviceChargePercent` row + FREE_DELIVERY doesn't drop the taxable base.
- Checkout: cancelling the new-address form when no saved addresses exist steps back to "Type" instead of re-rendering the same form.
- Confetti unmounts after 5s (was leaving 80 invisible spans at `z-30` over the navbar).
- `item-details-drawer` treats `maxSelection===0` as "unlimited" (matches backend convention).
- `.gitignore` exception added for `apps/web/.env.example` + `apps/admin/.env.example` so fresh-clone setup actually works.
- `apps/api/src/modules/{customers,users,modifiers}/` empty dirs removed.
- `main.ts` uses `ConfigService` for CORS + port, drops 3 `console.log`s, registers Orders/Addresses/Coupons swagger tags.
- HANDOFF + README counts re-verified against current code.

**Post-Sprint-5 audit (2026-05-17):**
- Backend: customer `orderCount`+`lifetimeSpend`+embedded recent orders كلهم بقوا exclude CANCELLED بشكل consistent (كان list view بيـ count cancelled و detail aggregate مش بيـ count → نفس العميل بيظهر بـ counts مختلفة). `CustomersService.findOne` بقى `select` بدل `include` (defense in depth ضد passwordHash leak). `?limit=abc` بقى 400 بدل 500 (inline validation لأن global ValidationPipe's `enableImplicitConversion` كان بيـ silently converts NaN قبل ParseIntPipe).
- Admin: نقلت الصفحات المحمية لـ `(protected)` route group بـ single layout — Sidebar `layoutId` animation فعلاً اشتغل بعدها (كانت بتـ pop بدل ما تـ animate). `/orders` بقى `selectedId` derived من `?id=` directly (back/forward sync). `useStaffRealtime` + web `useOrderTracking`: شلت `sharedSocket = null` على disconnect (socket.io built-in reconnect بيـ handle الـ drop). `/customers` شلت الـ hover-lift لأن detail drawer مش متبني. `OrderDetailDrawer` Back+Cancel buttons gated by `transition.isPending`. `RecentOrdersTable` بقى status badges تـ pulse على active orders. Cleanup: شلت `recharts` dead dep + 5 SVGs من `apps/admin/public/` + create-next-app default README.

**Post-Sprint-6 audit (2026-05-17):**
- Backend: `OrdersService.fullInclude.payment` بقى whitelist (`id, amount, method, status, providerName, providerId, createdAt, updatedAt`) — defense in depth ضد Paymob's `providerPayload` leak لما Sprint 7 يـ populate it. `RealtimeGateway.staff:join` بقى يـ re-check `User.isActive` / `deletedAt` بعد JWT verify (deactivated staff بـ valid token كان يقدر يفضل snooping). `OrdersService.kdsBoard` cap بقى 200 بدل 60 + log warning لو الـ cap اتحقق. `OrdersController` reordered: `@Get(':id')` و `@Patch(':id/status')` لـ نهاية الـ controller (مش بـ accident).
- Admin: `useKdsBoard` `enabled` gated على الـ role + `retry: false` (DRIVER ما يـ pollute cache بـ 403). `ElapsedTime` initializes بـ 0 + `suppressHydrationWarning` + tick بقى كل 1s. `Chime.play()` بيـ call `ctx.resume()` (Chrome AudioContext suspended حتى أول gesture). Fullscreen probes `webkitRequestFullscreen` للـ iPad Safari. Sidebar external links: `rel="noopener noreferrer"`.

**Bonus: 3 turbo cache issues**
- `tsbuildinfo` كان بيخلي API build فاضي → API build script بقى `rm -rf dist tsconfig.build.tsbuildinfo && nest build`
- Outputs في turbo.json تتضمن `dist/**` (شلنا `*.tsbuildinfo`)

---

## 6. كيف تشغّل المشروع من الصفر

```bash
cd "/Users/ragab1512/Documents/KAREEM/مبرمج/Requests/"

# 1. Activate Node
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use --lts=jod

# 2. Install deps (لو لأول مرة)
pnpm install

# 3. Copy env files
cp -n .env.example .env
cp -n apps/api/.env.example apps/api/.env
cp -n apps/web/.env.example apps/web/.env
cp -n apps/admin/.env.example apps/admin/.env

# 4. Start Docker (Postgres + Redis)
pnpm docker:up

# 5. Migrate + seed (لو DB فاضية)
cd apps/api && pnpm prisma:migrate && pnpm prisma:seed && cd ../..

# 6. Build all
pnpm build

# 7. Run all
pnpm dev   # or start each separately:
# - cd apps/api && pnpm start (port 4000)
# - cd apps/web && NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1 pnpm start (port 3000)
# - cd apps/admin && pnpm start (port 3001)
```

### Login credentials (للاختبار)
**Staff:**
- `admin@pizzaheight.com / AdminPass2026!` — Marco Rossi (ADMIN)
- `kitchen@pizzaheight.com / KitchenPass2026!` — Giuseppe (KITCHEN)
- `manager@pizzaheight.com / AdminPass2026!` — Sofia (MANAGER)

**Customers:**
- `+201001112222 / DemoPass2026!` — Layla Hassan
- `+201112223333 / DemoPass2026!` — Sara Khalil
- `+201223334444 / DemoPass2026!` — Ahmed Farouk (بدون email)

### Test coupons
`WELCOME20` (20% first-order), `PIZZA10` ($10 off $50+), `FREEDELIVERY`, `LUXE15`, `WEEKEND`

---

## 7. ⚠️ Caveats / Gotchas مهمة

1. **بعد تعديل `.env` في Next.js apps: لازم rebuild.** `pnpm start` لا يقرأ env vars الجديدة — هي مدمجة في الـ build.
2. **Prisma 7 له breaking changes** — استمر في Prisma 6 (الـ schema بـ datasource.url مدعوم).
3. **lucide-react v1 شال brand icons** (Instagram/Twitter/Facebook). لو محتاجها استخدم inline SVG.
4. **Pollinations.ai free tier له rate limit 1 concurrent per IP** (HTTP 402). لا تستخدمها لـ batch image loads.
5. **API build script يحذف tsbuildinfo قبل nest build** — لازم تستمر هذا الـ pattern وإلا cache hits ترجع dist فاضي.
6. **Categories filter:** لو passed slug غير موجود → API يرجع `[]` (مش الـ 26 item).
7. **Cart totals:** تُحسب inline من `[items, vatPercent, deliveryFee]` — لا تستخدم `useMemo(() => totals(), [totals])` (function ref ثابت يخفي الـ updates).
8. **Husky hooks:** pre-commit يشغل lint-staged، commit-msg يشغل commitlint. لو commit فشل، انظر للسبب — لا تستخدم `--no-verify`.
9. **Husky + nvm:** الـ pre-commit hooks بتحتاج `pnpm` في الـ PATH. لو شغّلت `git commit` من shell مش loading nvm، الـ hook هيفشل. الحل: `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use --lts=jod` قبل `git commit`.
10. **Paymob mock vs real:** الـ `PaymentsModule` factory بيعتبر أي قيمة بـ prefix `your_` أو `replace_me` كـ placeholder → يستخدم `MockPaymobClient`. عشان تستخدم real Paymob sandbox، الأربع env vars (`PAYMOB_API_KEY` / `INTEGRATION_ID` / `IFRAME_ID` / `HMAC_SECRET`) لازم يكونوا بـ values حقيقية. لما تشغّل API هيـ log نوع الـ provider اللي اختاره.
11. **Mock payment page URL:** الـ MockPaymobClient بيـ build iframe URL بـ `PAYMOB_MOCK_BASE_URL` (default `http://localhost:3000`). لو غيّرت الـ web port غيّر القيمة دي.
12. **Webhook raw body:** `main.ts` بيـ enable `rawBody: true` عشان `/payments/webhook/paymob` يقدر يـ verify HMAC على exact bytes. أي middleware قبل الـ handler يـ re-serializes هيـ break الـ signature.
13. **Admin shell route group:** الصفحات المحمية في الأدمن (`/`, `/orders`, `/menu`, `/customers`, `/settings`) في `(protected)` route group بـ shared layout. الـ `/kds` و `/login` خارج الـ group لأنهم chrome-less. لما تضيف صفحة admin جديدة، حطها داخل `(protected)`.
14. **Realtime singleton socket:** كل من web (`use-order-tracking`) و admin (`use-staff-realtime`, `use-kds-realtime`) عنده module-level singleton للـ Socket.io connection. **مش بنـ null الـ singleton على disconnect** عشان socket.io built-in reconnection يـ keep نفس الـ instance — لو عملنا null هتفتح socket تاني والـ events هتـ fire مرتين.
15. **Dockerfile runner preserves /repo workspace shape:** الـ apps/api/Dockerfile runner stage بيـ copy الـ root `node_modules/`, `packages/`, و `apps/api/` بنفس الـ layout الـ workspace. ده **مش optional** — pnpm symlinks بـ resolve `../../../../node_modules/.pnpm/...` فلو شلت الـ root node_modules أو غيّرت الـ working directory تـ break كل الـ requires بـ MODULE_NOT_FOUND. أي تعديل على الـ Dockerfile لازم يحافظ على الـ /repo/{node_modules,packages,apps/api}/ structure والـ WORKDIR /repo/apps/api.
16. **Auth throttle = 5/min على login/register/staff-login + 20/min على refresh.** الـ rest على 100/min default. لو هتـ add endpoint جديد بـ credentials handling، حط `@Throttle({ default: { limit: 5, ttl: 60_000 } })` عليه. لو هتـ add endpoint بـ retry-friendly external trigger (webhook، callback)، حط `@SkipThrottle()`.
17. **AllExceptionsFilter في prod ميـ leak `error.message` من non-HttpException.** لو الـ user/customer يـ trigger 500 من unknown error، هيشوف `"Internal server error"` بس. الـ stack بـ logger فقط. لو هتـ throw business error واضح للـ customer، استخدم HttpException (Bad/Forbidden/Conflict/etc) — هتـ pass through clean.

---

## 8. Image URLs

كل الـ 26 menu item + 6 categories بيستخدموا Unsplash CDN URLs بصيغة:
```
https://images.unsplash.com/photo-<ID>?w=800&q=80&auto=format
```

الـ IDs موجودة في `apps/api/prisma/seed.ts` في `const IMG = { ... }`.

**عرف المستخدم لو شفت صورة لا تطابق المنتج** — استبدل الـ ID لـ ID Unsplash تاني (test أولاً: `curl -I "https://images.unsplash.com/photo-XXX"` لازم يرجع 200 + image/jpeg).

---

## 9. Git history الحالي (run `git log --oneline` for the live list)

20 commits على `main` كحد آخر تحديث. الأحدث منهم:

```
408c557 feat: Sprint 7 — Payments (Paymob Sandbox + Mock provider)
0e9efe7 fix: post-Sprint-6 audit — payment leak prophylactic, socket auth re-check, KDS polish
c96bb43 feat: Sprint 6 — Kitchen Display System (live, full-screen, one-tap)
043e625 fix: post-Sprint-5 audit — admin shell, socket lifecycle, customer metrics
1152706 docs: update HANDOFF.md for Sprint 5 completion + Sprint 6 next steps
b94a84c feat: Sprint 5 — Admin Dashboard (live orders, KPIs, status workflow)
4045cd8 fix(web): cart-hydration race in checkout + auth redirects on order pages
609ad8b fix: post-Sprint-4 audit — pricing, security, hydration, fresh-clone
902df56 feat: Sprint 4 - Checkout & Orders (Auth + Live Tracking)
fea650f docs: add HANDOFF.md for session continuity
```

Branch: `main` — لا توجد remotes (لسه ما تم push لـ GitHub).
الـ working tree نظيف عدا `.claude/settings.json` اللي بيتراكم automatically.

---

## 10. الـ Project Plan الكامل

موجود في `restaurant-ordering-project-plan.md` (548 سطر). يحتوي على 9 sprints مخطط لها:

- ✅ **Sprint 0** — Setup & Foundation
- ✅ **Sprint 1** — Design System & Hero ⭐ (القطعة الذهبية)
- ✅ **Sprint 2** — Database & Backend Core
- ✅ **Sprint 3** — Menu & Cart Experience
- ✅ **Sprint 4** — Checkout & Orders (Auth + Live Tracking)
- ✅ **Sprint 5** — Admin Dashboard (Live Orders + Status Workflow)
- ✅ **Sprint 6** — Kitchen Display System (KDS)
- ✅ **Sprint 7** — Payments Integration (Paymob Sandbox + Mock provider)
- ✅ **Sprint 8** — Polish, SEO, Deploy-readiness (local phase done, actual deploy pending)
- ✅ **Sprint 9** — Admin completionist (Menu CRUD + Settings editor + Customer drawer)
- ✅ **Sprint 10** — Deploy to Vercel + Railway 🎉 **LIVE**

---

## 🚀 الـ Project LIVE — اقتراحات للـ Sprint التالي

المشروع منشور وشغّال. أي شغل بعد هذا هو bonus (مش mandated في الـ original plan):

- **Real Paymob sandbox** — لو حضرتك جبت credentials فعلية من Paymob، set them in Railway env vars (`PAYMOB_API_KEY`, `INTEGRATION_ID`, `IFRAME_ID`, `HMAC_SECRET`) and the factory in `apps/api/src/modules/payments/payments.module.ts` will switch from mock to real automatically.
- **Custom domain** — connect a `.com` domain via Vercel/Railway dashboards.
- **Reviews module** — Prisma model already exists but no UI/API surface yet.
- **Email notifications via Resend** — order confirmation, status updates. Marked in `.env.example` as planned.
- **Mobile app** — React Native or Expo.
- **Analytics** — wire `NEXT_PUBLIC_GA_MEASUREMENT_ID` / `NEXT_PUBLIC_META_PIXEL_ID` (envs are scaffolded but not used).

### قبل البدء بأي sprint جديد
1. اقرأ هذا الملف بالكامل.
2. **خذ إذن المستخدم قبل البدء** (راجع قسم 2، النقطة 1).

---

## 11. ملفات مهمة للقراءة قبل البدء

```
/Users/ragab1512/Documents/KAREEM/مبرمج/Requests/
├── HANDOFF.md                                    ← أنت هنا
├── restaurant-ordering-project-plan.md           ← الخطة الكاملة (9 sprints)
│
├── apps/api/prisma/schema.prisma                 ← Database schema (17 models)
├── apps/api/prisma/seed.ts                       ← Seed data + image URLs
├── apps/api/src/main.ts                          ← Global setup (rawBody, helmet, throttler, swagger, etc.)
├── apps/api/src/app.module.ts                    ← Module wiring (12 modules)
├── apps/api/src/config/configuration.ts          ← Env reader + prod fail-fast
│
├── apps/api/src/modules/auth/                    ← JWT + RBAC pattern للنسخ
├── apps/api/src/modules/orders/                  ← Pricing snapshot + status transitions
├── apps/api/src/modules/payments/                ← Provider abstraction (Paymob + Mock)
│   ├── providers/payment-provider.interface.ts   ← الـ contract
│   ├── providers/paymob.client.ts                ← real Paymob sandbox client
│   └── providers/mock-paymob.client.ts           ← mock client (default)
├── apps/api/src/modules/realtime/                ← Socket.io gateway + staff:join auth
├── apps/api/src/modules/customers/               ← Admin customer list/detail
│
├── apps/web/src/lib/api.ts                       ← Fetch wrapper (Bearer + refresh-on-401)
├── apps/web/src/lib/api-types.ts                 ← Shared types (mirror Prisma + payment session)
├── apps/web/src/hooks/use-orders.ts              ← TanStack Query (incl. polling for CARD)
├── apps/web/src/hooks/use-order-tracking.ts      ← Socket.io customer-side subscription
├── apps/web/src/store/{cart,auth}-store.ts       ← Zustand + persist + hydrated flag
├── apps/web/src/app/checkout/page.tsx            ← Multi-step + CARD redirect
├── apps/web/src/app/payment/mock/page.tsx        ← Mock gateway form
├── apps/web/src/app/order/{success,cancelled}/   ← Post-payment landing pages
│
├── apps/admin/src/app/(protected)/layout.tsx     ← Admin shell (sidebar + topbar + auth gate)
├── apps/admin/src/app/(protected)/orders/        ← Live orders + status drawer
├── apps/admin/src/app/kds/page.tsx               ← Kitchen Display (chrome-less, outside group)
├── apps/admin/src/components/kds/                ← KdsCard, ElapsedTime, Chime (Web Audio)
├── apps/admin/src/hooks/use-staff-realtime.ts    ← admin + kitchen room subscription
└── apps/admin/src/hooks/use-kds-realtime.ts      ← kitchen room only
```

---

## 12. الـ Modules المتاحة (للـ reference السريع)

**API modules (12):** auth, categories, menu-items, orders, addresses, coupons, customers, payments, settings, upload, health, realtime
**Web pages (10):** /, /menu, /login, /register, /checkout, /orders, /order/[id], /order/success, /order/cancelled, /payment/mock
**Admin pages (7):** /login, /, /orders, /menu, /customers, /settings, /kds
**Swagger tags (11):** Auth, Categories, Menu Items, Orders, Addresses, Coupons, Customers, Payments, Settings, Upload, Health

---

**آخر تحديث:** 2026-05-18 (بعد Sprint 10 — Production deploy)
**Production:** LIVE 🎉
  - Web: https://pizza-height.vercel.app
  - Admin: https://pizza-height-admin.vercel.app
  - API: https://api-production-d421.up.railway.app
**Working tree:** modified (Sprint 10 changes not committed yet)
**التالي:** اختيار حضرتك — راجع قسم 🚀 للاقتراحات
