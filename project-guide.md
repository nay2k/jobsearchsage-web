# JobSearchSage Technical Architecture Guide

JobSearchSage is an AI-powered systematic job search platform that transforms chaotic job searching into a systematic, data-driven process. This guide documents the technical foundation, coding conventions, and architectural patterns established in the Nuxt 4 template that serves as the foundation for building the JobSearchSage MVP features.

## Technology Stack

### Core Framework: Nuxt 4

- **Nuxt 4.0.3** - Full-stack Vue.js framework with server-side rendering and API routes
- **Vue 3** - Composition API for reactive component development
- **TypeScript** - Strict typing throughout the application
- **Node.js** - Server-side runtime for API endpoints and server functions

### UI & Styling

- **Nuxt UI 4.0.0-alpha.1** - Component library built on top of Tailwind CSS
- **Tailwind CSS** - Utility-first CSS framework (configured via Nuxt UI)
- **Lucide Icons** - Icon system via [`@iconify-json/lucide`](package.json:15)
- **Simple Icons** - Brand icons via [`@iconify-json/simple-icons`](package.json:16)

### Data & State Management

- **Pinia** - State management (via [`@vueuse/nuxt`](package.json:20))
- **VueUse** - Collection of composition utilities

### Development Tools

- **ESLint** - Code linting with Nuxt-specific rules
- **TypeScript** - Type checking and IntelliSense
- **Vue TSC** - Vue TypeScript compiler

## Coding Standards & Conventions

**MUST FOLLOW THESE RULES, NO EXCEPTIONS:**

- **Framework**: Nuxt 4, Vue 3, TypeScript, Nuxt UI
- **Patterns**: ALWAYS use Composition API + `<script setup>`, NEVER use Options API
- **TypeScript**: ALWAYS keep types alongside your code, prefer `interface` over `type` for defining types
- **Components**: Use Nuxt UI components, maintain consistent component patterns
- **Functions**: ALWAYS use named functions when declaring methods, use arrow functions only for callbacks
- **Exports**: ALWAYS prefer named exports over default exports (except for pages and layouts)
- **Comments**: ONLY add meaningful comments that explain why something is done, not what it does

## Project Structure

```
/
├── public/                 # Static files (favicon, assets)
├── server/                 # Server-side code
│   └── api/               # API endpoints (Nuxt server routes)
├── app/                   # Main application code (frontend)
│   ├── app.config.ts      # App-level configuration
│   ├── app.vue           # Root Vue component
│   ├── error.vue         # Error page component
│   ├── assets/           # Assets (CSS, images, etc.)
│   │   └── css/
│   │       └── main.css   # Global styles
│   ├── components/       # Reusable Vue components
│   │   ├── ui/           # Base UI components (if any custom ones)
│   │   ├── layout/       # Layout-specific components
│   │   └── [feature]/    # Feature-specific components
│   ├── composables/      # Composition functions
│   ├── layouts/          # Page layouts
│   ├── pages/            # Page components (file-based routing)
│   ├── types/            # TypeScript type definitions
│   │   └── index.d.ts    # Shared types and interfaces
│   └── utils/            # Utility functions
│       └── index.ts      # Helper functions
├── nuxt.config.ts        # Nuxt configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── eslint.config.mjs     # ESLint configuration
```

## Component Architecture Patterns

### Component Structure Convention

All components follow the same structure pattern using [`<script setup>`](app/components/customers/AddModal.vue:1):

```vue
<script setup lang="ts">
// 1. Imports (types, utilities, composables)
import type { SomeType } from '~/types'
import { someUtility } from '~/utils'

// 2. Props definition with TypeScript
interface Props {
  data: SomeType
  optional?: string
}
const props = defineProps<Props>()

// 3. Local reactive state
const localState = ref('')
const computedValue = computed(() => /* logic */)

// 4. Functions and event handlers
function handleSomething() {
  // logic here
}

// 5. Lifecycle hooks and watchers (if needed)
onMounted(() => {
  // initialization
})
</script>

<template>
  <!-- Template using Nuxt UI components -->
</template>
```

### Nuxt UI Component Usage Patterns

**Dashboard Layout Pattern:**

- Use [`UDashboardPanel`](app/pages/index.vue:26) for main page container
- Use [`UDashboardNavbar`](app/pages/index.vue:28) for page headers with actions
- Use [`UDashboardToolbar`](app/pages/index.vue:53) for filters and controls

**Data Display Patterns:**

- Use [`UTable`](app/pages/customers.vue:282) with TanStack table integration for complex data tables
- Use [`UPageGrid`](app/components/home/HomeStats.vue:67) and [`UPageCard`](app/components/home/HomeStats.vue:68) for metrics display
- Use [`UBadge`](app/components/home/HomeStats.vue:88) for status indicators

**Form Patterns:**

- Use [`UForm`](app/components/customers/AddModal.vue:30) for form handling
- Use [`UFormField`](app/components/customers/AddModal.vue:36) for form inputs
- Use [`UModal`](app/components/customers/AddModal.vue:26) for dialog forms

**Navigation Patterns:**

