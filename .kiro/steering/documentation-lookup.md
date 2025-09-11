# Documentation Lookup Guidelines

## Context7 MCP Integration

When users ask questions about libraries, frameworks, or need documentation for implementation:

1. **ALWAYS use Context7 first** - Before providing any code examples or guidance based on memory, use the Context7 MCP tools to fetch current, accurate documentation
2. **Resolve library IDs** - Use `mcp_Context7_resolve_library_id` to find the correct library identifier
3. **Fetch targeted docs** - Use `mcp_Context7_get_library_docs` with specific topics to get relevant, up-to-date information
4. **Prefer official sources** - When multiple library matches exist, prioritize official documentation with high trust scores

## Process Flow

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

## Common Libraries to Look Up

- **Vue.js**: `/vuejs/docs` - For Vue 3 components, props, composition API
- **Nuxt**: Look up for SSR, routing, and Nuxt-specific features
- **Pinia**: For state management patterns
- **TypeScript**: For type definitions and best practices
- **Tailwind CSS**: For styling and utility classes

## Benefits

- Ensures current best practices
- Avoids deprecated patterns
- Provides accurate API references
- Includes real code examples from official docs
- Maintains consistency with latest framework versions

## When NOT to Use Context7

- For project-specific implementation details
- When discussing general programming concepts
- For debugging specific user code issues
- When the question is about project structure or architecture decisions

Always prioritize accuracy and current practices over speed when providing technical guidance.
