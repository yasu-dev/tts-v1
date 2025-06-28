# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**THE WORLD DOOR** is a luxury fulfillment system for high-value consignment sales (cameras, watches, accessories). The codebase is currently transitioning from legacy jQuery-based HTML pages to a modern Next.js application with TypeScript and Tailwind CSS.

## Development Commands

- `npm run dev` - Start Next.js development server (localhost:3000)
- `npm run build` - Create production build
- `npm start` - Run production server
- `npm run test` - Run Playwright E2E tests
- `npm run test:ui` - Run Playwright tests with UI mode
- `npm run test:headed` - Run Playwright tests in headed mode
- `npm run test:debug` - Debug Playwright tests
- `npm run test:report` - Show Playwright test report

**Important**: Always run `npm run test` before committing changes to ensure all E2E tests pass.

## Architecture Overview

### Tech Stack
- **Next.js 14.2.5** with App Router
- **React 18.3.1** + TypeScript 5
- **Tailwind CSS 3.4.1** with custom design system
- **Static JSON data** in `/data/` directory (no database yet)

### Application Structure

**Authentication Flow:**
- Root `/` redirects to `/login`
- Login supports two user types:
  - セラー (Seller) → `/dashboard`
  - スタッフ (Staff) → `/staff/dashboard`

**Core Components:**
- `app/components/DashboardLayout.tsx` - Main layout with sidebar/header
- `app/components/Sidebar.tsx` - Collapsible navigation with role-based menus
- `app/dashboard/page.tsx` - Primary seller dashboard

**Data Management:**
- Static JSON files: `dashboard.json`, `inventory.json`, `tasks.json`, `timeline.json`
- Client-side API layer in `js/api.js` with 5-minute caching
- No backend database integration currently

### Legacy Infrastructure

**Transition State:**
- Legacy HTML files (`index.html`, `inventory.html`, `staff.html`, `timeline.html`) still exist
- Multiple server implementations (`server.js`, `app.py`) serve status pages
- jQuery-based implementations being migrated to React components

## Design System

### Styling Approach
- **Custom Tailwind configuration** with purple gradient color palette
- **Glassmorphism UI** using `.glassmorphism` utility class
- **Custom components**: `.button-primary`, `.gradient-text`, `.card-hover`
- **Dark mode support** via CSS variables

### Color Scheme
- Primary: Purple gradients (`primary-500` to `secondary-500`)
- Custom animations: `fade-in`, `slide-in`, `bounce-light`
- Japanese language support throughout UI

## Key Development Patterns

### Data Flow
1. Static JSON files serve as data source
2. `js/api.js` provides caching layer
3. Components use local state management
4. Real-time updates through client-side polling

### Component Organization
- Server components for layouts and static content
- Client components (`'use client'`) for interactive features
- Shared components in `app/components/`
- Page-specific components co-located with routes

### Business Logic
- **Status Flow**: 入庫 → 検品 → 保管 → 出品 → 受注 → 出荷 → 配送 → 返品
- **User Roles**: Seller (basic dashboard) vs Staff (full management)
- **Product Categories**: カメラ本体, レンズ, 腕時計, アクセサリ

## Important Configuration

### TypeScript
- Strict mode enabled
- Path aliases configured (`@/*` maps to root)
- Next.js plugin integration

### Tailwind CSS
- **Critical**: Uses Tailwind CSS v3.4.1 (not v4+) due to PostCSS compatibility
- Custom utilities for business-specific styling
- Responsive design with mobile-first approach

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
  - `full-workflow.spec.ts` - End-to-end workflow tests

### Test Utilities
- `tests/e2e-utils.ts` - Helper functions and test data
- Support for responsive design testing
- Cross-browser testing (Chrome, Firefox, Safari)
- CI/CD integration with GitHub Actions

## Implementation Status

### ✅ Completed Features
- **All Core Screens**: Login, Dashboard, Inventory, Timeline fully implemented
- **Staff Management**: Tasks, Shipping, Reports, Staff Inventory implemented  
- **Seller Reporting**: Sales analytics and performance metrics
- **Error Handling**: Custom 404 page with proper navigation
- **Responsive Design**: Mobile, tablet, desktop optimization
- **E2E Testing**: Comprehensive Playwright test suite

### 🔄 Demo-Level Implementation
- **API Endpoints**: Demo-level with static JSON responses
- **Authentication**: Client-side only simulation
- **Data Management**: Static JSON files for consistency

## Current Limitations

- **No database integration** - data persistence missing
- **No Git repository** initialized
- **Authentication is demo-only** - production auth system needed

## Migration Notes

When working on legacy HTML pages:
1. Check if Next.js equivalent exists in `app/` directory
2. Migrate jQuery functionality to React hooks
3. Convert inline styles to Tailwind classes
4. Preserve Japanese UI text and business logic
5. Maintain existing data structure from JSON files

## Business Context

This is a Japanese luxury goods fulfillment platform handling high-value items. UI text should remain in Japanese, and business logic around consignment sales processes should be preserved during any refactoring.