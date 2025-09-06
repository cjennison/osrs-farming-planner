---
applyTo: "**/*.{tsx,jsx}"
---

# React Patterns

## Modern React Standards (2025)

### Mantine Component Framework Integration

- **Always prefer Mantine components** over hand-written implementations
- **Check shared components directory first** for existing Mantine-based components
- **Extend Mantine components** rather than creating UI components from scratch
- **Leverage Mantine's built-in hooks** and utilities for form handling, state management
- **Use Mantine's accessibility features** as the foundation for all UI components

### Component Architecture

- Use functional components exclusively with hooks
- Prefer composition over inheritance
- Implement proper component boundaries and single responsibility
- Use React.memo() for performance optimization when needed
- Leverage React.forwardRef() for ref forwarding
- **Build shared components by extending Mantine base components**

### Hooks Best Practices

- Use custom hooks for reusable stateful logic
- Follow hooks naming convention (`use` prefix)
- Optimize with useMemo() and useCallback() judiciously
- Use useRef() for DOM manipulation and mutable values
- Implement useImperativeHandle() sparingly and with clear justification
- **Leverage Mantine hooks** (useForm, useDisclosure, useHover, etc.) over custom implementations

### State Management

- Use useState() for local component state
- Leverage useReducer() for complex state logic
- Implement Context API for shared state (avoid prop drilling)
- Use external state management (Zustand, Jotai) for global state
- Prefer server state libraries (TanStack Query, SWR) for API data

### Performance Optimization

- Implement code splitting with React.lazy() and Suspense
- Use React.memo() for expensive components
- Optimize re-renders with proper dependency arrays
- Leverage React.startTransition() for non-urgent updates
- Use React.useDeferredValue() for expensive computations

### Image Display Standards

- **Always use ImageViewer for showcase images**: Replace `<img>` tags with `ImageViewer` component for any images meant for user viewing (case studies, portfolio screenshots, etc.)
- **Import from shared components**: `import { ImageViewer } from "@/components/ui/ImageViewer"`
- **Provide meaningful alt text and descriptions**: Use `alt` prop for accessibility and `description` prop for context in enlarged view
- **Use consistent aspect ratios**: Wrap ImageViewer in `aspect-video` containers for uniform display
- **Follow the pattern**: `<div className="aspect-video"><ImageViewer src="..." alt="..." description="..." className="w-full h-full" /></div>`

### Error Handling & Boundaries

- Implement Error Boundaries for graceful error handling
- Use error boundaries at appropriate component tree levels
- Provide fallback UI for error states
- Log errors appropriately for debugging

### Component Patterns

- Use render props pattern for flexible component APIs
- Implement compound components for related UI elements
- Use higher-order components (HOCs) sparingly
- Prefer hooks over HOCs for logic reuse
- Implement controlled vs uncontrolled component patterns appropriately

### Accessibility & Semantics

- Use semantic HTML elements
- Implement proper ARIA attributes
- Ensure keyboard navigation support
- Provide screen reader friendly content
- Test with accessibility tools

### Testing Considerations

- Write components with testability in mind
- Use data-testid attributes for test queries
- Separate business logic into testable hooks
- Mock external dependencies appropriately

### Examples

```tsx
// Extending Mantine components for shared use
import { Button, ButtonProps } from "@mantine/core";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SharedButtonProps extends ButtonProps {
  variant?: "primary" | "secondary" | "danger";
}

export const SharedButton = forwardRef<HTMLButtonElement, SharedButtonProps>(
  ({ variant = "primary", className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        color={variant === "primary" ? "blue" : variant === "secondary" ? "gray" : "red"}
        className={cn(className)}
        {...props}
      />
    );
  }
);

// Using Mantine form hooks
import { useForm } from "@mantine/form";
import { TextInput, Button, Group } from "@mantine/core";

function UserForm() {
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
    },
    validate: {
      name: (value) => (value.length < 2 ? "Name too short" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(console.log)}>
      <TextInput
        label="Name"
        placeholder="Your name"
        {...form.getInputProps("name")}
      />
      <TextInput
        label="Email"
        placeholder="your@email.com"
        {...form.getInputProps("email")}
      />
      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
    </form>
  );
}

// Custom hook for API data with Mantine notifications
import { notifications } from "@mantine/notifications";

function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch((err) => {
        setError(err.message);
        notifications.show({
          title: "Error",
          message: "Failed to load user data",
          color: "red",
        });
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
}

// Optimized component with memo using Mantine theming
const UserCard = React.memo<{ user: User; onClick: (id: string) => void }>(
  ({ user, onClick }) => {
    const handleClick = useCallback(() => {
      onClick(user.id);
    }, [onClick, user.id]);

    return (
      <Card
        bg="var(--mantine-color-body)"
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleClick}
      >
        <Title order={4} c="var(--mantine-color-text)">{user.name}</Title>
        <Text c="dimmed">{user.email}</Text>
      </Card>
    );
  }
);

// Error boundary component
class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback: React.ComponentType<{ error: Error }>;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <this.props.fallback error={this.state.error!} />;
    }
    return this.props.children;
  }
}

// ImageViewer component usage for showcase images
import { ImageViewer } from "@/components/ui/ImageViewer";

function CaseStudyImages() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="aspect-video">
        <ImageViewer
          src="/images/portfolio-case-study-1.png"
          alt="Portfolio homepage layout and navigation implementation"
          description="Initial homepage layout with hero section, navigation, and responsive design implementation"
          className="w-full h-full rounded-lg border border-gray-200"
          fit="cover"
        />
      </div>
      <div className="aspect-video">
        <ImageViewer
          src="/images/portfolio-case-study-2.png"
          alt="Services section and component architecture"
          description="Services section with case study integration and modern component architecture"
          className="w-full h-full rounded-lg border border-gray-200"
          fit="cover"
        />
      </div>
    </div>
  );
}
```
