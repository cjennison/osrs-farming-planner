---
applyTo: "**/*.{ts,tsx,js,jsx}"
---

# Accessibility Patterns

## Modern Accessibility Standards

### Core Accessibility Principles

- Follow WCAG 2.1 AA guidelines as minimum standard
- Implement semantic HTML as the foundation
- Ensure keyboard navigation for all interactive elements
- Provide proper focus management and visual indicators
- Test with screen readers and assistive technologies

### Semantic HTML & ARIA

- Use proper HTML elements for their intended purpose
- Implement ARIA attributes only when necessary
- Use landmark roles for page structure
- Provide descriptive labels and accessible names
- Implement proper heading hierarchy (h1-h6)

### Keyboard Navigation

- Ensure all interactive elements are keyboard accessible
- Implement proper tab order and focus management
- Use skip links for main content navigation
- Handle focus trapping in modals and overlays
- Provide keyboard shortcuts for common actions

### Color & Contrast

- Maintain minimum 4.5:1 contrast ratio for normal text
- Use 3:1 contrast ratio for large text and UI elements
- Don't rely solely on color to convey information
- Test with various color vision deficiencies
- Implement high contrast mode support

### Screen Reader Support

- Provide meaningful alt text for images
- Use proper form labels and descriptions
- Implement live regions for dynamic content
- Provide context for complex interactions
- Test with NVDA, JAWS, and VoiceOver

### Examples

```tsx
// Accessible button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", loading, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }))}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="sr-only">Loading...</span>}
        <span aria-hidden={loading}>{children}</span>
        {loading && (
          <svg
            className="animate-spin ml-2 h-4 w-4"
            aria-hidden="true"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
      </button>
    );
  }
);

// Accessible form component
interface FormFieldProps {
  label: string;
  error?: string;
  description?: string;
  required?: boolean;
  children: React.ReactElement;
}

function FormField({
  label,
  error,
  description,
  required,
  children,
}: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  const childWithProps = React.cloneElement(children, {
    id,
    "aria-invalid": !!error,
    "aria-describedby":
      [description ? descriptionId : "", error ? errorId : ""]
        .filter(Boolean)
        .join(" ") || undefined,
  });

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {description && (
        <p id={descriptionId} className="text-sm text-gray-600">
          {description}
        </p>
      )}

      {childWithProps}

      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Accessible modal component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (isOpen) {
      const previousActiveElement = document.activeElement as HTMLElement;

      // Focus trap implementation
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }

        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      firstElement?.focus();

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        previousActiveElement?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 id={titleId} className="text-xl font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Accessible navigation component
function MainNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav role="navigation" aria-label="Main navigation">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Company Logo
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-6">
          {navigationItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "hover:text-blue-600 transition-colors",
                  pathname === item.href && "text-blue-600 font-semibold"
                )}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Navigation */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <ul id="mobile-menu" className="md:hidden mt-4 space-y-2" role="menu">
          {navigationItems.map((item) => (
            <li key={item.href} role="none">
              <Link
                href={item.href}
                className={cn(
                  "block py-2 hover:text-blue-600 transition-colors",
                  pathname === item.href && "text-blue-600 font-semibold"
                )}
                role="menuitem"
                aria-current={pathname === item.href ? "page" : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

// Accessible data table
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface DataTableProps {
  users: User[];
  onSort: (key: keyof User) => void;
  sortKey?: keyof User;
  sortDirection?: "asc" | "desc";
}

function DataTable({ users, onSort, sortKey, sortDirection }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <caption className="sr-only">
          List of users with their names, emails, and roles
        </caption>
        <thead>
          <tr>
            <th scope="col" className="border border-gray-300 p-2 text-left">
              <button
                onClick={() => onSort("name")}
                className="font-semibold hover:text-blue-600"
                aria-sort={
                  sortKey === "name"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                Name
                {sortKey === "name" && (
                  <span aria-hidden="true">
                    {sortDirection === "asc" ? " ↑" : " ↓"}
                  </span>
                )}
              </button>
            </th>
            <th scope="col" className="border border-gray-300 p-2 text-left">
              <button
                onClick={() => onSort("email")}
                className="font-semibold hover:text-blue-600"
                aria-sort={
                  sortKey === "email"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                Email
                {sortKey === "email" && (
                  <span aria-hidden="true">
                    {sortDirection === "asc" ? " ↑" : " ↓"}
                  </span>
                )}
              </button>
            </th>
            <th scope="col" className="border border-gray-300 p-2 text-left">
              Role
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border border-gray-300 p-2">{user.name}</td>
              <td className="border border-gray-300 p-2">{user.email}</td>
              <td className="border border-gray-300 p-2">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Skip link component
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                 bg-blue-600 text-white px-4 py-2 rounded z-50 
                 focus:outline-none focus:ring-2 focus:ring-blue-300"
    >
      Skip to main content
    </a>
  );
}

// Live region for announcements
function LiveRegion({
  message,
  type = "polite",
}: {
  message: string;
  type?: "polite" | "assertive";
}) {
  return (
    <div role="status" aria-live={type} aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
```

### CSS for Accessibility

```css
/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only.focus:not(.sr-only) {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

/* Focus styles */
.focus-visible:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .btn {
    border: 2px solid;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Dark mode accessibility */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1a1a1a;
    --color-text: #ffffff;
    --color-border: #404040;
  }
}
```

### Testing Accessibility

```typescript
// Accessibility testing with Jest and Testing Library
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Button } from "./Button";

expect.extend(toHaveNoViolations);

describe("Button Accessibility", () => {
  it("should not have accessibility violations", async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should be keyboard accessible", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });

    button.focus();
    expect(button).toHaveFocus();

    fireEvent.keyDown(button, { key: "Enter" });
    expect(mockOnClick).toHaveBeenCalled();
  });

  it("should have proper ARIA attributes when loading", () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole("button");

    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
```
