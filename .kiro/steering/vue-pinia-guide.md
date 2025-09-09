# Pinia Best Practices - Quick Reference

## Store Definition

### Naming Conventions

```javascript
// Use descriptive names with 'use' prefix and 'Store' suffix
export const useUserStore = defineStore('user', {
  /* ... */
});
export const useCartStore = defineStore('cart', {
  /* ... */
});
export const useProductStore = defineStore('products', {
  /* ... */
});
```

### When to Use Setup vs Options Stores

**Use Setup Stores when:**

- Need complex composition logic
- Working with composables
- Want Vue 3 Composition API patterns

```javascript
export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const loading = ref(false);

  // Computed (acts as getters)
  const isLoggedIn = computed(() => !!user.value);

  // Actions
  async function login(credentials) {
    loading.value = true;
    const response = await api.login(credentials);
    user.value = response.data;
    loading.value = false;
  }

  return { user, loading, isLoggedIn, login };
});
```

**Use Options Stores when:**

- Prefer object-based syntax
- Simpler state management needs

```javascript
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Counter',
  }),

  getters: {
    doubleCount: (state) => state.count * 2,
  },

  actions: {
    increment() {
      this.count++;
    },
  },
});
```

## Store Organization

### File Structure

```
stores/
├── index.js         # Export all stores
├── user.js         # User-related state
├── cart.js         # Shopping cart
└── products.js     # Product catalog
```

### One Domain Per Store

```javascript
// Good - Focused on user domain
export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null,
    preferences: {},
    notifications: [],
  }),
});

// Good - Focused on cart domain
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    total: 0,
  }),
});
```

## State Management

### State Definition

```javascript
// Always provide initial values
state: () => ({
  count: 0,
  items: [],
  user: null,
  loading: false,
  error: null,
});
```

### Updating State

```javascript
// Direct mutation (allowed in Pinia)
store.count++;

// Using $patch for multiple updates
store.$patch({
  count: store.count + 1,
  name: 'New Name',
});

// Using actions for business logic
store.addItem(newItem);
```

## Getters

### Basic Getters

```javascript
getters: {
  // Simple computed values
  doubleCount: (state) => state.count * 2,
  itemCount: (state) => state.items.length,

  // Access other getters with 'this'
  summary(state) {
    return `${this.itemCount} items, total: ${this.totalPrice}`
  }
}
```

### Parameterized Getters

```javascript
getters: {
  getUserById: (state) => {
    return (userId) => state.users.find((user) => user.id === userId);
  };
}

// Usage
const user = store.getUserById(123);
```

## Actions

### Basic Action Patterns

```javascript
actions: {
  // Simple synchronous action
  increment() {
    this.count++
  },

  // Async action with proper error handling
  async fetchUser(userId) {
    this.loading = true
    this.error = null

    try {
      const user = await api.getUser(userId)
      this.user = user
      return user
    } catch (error) {
      this.error = error.message
      throw error
    } finally {
      this.loading = false
    }
  },

  // Actions can call other actions
  async login(credentials) {
    const user = await this.authenticate(credentials)
    await this.fetchUserPreferences(user.id)
    return user
  }
}
```

## Using Stores in Components

### Composition API

```javascript
<script setup>
  import {useUserStore} from '@/stores/user' import {storeToRefs} from 'pinia'
  const userStore = useUserStore() // Destructure reactive state with
  storeToRefs const {(user, loading)} = storeToRefs(userStore) // Actions can be
  destructured directly const {(login, logout)} = userStore // Use in template
  or other functions await login(credentials)
</script>
```

### Options API

```javascript
import { mapState, mapActions } from 'pinia';
import { useUserStore } from '@/stores/user';

export default {
  computed: {
    ...mapState(useUserStore, ['user', 'loading']),
  },
  methods: {
    ...mapActions(useUserStore, ['login', 'logout']),
  },
};
```

## Store Composition

### Using Multiple Stores

```javascript
export const useCartStore = defineStore('cart', () => {
  const userStore = useUserStore();
  const items = ref([]);

  const totalPrice = computed(() => {
    // Can access other stores in computed/actions
    return items.value.reduce((sum, item) => sum + item.price, 0);
  });

  async function checkout() {
    if (!userStore.isLoggedIn) {
      throw new Error('Must be logged in');
    }
    // checkout logic
  }

  return { items, totalPrice, checkout };
});
```

## Common Use Cases

### Loading States

```javascript
export const useDataStore = defineStore('data', {
  state: () => ({
    data: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchData() {
      this.loading = true;
      this.error = null;

      try {
        this.data = await api.getData();
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
  },
});
```

### Form Handling

```javascript
export const useFormStore = defineStore('form', {
  state: () => ({
    formData: {},
    errors: {},
    submitting: false,
  }),

  actions: {
    updateField(field, value) {
      this.formData[field] = value;
      // Clear error when field is updated
      if (this.errors[field]) {
        delete this.errors[field];
      }
    },

    async submitForm() {
      this.submitting = true;
      try {
        await api.submit(this.formData);
        this.$reset(); // Clear form after success
      } catch (error) {
        this.errors = error.validationErrors;
      } finally {
        this.submitting = false;
      }
    },
  },
});
```

### Local Storage Persistence

```javascript
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'light',
    language: 'en',
  }),

  actions: {
    updateTheme(theme) {
      this.theme = theme;
      localStorage.setItem('theme', theme);
    },

    loadFromStorage() {
      const saved = localStorage.getItem('theme');
      if (saved) this.theme = saved;
    },
  },
});
```

## TypeScript Support

### Basic Typing

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

export const useUserStore = defineStore('user', {
  state: (): { user: User | null; loading: boolean } => ({
    user: null,
    loading: false,
  }),

  actions: {
    async login(email: string, password: string): Promise<User> {
      const user = await api.login(email, password);
      this.user = user;
      return user;
    },
  },
});
```

## Advanced Topics

For more complex scenarios, refer to the official documentation:

### Store Composition Patterns

Read <https://pinia.vuejs.org/cookbook/composing-stores.html> for advanced patterns when composing multiple stores and handling circular dependencies.

### Plugins

Read <https://pinia.vuejs.org/core-concepts/plugins.html> for extending Pinia with custom functionality like persistence, logging, and more.

### SSR Support

Read <https://pinia.vuejs.org/ssr/> for server-side rendering considerations and best practices.

### DevTools Integration

Pinia automatically integrates with Vue DevTools for debugging. Read <https://pinia.vuejs.org/introduction.html#devtools-support> for more information.
