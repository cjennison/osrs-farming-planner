---
applyTo: "**/*.{ts,tsx,js,jsx,json}"
---

# Performance Patterns

## Modern Performance Standards

### Core Web Vitals Targets

- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Interaction to Next Paint (INP)**: < 200 milliseconds
- **Time to First Byte (TTFB)**: < 800 milliseconds

### Image Optimization

- Use Next.js Image component for automatic optimization
- Implement proper aspect ratios to prevent layout shift
- Use WebP and AVIF formats with fallbacks
- Implement lazy loading for below-the-fold images
- Optimize image sizes for different viewports

### Code Splitting & Lazy Loading

- Implement route-based code splitting with Next.js
- Use React.lazy() for component-level splitting
- Lazy load heavy libraries and components
- Split vendor bundles appropriately
- Use dynamic imports for conditional features
- Barrel imports are forbidden. No folder should contain an index.ts file unless absolutely necessary.

### Bundle Optimization

- Analyze bundle size with webpack-bundle-analyzer
- Tree shake unused code effectively
- Use proper module resolution and side effects
- Implement proper chunk splitting strategies
- Monitor bundle size in CI/CD pipeline

### Caching Strategies

- Implement proper HTTP caching headers
- Use Next.js built-in caching mechanisms
- Implement service worker for offline support
- Use stale-while-revalidate patterns
- Cache static assets with long TTL

### Examples

```tsx
// Optimized image component
import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
    />
  );
}

// Lazy loaded component with Suspense
const LazyChart = lazy(() => import("@/components/Chart"));

function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={() => setShowChart(true)}>Show Chart</button>

      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <LazyChart />
        </Suspense>
      )}
    </div>
  );
}

// Performance monitoring hook
function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor Core Web Vitals
    import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(sendToAnalytics);
      getFID(sendToAnalytics);
      getFCP(sendToAnalytics);
      getLCP(sendToAnalytics);
      getTTFB(sendToAnalytics);
    });

    // Monitor resource loading
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "navigation") {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log("Navigation timing:", {
            domContentLoaded:
              navEntry.domContentLoadedEventEnd -
              navEntry.domContentLoadedEventStart,
            loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
          });
        }
      }
    });

    observer.observe({ entryTypes: ["navigation", "resource"] });

    return () => observer.disconnect();
  }, []);
}

// Virtualized list for large datasets
import { FixedSizeList as List } from "react-window";

interface VirtualizedListProps {
  items: any[];
  height: number;
  itemHeight: number;
  renderItem: ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => React.ReactNode;
}

function VirtualizedList({
  items,
  height,
  itemHeight,
  renderItem,
}: VirtualizedListProps) {
  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      itemData={items}
    >
      {renderItem}
    </List>
  );
}

// Optimized search with debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedSearchTerm],
    queryFn: () => searchAPI(debouncedSearchTerm),
    enabled: !!debouncedSearchTerm,
  });

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      {isLoading && <div>Searching...</div>}
      {data && <SearchResults results={data} />}
    </div>
  );
}

// Intersection Observer for lazy loading
function useLazyLoad(threshold = 0.1) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isIntersecting] as const;
}

function LazySection({ children }: { children: React.ReactNode }) {
  const [ref, isIntersecting] = useLazyLoad();

  return (
    <div ref={ref}>{isIntersecting ? children : <div>Loading...</div>}</div>
  );
}

// Memory leak prevention
function useComponentWillUnmount(cleanup: () => void) {
  const cleanupRef = useRef(cleanup);
  cleanupRef.current = cleanup;

  useEffect(() => {
    return () => cleanupRef.current();
  }, []);
}

// Resource preloading
function usePreloadResource(href: string, as: string) {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [href, as]);
}
```

### Performance Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Bundle analyzer
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }

    // Optimize chunks
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

// Bundle analyzer script
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build",
    "lighthouse": "lighthouse http://localhost:3000 --output json --output html --output-path ./lighthouse-results",
  }
}

// Performance monitoring
// lib/performance.ts
export function sendToAnalytics(metric: any) {
  const body = JSON.stringify(metric);

  if ('sendBeacon' in navigator) {
    navigator.sendBeacon('/api/analytics', body);
  } else {
    fetch('/api/analytics', {
      body,
      method: 'POST',
      keepalive: true,
    });
  }
}

// Service worker for caching
// public/sw.js
const CACHE_NAME = 'app-cache-v1';
const urlsToCache = [
  '/',
  '/static/css/',
  '/static/js/',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
```

### Performance Testing

```typescript
// Performance testing with Playwright
import { test, expect } from "@playwright/test";

test.describe("Performance Tests", () => {
  test("should meet Core Web Vitals thresholds", async ({ page }) => {
    // Navigate to page
    await page.goto("/");

    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Measure performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries.find(
            (entry) => entry.entryType === "largest-contentful-paint"
          );
          resolve({
            lcp: lcp ? lcp.startTime : null,
          });
        }).observe({ entryTypes: ["largest-contentful-paint"] });
      });
    });

    expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
  });

  test("should load critical resources quickly", async ({ page }) => {
    await page.goto("/");

    const performanceTiming = await page.evaluate(() => performance.timing);
    const timeToFirstByte =
      performanceTiming.responseStart - performanceTiming.navigationStart;

    expect(timeToFirstByte).toBeLessThan(800); // TTFB < 800ms
  });
});
```
