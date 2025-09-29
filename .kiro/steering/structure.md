# Project Structure & Organization

## Root Directory Layout

```
├── src/                    # Source code
├── public/                 # Static assets
├── idea/                   # Product documentation
├── .kiro/                  # Kiro configuration and steering
├── .next/                  # Next.js build output
├── node_modules/           # Dependencies
└── [config files]          # Various configuration files
```

## Source Code Organization (`src/`)

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── layout.tsx          # Root layout component
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/             # Reusable React components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utility functions and configurations
│   └── utils.ts            # Common utilities (cn function, etc.)
└── middleware.ts           # Next.js middleware (likely for auth)
```

## Component Architecture

- **UI Components**: Located in `src/components/ui/` (shadcn/ui pattern)
- **Page Components**: App Router pages in `src/app/`
- **Utilities**: Helper functions in `src/lib/`
- **Path Aliases**: Use `@/` prefix for imports from `src/`

## File Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Pages**: lowercase with Next.js App Router conventions
- **Utilities**: camelCase (e.g., `utils.ts`)
- **Styles**: kebab-case for CSS, camelCase for CSS-in-JS

## Import Patterns

```typescript
// External libraries first
import { NextRequest } from "next/server";
import { clsx } from "clsx";

// Internal imports with path aliases
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

## Configuration Files

- **components.json**: shadcn/ui configuration
- **tsconfig.json**: TypeScript configuration with path mapping
- **eslint.config.mjs**: ESLint rules (Next.js + TypeScript)
- **postcss.config.mjs**: PostCSS with Tailwind
- **next.config.ts**: Next.js configuration
