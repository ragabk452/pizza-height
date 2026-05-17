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

## 4. الـ Sprints المنجزة (0 → 3)

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
**Prisma Schema (18 models):**
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
- Swagger UI على `/api/docs` (16 endpoints, 6 tags)
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

## 5. الـ Bugs المكتشفة والمصلحة (20 إجمالاً)

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

---

## 8. Image URLs

كل الـ 26 menu item + 6 categories بيستخدموا Unsplash CDN URLs بصيغة:
```
https://images.unsplash.com/photo-<ID>?w=800&q=80&auto=format
```

الـ IDs موجودة في `apps/api/prisma/seed.ts` في `const IMG = { ... }`.

**عرف المستخدم لو شفت صورة لا تطابق المنتج** — استبدل الـ ID لـ ID Unsplash تاني (test أولاً: `curl -I "https://images.unsplash.com/photo-XXX"` لازم يرجع 200 + image/jpeg).

---

## 9. Git history الحالي (9 commits)

```
330d27f fix(api): non-existent category filter returned the entire menu
3598be2 fix: post-review issues caught by full sprint audit
2d49d56 fix(api): replace arbitrary Unsplash URLs with prompt-matching AI images
822ec00 feat(web): Sprint 3 - Menu & Cart Experience
39f7fdc fix(turbo): preserve tsbuildinfo files in build cache
a1cf378 feat(api): Sprint 2 - Database, Auth, and Menu APIs
16df2b1 fix(web): Sprint 1 review fixes
5a05399 feat(web): Sprint 1 - Modern Luxe design system and home page
f0b0943 fix: resolve lint issues from Sprint 0 verification
4d39a59 chore: initial project scaffolding for Pizza Height
```

Branch: `main` — لا توجد remotes (لسه ما تم push لـ GitHub).
الـ working tree نظيف عدا `.claude/settings.json` اللي بيتراكم automatically.

---

## 10. الـ Project Plan الكامل

موجود في `restaurant-ordering-project-plan.md` (827 سطر). يحتوي على 9 sprints مخطط لها:

- ✅ **Sprint 0** — Setup & Foundation
- ✅ **Sprint 1** — Design System & Hero ⭐ (القطعة الذهبية)
- ✅ **Sprint 2** — Database & Backend Core
- ✅ **Sprint 3** — Menu & Cart Experience
- 🚀 **Sprint 4** — Checkout & Orders (← التالي)
- ⏳ **Sprint 5** — Admin Dashboard
- ⏳ **Sprint 6** — Kitchen Display System (KDS)
- ⏳ **Sprint 7** — Payments Integration (Paymob Sandbox)
- ⏳ **Sprint 8** — Polish, SEO, Deploy

---

## 🚀 الخطوة التالية — Sprint 4: Checkout & Orders

### المحتوى المخطط

**Backend (apps/api):**
1. `OrdersModule` — service + controller
2. DTOs: `CreateOrderDto` مع validation للـ items + address + payment type
3. Endpoints:
   - `POST /orders` — إنشاء order مع snapshot للأسعار، calculation للـ totals + VAT + delivery، توليد `orderNumber` فريد (e.g. `PH-2026-0001`)
   - `GET /orders/me` — قائمة طلبات الـ customer current
   - `GET /orders/:id` — تفاصيل order واحد (مع authorization check)
4. Status transitions في `OrderStatusHistory`
5. Trigger `RealtimeGateway` لما order يُنشأ (broadcast لـ `admin` و `kitchen` rooms)

**Frontend (apps/web):**
1. صفحة `/checkout` — Multi-step form:
   - Step 1: Delivery type (Delivery / Pickup / Dine-in)
   - Step 2: Address (للـ Delivery) — autocomplete or manual
   - Step 3: Payment method (Cash on Delivery كـ MVP، Paymob في Sprint 7)
   - Step 4: Review + place order
2. صفحة `/order/success` — Confetti + order number + estimated time
3. صفحة `/order/[id]` — Tracking timeline (Pending → Confirmed → Preparing → Ready → Delivered/Picked up)
4. Live updates عبر Socket.io client
5. صفحة `/orders` — Order history (يتطلب auth)
6. Auth pages: `/login`, `/register` لـ customers
7. Customer profile dropdown في Navbar

**State changes:**
- Extend `cart-store.ts` بـ `clear()` بعد order success
- New: `auth-store.ts` للـ access/refresh tokens + customer profile
- Auth interceptor في `lib/api.ts` يرفع Bearer token تلقائياً

### قبل البدء
1. اقرأ هذا الملف بالكامل
2. شغّل المشروع وتأكد إن كل حاجة شغّالة (راجع قسم 6)
3. **خذ إذن المستخدم قبل البدء** (راجع قسم 2، النقطة 1)

---

## 11. ملفات مهمة للقراءة قبل البدء

```
/Users/ragab1512/Documents/KAREEM/مبرمج/Requests/
├── HANDOFF.md                                    ← أنت هنا
├── restaurant-ordering-project-plan.md           ← الخطة الكاملة (9 sprints)
├── apps/api/prisma/schema.prisma                 ← Database schema (18 models)
├── apps/api/prisma/seed.ts                       ← Seed data + image URLs
├── apps/api/src/main.ts                          ← Global setup (helmet, throttler, swagger, etc.)
├── apps/api/src/app.module.ts                    ← Module wiring
├── apps/api/src/modules/auth/                    ← JWT + RBAC pattern للنسخ
├── apps/api/src/modules/menu-items/              ← Pattern للـ APIs الجديدة
├── apps/web/src/lib/api.ts                       ← Fetch wrapper
├── apps/web/src/lib/api-types.ts                 ← Shared types
├── apps/web/src/hooks/use-menu.ts                ← TanStack Query pattern
├── apps/web/src/store/cart-store.ts              ← Zustand + persist pattern
├── apps/web/src/components/menu/                 ← Menu UI patterns
└── apps/web/src/components/cart/cart-drawer.tsx  ← Drawer pattern (Vaul)
```

---

**آخر تحديث:** 2026-05-17 (بعد Sprint 3 + 20 bug fixes + .env build fix)
**الـ working tree:** نظيف (عدا `.claude/settings.json` المتراكمة)
**الـ servers:** Docker + API + Web + Admin كلهم شغّالين أثناء كتابة هذا الملف
