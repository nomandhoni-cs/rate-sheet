# Technology Stack & Development Guide

## Core Technologies

- **Framework**: Next.js 15.4.6 with App Router
- **Runtime**: React 19.1.0 with TypeScript 5
- **Backend/Database**: Convex (real-time database and backend)
- **Authentication**: Clerk (@clerk/nextjs)
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: shadcn/ui (New York style) with Radix UI primitives
- **Icons**: Lucide React
- **Package Manager**: Bun (evidenced by bun.lock)

## Development Commands

```bash
# Development server with Turbopack
bun dev

# Production build
bun run build

# Start production server
bun start

# Linting
bun run lint
```

## Key Dependencies

- **@clerk/nextjs**: Authentication and user management
- **convex**: Real-time backend and database operations
- **@radix-ui/react-slot**: Headless UI primitives
- **class-variance-authority**: Component variant management
- **tailwind-merge**: Tailwind class merging utility
- **clsx**: Conditional class name utility

## Configuration Standards

- **TypeScript**: Strict mode enabled, ES2017 target
- **Path Aliases**: `@/*` maps to `./src/*`
- **ESLint**: Next.js core web vitals + TypeScript rules
- **Component Library**: shadcn/ui with CSS variables and neutral base color
- **Build Tool**: Next.js with Turbopack for development

## Architecture Patterns

- App Router structure (Next.js 13+ pattern)
- Server and Client Components separation
- Real-time data synchronization via Convex
- Role-based authentication with Clerk
- Component composition with Radix UI primitives
