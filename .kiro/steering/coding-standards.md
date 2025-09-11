# Coding Standards & Best Practices

## Mobile Responsiveness

### Responsive Design Principles

- **ALWAYS design components to be mobile-first and responsive**
- Use Tailwind CSS responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Consider touch targets and accessibility on mobile devices
- Test components at different screen sizes

### Responsive Layout Patterns

```vue
<template>
  <!-- Mobile-first approach -->
  <div class="w-full sm:w-96 lg:w-1/3">
    <!-- Full width on mobile, fixed width on larger screens -->
  </div>

  <!-- Hide/show based on screen size -->
  <div class="hidden sm:block">
    <!-- Hidden on mobile, visible on desktop -->
  </div>

  <!-- Different layouts for different screens -->
  <div class="flex flex-col sm:flex-row">
    <!-- Vertical stack on mobile, horizontal on desktop -->
  </div>

  <!-- Responsive spacing and sizing -->
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- Smaller padding on mobile, larger on desktop -->
  </div>
</template>
```

### Modal/Slideover Responsive Patterns

```vue
<template>
  <!-- Slideover that becomes full-screen on mobile -->
  <div class="fixed top-0 right-0 h-full w-full sm:w-96 lg:w-1/3">
    <!-- Full width on mobile, partial width on larger screens -->
  </div>

  <!-- Hide main content when modal is open on mobile -->
  <div
    :class="{
      'hidden sm:block sm:mr-96': isModalOpen,
      block: !isModalOpen,
    }"
  >
    <!-- Main content -->
  </div>
</template>
```

### Touch and Interaction Considerations

- Use appropriate touch targets (minimum 44px)
- Consider swipe gestures for mobile interactions
- Ensure buttons and interactive elements are easily tappable
- Use appropriate spacing between interactive elements

```vue
<template>
  <!-- Touch-friendly button sizing -->
  <UButton size="md" class="min-h-[44px] min-w-[44px]"> Action </UButton>

  <!-- Responsive text sizes -->
  <h1 class="text-xl sm:text-2xl lg:text-3xl">Responsive Heading</h1>
</template>
```

## Documentation Lookup Guidelines

### Context7 MCP Integration

When users ask questions about libraries, frameworks, or need documentation for implementation:

1. **ALWAYS use Context7 first** - Before providing any code examples or guidance based on memory, use the Context7 MCP tools to fetch current, accurate documentation
2. **Resolve library IDs** - Use `mcp_Context7_resolve_library_id` to find the correct library identifier
3. **Fetch targeted docs** - Use `mcp_Context7_get_library_docs` with specific topics to get relevant, up-to-date information
4. **Prefer official sources** - When multiple library matches exist, prioritize official documentation with high trust scores

### Process Flow

```
User asks about library/framework
↓
Use resolve-library-id to find correct library
↓
Use get-library-docs with specific topic
↓
Provide guidance based on fetched documentation
↓
Include code examples from the documentation
```

### Common Libraries to Look Up

- **Vue.js**: `/vuejs/docs` - For Vue 3 components, props, composition API
- **Nuxt**: Look up for SSR, routing, and Nuxt-specific features
- **Pinia**: For state management patterns
- **TypeScript**: For type definitions and best practices
- **Tailwind CSS**: For styling and utility classes

### Benefits

- Ensures current best practices
- Avoids deprecated patterns
- Provides accurate API references
- Includes real code examples from official docs
- Maintains consistency with latest framework versions

### When NOT to Use Context7

- For project-specific implementation details
- When discussing general programming concepts
- For debugging specific user code issues
- When the question is about project structure or architecture decisions

Always prioritize accuracy and current practices over speed when providing technical guidance.

## Component Development Workflow

### Incremental Development Process

When creating new components, **ALWAYS follow this step-by-step approach** for maintainable and testable code:

#### 1. Start with Static UI and Hardcoded Data

```vue
<!-- pages/my-feature.vue -->
<template>
  <div>
    <h1>My Feature</h1>
    <!-- Hardcoded data directly in template -->
    <div v-for="item in hardcodedItems" :key="item.id">
      {{ item.name }}
    </div>
  </div>
</template>

<script setup>
// Hardcoded data in page component
const hardcodedItems = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
];
</script>
```

#### 2. Componentize UI and Pass Data Down

```vue
<!-- pages/my-feature.vue -->
<template>
  <div>
    <h1>My Feature</h1>
    <MyFeatureList :items="hardcodedItems" />
  </div>
</template>

<!-- components/MyFeatureList.vue -->
<template>
  <div v-for="item in items" :key="item.id">
    <MyFeatureCard :item="item" />
  </div>
</template>

<script setup>
defineProps<{
  items: Item[]
}>()
</script>
```

#### 3. Add Styling and Polish to Components

```vue
<!-- components/MyFeatureCard.vue -->
<template>
  <UCard class="hover:shadow-lg transition-shadow">
    <div class="p-4">
      <h3 class="text-lg font-semibold">{{ item.name }}</h3>
      <p class="text-gray-600">{{ item.description }}</p>
    </div>
  </UCard>
</template>
```

#### 4. Replace Mock Data with Store/Composable

```vue
<!-- pages/my-feature.vue -->
<script setup>
// Replace hardcoded data with store
const store = useMyFeatureStore();
const { items, loading } = storeToRefs(store);

onMounted(() => {
  store.fetchItems(); // Still using mock data in store
});
</script>
```

