# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**THE WORLD DOOR** (FBT-V1 - フルフィルメント・ビジネス・ターミナル) is a luxury fulfillment system for high-value consignment sales (cameras, watches, accessories). The codebase is currently transitioning from legacy jQuery-based HTML pages to a modern Next.js application with TypeScript and Tailwind CSS.

## Development Commands

### Core Development
- `npm run dev` - Start Next.js development server (localhost:3001)
- `npm run build` - Build production with Prisma generation
- `npm start` - Run production server

### Database Management
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio GUI
- `npm run db:seed` - Seed database with initial data

### Testing
- `npm run test` - Run all Playwright E2E tests
- `npm run test:ui` - Run Playwright tests with UI mode
- `npm run test:headed` - Run Playwright tests in headed mode
- `npm run test:debug` - Debug Playwright tests
- `npm run test:report` - Show Playwright test report

**Important**: Always run `npm run test` before committing changes to ensure all E2E tests pass.

## Architecture Overview

### Tech Stack
- **Next.js 14.2.5** with App Router
- **React 18.3.1** + TypeScript 5
- **Tailwind CSS 3.4.1** with custom Nexus design system
- **Prisma ORM** with PostgreSQL (schema defined, not yet integrated)
- **Authentication**: JWT with bcryptjs
- **Static JSON data** in `/data/` directory (current implementation)

### Application Structure

**Authentication Flow:**
- Root `/` redirects to `/login`
- Login supports three user roles:
  - セラー (Seller) → `/dashboard`
  - スタッフ (Staff) → `/staff/dashboard`
  - 管理者 (Admin) → admin capabilities

**Core Components:**
- `app/components/DashboardLayout.tsx` - Main layout with sidebar/header
- `app/components/Sidebar.tsx` - Collapsible navigation with role-based menus
- `app/components/nexus/` - Custom Nexus design system components
- `app/dashboard/page.tsx` - Primary seller dashboard
- `app/staff/` - Staff-specific functionality

**Data Management:**
- Static JSON files: `dashboard.json`, `inventory.json`, `tasks.json`, `timeline.json`
- Client-side API layer in `js/api.js` with 5-minute caching
- Prisma schema ready but not yet connected
- API routes in `app/api/` for future backend integration

### Legacy Infrastructure

**Transition State:**
- Legacy HTML files (`index.html`, `inventory.html`, `staff.html`, `timeline.html`) still exist
- Multiple server implementations (`server.js`, `app.py`) serve status pages
- jQuery-based implementations being migrated to React components

## Design System (Nexus)

### Styling Approach
- **Nexus Design System** with holographic/glassmorphism effects
- **Custom Tailwind configuration** with purple gradient color palette
- **Component Classes**: `.glassmorphism`, `.button-primary`, `.gradient-text`, `.card-hover`
- **Dark mode support** via CSS variables
- **Responsive design** with mobile-first approach

### Key UI Patterns
- Primary: Purple gradients (`primary-500` to `secondary-500`)
- Custom animations: `fade-in`, `slide-in`, `bounce-light`
- Japanese language UI throughout
- Accessibility: WCAG compliant design

## Key Development Patterns

### Data Flow
1. Static JSON files serve as data source
2. `js/api.js` provides caching layer
3. Components use local state management
4. Future: Prisma ORM for database operations

### Component Organization
- Server components for layouts and static content
- Client components (`'use client'`) for interactive features
- Shared components in `app/components/`
- Nexus design system in `app/components/nexus/`
- Page-specific components co-located with routes

### Business Logic
- **Status Flow**: 入庫 → 検品 → 保管 → 出品 → 受注 → 出荷 → 配送 → 売約済み → 返品
- **User Roles**: Seller (basic), Staff (full management), Admin
- **Product Categories**: カメラ本体, レンズ, 腕時計, アクセサリ
- **Product Conditions**: 新品, 新品同様, 極美品, 美品, 良品, 中古美品, 中古

## Database Schema (Prisma)

The project includes a complete Prisma schema with:
- User management with role-based access
- Product inventory with status tracking
- Order management system
- Customer and seller profiles
- Tasks and activity logs
- Shipping and return processing

Database enums match the business logic status flows and categories.

## Important Configuration

### TypeScript
- Strict mode enabled
- Path aliases configured (`@/*` maps to root)
- Next.js plugin integration

### Tailwind CSS
- **Critical**: Uses Tailwind CSS v3.4.1 (not v4+) due to PostCSS compatibility
- Custom Nexus design system utilities
- Extended color palette for gradients

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required for Prisma)
- JWT secrets and other auth config (to be defined)

## Testing Framework

### E2E Testing with Playwright
- **Test Files**: Located in `/tests/` directory
- **Configuration**: `playwright.config.ts`
- **Test Categories**:
  - `auth.spec.ts` - Authentication flow tests
  - `dashboard.spec.ts` - Dashboard functionality tests
  - `inventory.spec.ts` - Inventory management tests
  - `staff.spec.ts` - Staff workflow tests
  - `timeline.spec.ts` - Timeline and history tests
  - `ui-components.spec.ts` - Component-level tests
  - `accessibility.spec.ts` - Accessibility compliance tests
  - `full-workflow.spec.ts` - End-to-end workflow tests

### Test Utilities
- `tests/e2e-utils.ts` - Helper functions and test data
- Multi-browser testing (Chrome, Firefox, Safari)
- HTML reporter for test results
- CI/CD ready configuration

## Implementation Status

### ✅ Completed Features
- **All Core Screens**: Login, Dashboard, Inventory, Timeline fully implemented
- **Staff Management**: Tasks, Shipping, Reports, Staff Inventory implemented  
- **Seller Reporting**: Sales analytics and performance metrics
- **Error Handling**: Custom 404 page with proper navigation
- **Responsive Design**: Mobile, tablet, desktop optimization
- **E2E Testing**: Comprehensive Playwright test suite
- **Nexus Design System**: Complete UI component library

### 🔄 Demo-Level Implementation
- **API Endpoints**: Demo-level with static JSON responses
- **Authentication**: Client-side only simulation
- **Data Management**: Static JSON files for consistency
- **Database**: Schema defined but not connected

## Current Limitations

- **No database connection** - Prisma schema ready but not integrated
- **No Git repository** initialized
- **Authentication is demo-only** - production auth system needed
- **Static data only** - no real data persistence

## Migration Notes

When working on legacy HTML pages:
1. Check if Next.js equivalent exists in `app/` directory
2. Migrate jQuery functionality to React hooks
3. Convert inline styles to Tailwind/Nexus classes
4. Preserve Japanese UI text and business logic
5. Maintain existing data structure from JSON files

## API Structure

The `app/api/` directory contains prepared endpoints for:
- `/api/auth/` - Authentication (login, logout, profile)
- `/api/dashboard/` - Dashboard data and analytics
- `/api/inventory/` - Product inventory management
- `/api/orders/` - Order processing
- `/api/products/` - Product catalog
- `/api/shipping/` - Shipping and tracking
- `/api/staff/` - Staff-specific operations
- `/api/tasks/` - Task management
- `/api/timeline/` - Activity timeline

All endpoints currently return static JSON data from the `/data/` directory.

## Business Context

This is a Japanese luxury goods fulfillment platform handling high-value items. Key considerations:
- UI text must remain in Japanese
- Business processes follow Japanese commerce standards
- Product categories focus on luxury items (cameras, watches, accessories)
- Status flows represent typical Japanese consignment sales process
- Careful handling of product conditions and grading