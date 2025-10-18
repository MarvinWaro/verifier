# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Laravel 12 + React + Inertia.js full-stack application using TypeScript, Tailwind CSS v4, and shadcn/ui components. The project includes authentication powered by Laravel Fortify and uses Laravel Wayfinder for type-safe routing between the backend and frontend.

## Development Commands

### Setup
```bash
composer run setup
```
Runs the complete setup: installs PHP and Node dependencies, creates `.env`, generates app key, runs migrations, and builds assets.

### Development Server
```bash
composer run dev
```
Starts the Laravel development server (port 8000), queue listener, and Vite dev server concurrently with colored output.

For SSR (Server-Side Rendering):
```bash
composer run dev:ssr
```
Starts all dev services plus the Inertia SSR server and Laravel Pail for logs.

### Frontend Development
```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run build:ssr    # Build with SSR support
```

### Code Quality
```bash
npm run lint         # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check formatting without fixing
npm run types        # TypeScript type checking (no emit)
```

### Backend Quality
```bash
./vendor/bin/pint    # Laravel Pint code formatter
```

### Testing
```bash
composer run test                    # Run all tests
php artisan test                     # Run all tests (direct)
php artisan test --filter=TestName   # Run specific test
```

Uses Pest PHP for testing framework.

## Architecture

### Frontend Structure

**Entry Points:**
- `resources/js/app.tsx` - Client-side entry point
- `resources/js/ssr.tsx` - Server-side rendering entry point

**Pages** (`resources/js/pages/`)
- Inertia pages are auto-loaded from this directory
- Structure: `pages/{name}.tsx` maps to `Inertia::render('name')`
- Subdirectories: `auth/`, `settings/`

**Layouts** (`resources/js/layouts/`)
- `app-layout.tsx` - Main authenticated layout
- `auth-layout.tsx` - Authentication pages layout
- Layout-specific subdirectories: `app/`, `auth/`, `settings/`

**Components** (`resources/js/components/`)
- Application components in root directory
- `ui/` - shadcn/ui components (don't modify directly, regenerate with shadcn CLI)
- UI library: Radix UI primitives + Tailwind CSS styling

**Type-Safe Routing:**
- Laravel Wayfinder generates TypeScript route definitions
- Routes defined in `resources/js/wayfinder/index.ts` (auto-generated)
- Routes auto-generated from Laravel route definitions

**Utilities:**
- `resources/js/lib/` - Shared utilities
- `resources/js/hooks/` - Custom React hooks (includes theme/appearance management)
- `resources/js/types/` - TypeScript type definitions

**Path Aliases:**
- `@/*` maps to `resources/js/*`
- Configured in `tsconfig.json` and `components.json`

### Backend Structure

**Routes:**
- `routes/web.php` - Main web routes
- `routes/auth.php` - Authentication routes (Laravel Fortify)
- `routes/settings.php` - User settings routes

**Controllers:**
- `app/Http/Controllers/` - Standard location
- `app/Http/Controllers/Auth/` - Authentication controllers
- `app/Http/Controllers/Settings/` - Settings controllers

**Authentication:**
- Uses Laravel Fortify for authentication features
- Supports email verification, password reset, two-factor authentication
- Authentication pages are React components served via Inertia

**Models:**
- `app/Models/` - Eloquent models

**Database:**
- `database/migrations/` - Database migrations
- `database/seeders/` - Database seeders
- `database/factories/` - Model factories

### Configuration Files

**Vite** (`vite.config.ts`):
- Laravel Vite plugin with Inertia SSR support
- React plugin with automatic JSX transform
- Tailwind CSS v4 Vite plugin
- Wayfinder plugin with form variants enabled

**TypeScript** (`tsconfig.json`):
- Strict mode enabled
- Module resolution: bundler
- JSX: react-jsx (automatic runtime)
- Path alias: `@/*` → `resources/js/*`

**shadcn/ui** (`components.json`):
- Style: new-york
- Uses CSS variables for theming
- Components path: `@/components/ui`

## Key Patterns

### Inertia.js Integration
- Pages receive props from Laravel controllers
- Use `Inertia::render()` to pass data to React components
- Forms use Inertia form helpers for seamless Laravel integration

### Styling
- Tailwind CSS v4 with CSS variables for theming
- Dark mode support via `use-appearance` hook
- Component variants using `class-variance-authority`
- Utility functions in `lib/utils.ts` (clsx, tailwind-merge)

### Type Safety
- Laravel Wayfinder generates type-safe routes
- Full TypeScript coverage for frontend code
- Inertia props are strongly typed

### Component Organization
- Use shadcn/ui for base components (add with `npx shadcn@latest add [component]`)
- Build application-specific components on top of ui components
- Keep layouts separate from page components

## Common Tasks

### Adding a new page
1. Create React component in `resources/js/pages/`
2. Add route in Laravel route files (`routes/web.php`, etc.)
3. Use `Inertia::render('page-name')` in controller
4. Wayfinder will auto-generate TypeScript route definitions

### Adding UI components
```bash
npx shadcn@latest add [component-name]
```

### Running database migrations
```bash
php artisan migrate
```

### Clearing caches
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```
