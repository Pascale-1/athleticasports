import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        xs: "375px",
      },
      fontFamily: {
        heading: ["Montserrat", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Semantic Typography Scale - Use these for consistency
        "page-title": ["1.25rem", { lineHeight: "1.75rem", fontWeight: "700" }],
        "section": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "600" }],
        "card-title": ["0.8125rem", { lineHeight: "1.125rem", fontWeight: "600" }],
        "body": ["0.8125rem", { lineHeight: "1.25rem" }],
        "body-sm": ["0.75rem", { lineHeight: "1.125rem" }],
        "caption": ["0.6875rem", { lineHeight: "1rem" }],
        "micro": ["0.625rem", { lineHeight: "0.875rem" }],
        // Legacy - keeping for backwards compatibility
        "xxs": ["0.625rem", { lineHeight: "1.4" }],
        "display": ["1.75rem", { lineHeight: "2.25rem", fontWeight: "700" }],
        "h1": ["1.25rem", { lineHeight: "1.75rem", fontWeight: "700" }],
        "h2": ["1.125rem", { lineHeight: "1.5rem", fontWeight: "600" }],
        "h3": ["1rem", { lineHeight: "1.375rem", fontWeight: "600" }],
        "h4": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "600" }],
        "body-lg": ["0.9375rem", { lineHeight: "1.375rem" }],
        "small": ["0.8125rem", { lineHeight: "1.25rem" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          light: "hsl(var(--primary-light))",
          dark: "hsl(var(--primary-dark))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        neutral: {
          50: "hsl(var(--neutral-50))",
          100: "hsl(var(--neutral-100))",
          200: "hsl(var(--neutral-200))",
          300: "hsl(var(--neutral-300))",
          400: "hsl(var(--neutral-400))",
          500: "hsl(var(--neutral-500))",
          600: "hsl(var(--neutral-600))",
          700: "hsl(var(--neutral-700))",
          800: "hsl(var(--neutral-800))",
          900: "hsl(var(--neutral-900))",
        },
      },
      spacing: {
        "xs": "0.25rem",    /* 4px */
        "sm": "0.5rem",     /* 8px - base unit */
        "md": "1rem",       /* 16px - 2 units */
        "lg": "1.5rem",     /* 24px - 3 units */
        "xl": "2rem",       /* 32px - 4 units */
        "2xl": "3rem",      /* 48px - 6 units */
        "3xl": "4rem",      /* 64px - 8 units */
      },
      borderRadius: {
        sm: "0.5rem",      /* 8px */
        md: "0.75rem",     /* 12px */
        lg: "1rem",        /* 16px */
        xl: "1.5rem",      /* 24px */
        "2xl": "2rem",     /* 32px */
        full: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.03)",
        md: "0 2px 4px -1px rgb(0 0 0 / 0.06)",
        lg: "0 4px 6px -2px rgb(0 0 0 / 0.08)",
        xl: "0 8px 12px -3px rgb(0 0 0 / 0.1)",
        "2xl": "0 12px 24px -6px rgb(0 0 0 / 0.15)",
        colored: "0 4px 12px rgba(0, 102, 255, 0.12)",
        "colored-lg": "0 6px 16px rgba(0, 102, 255, 0.18)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "200ms",
        slow: "300ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "scale-out": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "scale-out": "scale-out 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