- Use [`UNavigationMenu`](app/layouts/default.vue:134) for sidebar navigation
- Use [`UDropdownMenu`](app/components/UserMenu.vue:155) for user/action menus

## TypeScript Patterns & Type Definitions

### Type Organization

Types are centrally defined in [`app/types/index.d.ts`](app/types/index.d.ts:1) following these patterns:

```typescript
// Status enums as union types
export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced';

// Interface definitions for data models
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: AvatarProps; // Optional Nuxt UI props
  status: UserStatus;
  location: string;
}

// Component prop interfaces
interface ComponentProps {
  period: Period;
  range: Range;
}
```

### Component Props Typing

Always define props with TypeScript interfaces:

```typescript
// ✅ Correct: Interface for props
interface Props {
  data: User[];
  loading?: boolean;
}
const props = defineProps<Props>();

// ❌ Avoid: Inline prop definitions without types
```

### API Response Typing

Server API routes return typed responses:

```typescript
// server/api/customers.ts
export default eventHandler(async (): Promise<User[]> => {
  return customers;
});

// Component usage
const { data } = await useFetch<User[]>('/api/customers');
```

## Server API Patterns

### API Route Structure

All API routes follow the [`eventHandler`](server/api/customers.ts:185) pattern:

```typescript
// server/api/example.ts
export default eventHandler(async (event) => {
  // Handle GET, POST, etc. based on event.node.req.method

  // For GET requests - return data
  return data;

  // For POST requests - handle body
  const body = await readBody(event);
  // Process and return response
});
```

### Data Patterns

- Mock data is defined as constants in API files
- Use [`date-fns`](server/api/notifications.ts:1) for date manipulation
- Return structured data matching TypeScript interfaces

## State Management Patterns

### Composables Pattern

Global state is managed through shared composables using VueUse:

```typescript
// app/composables/useDashboard.ts
import { createSharedComposable } from '@vueuse/core';

const _useDashboard = () => {
  const state = ref(initialState);

  // Shared logic and state

  return {
    state,
    actions,
  };
};

export const useDashboard = createSharedComposable(_useDashboard);
```

### Local State Patterns

- Use [`ref()`](app/components/customers/AddModal.vue:9) for primitive reactive values
- Use [`reactive()`](app/components/customers/AddModal.vue:13) for object state
- Use [`computed()`](app/app.vue:4) for derived state

## Data Fetching Patterns

### Server-Side Data Fetching

Use [`useFetch`](app/pages/customers.vue:24) for API calls with TypeScript:

```typescript
const { data, status } = await useFetch<User[]>('/api/customers', {
  lazy: true, // For client-side hydration
});
```

### Async Data with Dependencies

Use [`useAsyncData`](app/components/home/HomeStats.vue:48) for computed data:

```typescript
const { data } = await useAsyncData(
  'key',
  async () => {
    return computedData;
  },
  {
    watch: [dependency1, dependency2],
    default: () => defaultValue,
  }
);
```

## Configuration Patterns

### Nuxt Configuration ([`nuxt.config.ts`](nuxt.config.ts:2))

```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui', // UI component library
    '@vueuse/nuxt', // VueUse utilities
  ],
  css: ['~/assets/css/main.css'],
  routeRules: {
    '/api/**': { cors: true }, // API CORS configuration
  },
});
```

### App Configuration ([`app.config.ts`](app/app.config.ts:1))

```typescript
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green', // Primary theme color
      neutral: 'zinc', // Neutral theme color
    },
  },
});
```

### ESLint Configuration ([`eslint.config.mjs`](eslint.config.mjs:4))

```javascript
export default withNuxt({
  rules: {
    'vue/no-multiple-template-root': 'off',
    'vue/max-attributes-per-line': ['error', { singleline: 3 }],
  },
});
```

## Development Workflow

### File Creation Patterns

1. **Pages**: Create in [`app/pages/`](app/pages/) following file-based routing
2. **Components**: Organize by feature in [`app/components/[feature]/`](app/components/)
3. **API Routes**: Create in [`server/api/`](server/api/) with typed responses
4. **Types**: Add to [`app/types/index.d.ts`](app/types/index.d.ts) or create feature-specific type files
5. **Composables**: Create in [`app/composables/`](app/composables/) using VueUse patterns

## Best Practices for AI Development

When implementing new features on this foundation:

1. **Follow Established Patterns**: Use the component, API, and state management patterns shown in the template
2. **Type Everything**: Define TypeScript interfaces for all data models and component props
3. **Component Organization**: Group related components by feature in dedicated directories
4. **Async Data**: Use [`useFetch`](app/pages/customers.vue:24) and [`useAsyncData`](app/components/home/HomeStats.vue:48) for data fetching
5. **Form Handling**: Use TypeScript interfaces with Nuxt UI form components
6. **State Management**: Create composables for shared state, use local reactive state for component-specific data
7. **Styling**: Use Nuxt UI components with Tailwind utilities, maintain design consistency

This guide serves as the technical foundation for building a systematic, well-architected JobSearchSage application following modern Vue.js and Nuxt best practices.
