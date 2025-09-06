---
applyTo: "**/*.{tsx,ts}"
---

# NextJS Patterns

## Modern Next.js 15+ Standards

### App Router Architecture

- Use App Router exclusively (app/ directory)
- Implement proper route organization with route groups
- Use parallel routes for complex layouts
- Leverage intercepting routes for modals and overlays
- Organize routes logically with nested layouts

### Server Components & Client Components

- Default to Server Components for better performance
- Use Client Components only when necessary (interactivity, browser APIs)
- Mark Client Components with "use client" directive
- Minimize Client Component boundaries
- Pass data down from Server to Client Components

### Data Fetching Patterns

- Use native fetch() with automatic deduplication
- Implement proper caching strategies (force-cache, no-store)
- Use Suspense boundaries for loading states
- Leverage streaming for better UX
- Implement proper error boundaries

### Route Handlers (API Routes)

- Use Route Handlers in app/api/ directory
- Implement proper HTTP methods (GET, POST, PUT, DELETE)
- Use TypeScript for request/response typing
- Implement proper error handling and status codes
- Use middleware for common functionality

### Metadata & SEO

- Use generateMetadata() for dynamic metadata
- Implement proper Open Graph and Twitter cards
- Use structured data for rich snippets
- Optimize for Core Web Vitals
- Implement proper canonical URLs

### Performance Optimization

- Use Next.js Image component for optimized images
- Implement proper code splitting with dynamic imports
- Use Partial Prerendering when available
- Optimize bundle size with proper tree shaking
- Leverage Edge Runtime when appropriate

### Middleware & Security

- Implement middleware for authentication and redirects
- Use CSRF protection and proper security headers
- Implement rate limiting for API routes
- Use environment variables for sensitive data
- Validate all inputs on both client and server

### File Organization

- Use co-location for related files
- Implement proper barrel exports
- Organize utilities in lib/ directory
- Keep components in components/ directory
- Use types/ directory for shared TypeScript types

### Build & Deployment

- Configure next.config.js properly
- Use proper environment variable management
- Implement proper CI/CD pipelines
- Use Edge Functions for dynamic content
- Optimize for Vercel deployment patterns

### Examples

```tsx
// Server Component with data fetching
async function UserProfile({ userId }: { userId: string }) {
  const user = await fetch(`/api/users/${userId}`, {
    cache: "force-cache",
    next: { revalidate: 3600 },
  }).then((res) => res.json());

  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <UserActions userId={userId} />
    </div>
  );
}

// Client Component for interactivity
("use client");
function UserActions({ userId }: { userId: string }) {
  const [following, setFollowing] = useState(false);

  const handleFollow = async () => {
    await fetch(`/api/users/${userId}/follow`, { method: "POST" });
    setFollowing(true);
  };

  return (
    <button onClick={handleFollow} disabled={following}>
      {following ? "Following" : "Follow"}
    </button>
  );
}

// Route Handler with proper typing
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserById(params.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Dynamic metadata generation
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const user = await getUserById(params.id);

  return {
    title: `${user.name} - Profile`,
    description: `View ${user.name}'s profile and posts`,
    openGraph: {
      title: `${user.name} - Profile`,
      description: `View ${user.name}'s profile and posts`,
      images: [user.avatar],
    },
  };
}

// Middleware example
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check authentication
  const token = request.cookies.get("auth-token");

  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

### Folder Structure

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── layout.tsx
├── dashboard/
│   ├── users/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   └── layout.tsx
├── api/
│   └── users/
│       └── route.ts
├── globals.css
└── layout.tsx
```
