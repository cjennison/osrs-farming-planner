---
applyTo: "**/*.{ts,tsx,js,jsx}"
---

# TypeScript Patterns

## Core TypeScript Standards

### Type Safety & Strictness

- Use strict TypeScript configuration with `strict: true`
- Enable `noUncheckedIndexedAccess` for safer array/object access
- Use `exactOptionalPropertyTypes` for precise optional property handling
- Prefer `unknown` over `any` when type is truly unknown
- Use type assertions sparingly and with justification

### Type Definitions

- Use `interface` for object shapes that might be extended
- Use `type` for unions, primitives, computed types, and complex type operations
- Prefer branded types for domain-specific primitives (e.g., `UserId`, `Email`)
- Use `const assertions` for immutable data structures
- Define discriminated unions for state management and data modeling

### Modern TypeScript Features (2025)

- Leverage template literal types for type-safe string manipulation
- Use conditional types and mapped types for advanced type transformations
- Utilize the `satisfies` operator for type checking without widening
- Implement recursive types for complex data structures
- Use module augmentation for extending third-party library types

### Error Handling

- Use Result/Either types for explicit error handling
- Avoid throwing exceptions in business logic
- Implement exhaustive checking with `never` type
- Use branded error types for different error categories

### Performance & Bundle Size

- Use `import type` for type-only imports
- Leverage tree-shaking with proper ES module exports
- Avoid circular dependencies
- Use lazy loading for types when appropriate

### Code Organization

- Group related types in separate `.types.ts` files
- Use barrel exports (`index.ts`) for clean module interfaces
- Implement consistent naming conventions (PascalCase for types/interfaces)
- Use namespace for organizing related utilities and types

### Examples

```typescript
// Branded types for domain safety
type UserId = string & { readonly __brand: "UserId" };
type Email = string & { readonly __brand: "Email" };

// Result type for error handling
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Discriminated union for state
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

// Template literal types
type EventName<T extends string> = `on${Capitalize<T>}`;
type ComponentEvent = EventName<"click" | "hover" | "focus">;
```
