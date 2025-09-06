---
applyTo: "**/*.{ts,tsx,js,jsx,json,md}"
---

# Code Quality & Architecture Patterns

## Modern Development Standards

### Code Quality Tools

- **ESLint**: Strict linting with TypeScript support
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for quality gates
- **lint-staged**: Run linters on staged files only
- **Commitlint**: Enforce conventional commit messages

### Architecture Principles

- Follow Domain-Driven Design (DDD) principles
- Implement Clean Architecture with clear boundaries
- Use SOLID principles for component and module design
- Prefer composition over inheritance
- Implement proper separation of concerns

### Project Structure

- Organize by feature rather than file type
- Use barrel exports for clean module interfaces
- Implement proper dependency injection
- Keep business logic separate from UI logic
- Use absolute imports with path mapping

### Code Standards

- Follow conventional commit messages (feat, fix, docs, etc.)
- Use semantic versioning for releases
- Implement proper error boundaries and handling
- Use consistent naming conventions
- Write self-documenting code with proper comments
- Code must be less than 400 lines long per file. Certain cases can allow for under 500.

### Performance Standards

- Monitor Core Web Vitals (LCP, FID, CLS)
- Implement proper code splitting and lazy loading
- Use bundle analysis to monitor size
- Optimize images and assets
- Implement proper caching strategies

### Security Standards

- Validate all inputs on client and server
- Use environment variables for sensitive data
- Implement proper authentication and authorization
- Use HTTPS and security headers
- Regular dependency updates and security audits

### Examples

```typescript
// Domain-driven structure
src/
├── app/                    # Next.js app directory
├── components/            # Shared UI components
│   ├── ui/               # Base UI components
│   └── forms/            # Form components
├── features/             # Feature-based modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── user/
├── lib/                  # Shared utilities
│   ├── api/             # API client
│   ├── auth/            # Authentication logic
│   ├── db/              # Database utilities
│   └── utils/           # General utilities
├── stores/              # Global state management
└── types/               # Shared TypeScript types

// Clean service layer
interface UserRepository {
  findById(id: string): Promise<User | null>;
  create(user: CreateUserDto): Promise<User>;
  update(id: string, user: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}

class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUser(id: string): Promise<Result<User, UserError>> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        return { success: false, error: new UserNotFoundError(id) };
      }
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: new UserServiceError(error) };
    }
  }
}

// Error handling patterns
abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
}

class UserNotFoundError extends AppError {
  readonly code = 'USER_NOT_FOUND';
  readonly statusCode = 404;

  constructor(userId: string) {
    super(`User with id ${userId} not found`);
  }
}

// Configuration management
interface Config {
  app: {
    name: string;
    version: string;
    env: 'development' | 'staging' | 'production';
  };
  database: {
    url: string;
    maxConnections: number;
  };
  auth: {
    secret: string;
    expiresIn: string;
  };
}

const config: Config = {
  app: {
    name: process.env.APP_NAME!,
    version: process.env.npm_package_version!,
    env: process.env.NODE_ENV as Config['app']['env'],
  },
  database: {
    url: process.env.DATABASE_URL!,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
  },
  auth: {
    secret: process.env.AUTH_SECRET!,
    expiresIn: process.env.AUTH_EXPIRES_IN || '7d',
  },
};
```

### Configuration Files

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}

// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'test',
        'chore',
        'ci',
        'perf',
      ],
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case']],
  },
};

// package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage",
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Performance Monitoring

```typescript
// lib/analytics.ts
interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
}

export function reportWebVitals(metric: WebVitalsMetric): void {
  // Send to analytics service
  if (process.env.NODE_ENV === "production") {
    fetch("/api/analytics/web-vitals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metric),
    });
  }
}

// app/layout.tsx
import { reportWebVitals } from "@/lib/analytics";

export function reportWebVitals(metric: WebVitalsMetric) {
  reportWebVitals(metric);
}
```