#### 5. Replace Mock Store Data with API Endpoints

```typescript
// stores/useMyFeatureStore.ts
async function fetchItems() {
  loading.value = true;
  try {
    // Replace mock data with real API call
    const response = await $fetch<Item[]>('/api/my-feature/items');
    items.value = response;
  } catch (error) {
    // Handle error
  } finally {
    loading.value = false;
  }
}
```

### Benefits of This Approach

- **Rapid prototyping** - Get UI working quickly
- **Incremental complexity** - Add one layer at a time
- **Easy testing** - Each step can be tested independently
- **Clear separation** - UI, data flow, and API concerns are separate
- **Maintainable** - Changes are isolated to specific layers

## Code Quality Standards

### TypeScript Usage

- **ALWAYS use TypeScript** for all new code
- Define proper interfaces and types
- Avoid `any` type - use proper typing or `unknown`
- Use strict mode settings

### Component Standards

- Follow Vue 3 Composition API patterns
- Use `<script setup>` syntax
- Implement proper prop validation with TypeScript
- Handle loading and error states appropriately

## Data Flow Architecture

### Store and Data Management Rules

**CRITICAL: All data fetching and store interactions happen at the PAGE level only.**

#### ✅ Correct Pattern - Page-Level Data Management

```vue
<!-- pages/my-feature.vue -->
<script setup>
// ✅ Page handles ALL store interactions
const store = useMyFeatureStore();
const { items, loading, error } = storeToRefs(store);

// ✅ Page initiates data fetching
onMounted(() => {
  store.fetchItems();
});

// ✅ Page handles user actions that modify data
function handleCreateItem(itemData) {
  store.createItem(itemData);
}

function handleUpdateItem(id, updates) {
  store.updateItem(id, updates);
}
</script>

<template>
  <!-- ✅ Page passes data and handlers down to components -->
  <MyFeatureList
    :items="items"
    :loading="loading"
    :error="error"
    @create-item="handleCreateItem"
    @update-item="handleUpdateItem"
  />
</template>
```

#### ✅ Correct Pattern - Component Receives Data

```vue
<!-- components/MyFeatureList.vue -->
<script setup>
// ✅ Component only receives data via props
defineProps<{
  items: Item[]
  loading: boolean
  error: string | null
}>()

// ✅ Component emits events for user actions
const emit = defineEmits<{
  'create-item': [data: CreateItemData]
  'update-item': [id: string, updates: Partial<Item>]
}>()

// ✅ Component handles UI logic only
function handleFormSubmit(formData) {
  emit('create-item', formData)
}
</script>
```

#### ❌ Incorrect Pattern - Component Direct Store Access

```vue
<!-- ❌ NEVER DO THIS in components -->
<script setup>
// ❌ Components should NOT directly access stores
const store = useMyFeatureStore();

// ❌ Components should NOT fetch data
onMounted(() => {
  store.fetchItems(); // This belongs in the page!
});

// ❌ Components should NOT directly mutate store state
function handleClick() {
  store.updateItem(id, data); // This should be emitted to parent!
}
</script>
```

### Exceptions to the Rule

**Components MAY directly interact with stores ONLY in these specific cases:**

1. **Form/Modal Components** - When the component's primary job is data manipulation

```vue
<!-- components/CreateItemModal.vue -->
<script setup>
// ✅ Exception: Modal's job IS to create items
const store = useMyFeatureStore();

async function handleSubmit(formData) {
  await store.createItem(formData);
  // Close modal, show success, etc.
}
</script>
```

2. **Specialized Data Components** - When the component is specifically designed for data management

```vue
<!-- components/DataTable.vue -->
<script setup>
// ✅ Exception: DataTable's job IS to manage table data
const store = useDataTableStore();
// Pagination, sorting, filtering logic
</script>
```

3. **Global UI State** - For app-wide UI state (not business data)

```vue
<!-- components/ThemeToggle.vue -->
<script setup>
// ✅ Exception: UI state, not business data
const { theme, toggleTheme } = useThemeStore();
</script>
```

### Benefits of This Architecture

- **Clear data flow** - Easy to trace where data comes from
- **Reusable components** - Components work with any data source
- **Testable** - Components can be tested with mock props
- **Maintainable** - Data logic is centralized in pages
- **Predictable** - All data changes flow through the same path

### Data Flow Summary

```
API ↔ Store ↔ Page ↔ Component
              ↕
           Composables
```

**Remember: Pages orchestrate, Components present.**

### Performance Considerations

- Implement lazy loading where appropriate
- Use computed properties for derived state
- Avoid unnecessary re-renders
- Optimize bundle size with proper imports

### Accessibility Standards

- Include proper ARIA labels
- Ensure keyboard navigation works
- Maintain proper color contrast
- Test with screen readers when possible

### Testing Standards

- Write unit tests for business logic
- Test component behavior, not implementation details
- Include integration tests for critical user flows
- Maintain good test coverage

## Error Handling

### User-Facing Errors

- Always provide meaningful error messages
- Use toast notifications for user feedback
- Implement proper loading states
- Handle network failures gracefully

### Development Errors

- Use proper error boundaries
- Log errors appropriately
- Provide helpful debugging information
- Fail fast in development, gracefully in production
