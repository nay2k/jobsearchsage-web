# Project Structure & Architecture

## Directory Organization

```
/
├── public/                 # Static assets (favicon, images)
├── server/                 # Server-side code
│   └── api/               # API endpoints (Nuxt server routes)
├── app/                   # Main application code
│   ├── app.config.ts      # App-level configuration
│   ├── app.vue           # Root Vue component
│   ├── error.vue         # Global error page
│   ├── assets/           # Build-time assets
│   │   └── css/          # Global styles
│   ├── components/       # Vue components
│   │   ├── [feature]/    # Feature-specific components
│   │   └── ui/           # Custom UI components (if any)
│   ├── composables/      # Composition functions
│   ├── layouts/          # Page layouts
│   ├── pages/            # File-based routing pages
│   ├── types/            # TypeScript definitions
│   └── utils/            # Utility functions
├── nuxt.config.ts        # Nuxt configuration
└── package.json          # Dependencies and scripts
```

## Component Architecture

### Component Organization

- Group components by feature in `app/components/[feature]/`
- Use PascalCase for component files
- Keep related components together (modals, forms, lists)

### Component Structure Pattern

All components follow this structure:

```vue
<script setup lang="ts">
// 1. Imports (types, utilities, composables)
// 2. Props definition with TypeScript interfaces
// 3. Local reactive state
// 4. Functions and event handlers
// 5. Lifecycle hooks (if needed)
</script>

<template>
  <!-- Nuxt UI components with consistent patterns -->
</template>
```

## API Structure

### Server Routes

- Located in `server/api/`
- Use `eventHandler` pattern for all endpoints
- Return typed responses matching frontend interfaces
- Handle CORS via `routeRules` in nuxt.config.ts

### Data Fetching Patterns

- Use `useFetch` for API calls with TypeScript
- Use `useAsyncData` for computed/derived data
- Implement lazy loading where appropriate

## Type System

### Type Organization

- Central types in `app/types/index.d.ts`
- Feature-specific types in dedicated files
- Use interfaces for object shapes
- Use union types for enums/status values

### Naming Conventions

- Interfaces: PascalCase (e.g., `User`, `JobApplication`)
- Types: PascalCase (e.g., `UserStatus`, `Period`)
- Props interfaces: `Props` suffix (e.g., `ComponentProps`)

## State Management

### Composables Pattern

- Global state via shared composables using VueUse
- Use `createSharedComposable` for cross-component state
- Local state with `ref()` and `reactive()`

### Data Flow

- Props down, events up
- Composables for shared business logic
- Server state via `useFetch`/`useAsyncData`

## Routing & Navigation

### File-based Routing

- Pages in `app/pages/` directory
- Nested routes via folder structure
- Dynamic routes with `[param].vue` syntax

### Layout System

- Default layout in `app/layouts/default.vue`
- Page-specific layouts as needed
- Dashboard layout patterns using Nuxt UI components
