# Technology Stack & Development Guide

## Core Framework

- **Nuxt 4.0.3** - Full-stack Vue.js framework with SSR and API routes
- **Vue 3** - Composition API with `<script setup>` syntax
- **TypeScript** - Strict typing throughout the application
- **Node.js** - Server-side runtime for API endpoints

## UI & Styling

- **Nuxt UI 4.0.0-alpha.1** - Primary component library built on Tailwind CSS
- **Tailwind CSS** - Utility-first CSS framework (via Nuxt UI)
- **Lucide Icons** - Icon system via `@iconify-json/lucide`
- **Simple Icons** - Brand icons via `@iconify-json/simple-icons`

## Key Libraries

- **VueUse** - Composition utilities and state management
- **date-fns** - Date manipulation and formatting
- **@unovis/vue** - Data visualization components

## Package Manager

- **npm** - Primary package manager

## Common Commands

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Generate static site
npm run generate

# Preview production build
npm run preview
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Type checking
npm run typecheck

# Install dependencies
npm install
```

### Project Setup

```bash
# Prepare Nuxt (run after install)
npm run postinstall
```

## Development Tools

- **ESLint** - Code linting with Nuxt-specific rules and stylistic preferences
- **TypeScript** - Type checking and IntelliSense
- **Vue TSC** - Vue TypeScript compiler for type checking
