// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  devServer: {
    port: 4000,
  },

  pages: true,

  modules: ["@nuxt/ui"],

  css: ["~/assets/css/tailwind.css"],

  runtimeConfig: {
    apiBaseInternal:
      process.env.NUXT_API_BASE_INTERNAL ||
      process.env.NUXT_PUBLIC_API_BASE ||
      "http://localhost:3000/api",
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3000/api",
    },
  },

  app: {
    head: {
      title: "Travel Booking",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Book your next adventure with Travel Booking",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
        },
      ],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false, // Disable during build for performance (use IDE/CI for type checking)
  },

  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
      autoprefixer: {},
    },
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Use esbuild for faster builds
      target: "esnext",
    },
  },

  nitro: {
    routeRules: {
      "/**": {
        headers: {
          // Prevent clickjacking attacks
          "X-Frame-Options": "DENY",
          // Prevent MIME type sniffing
          "X-Content-Type-Options": "nosniff",
          // Enable XSS protection
          "X-XSS-Protection": "1; mode=block",
          // Control referrer information
          "Referrer-Policy": "strict-origin-when-cross-origin",
          // Feature and permissions policy
          "Permissions-Policy":
            "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          // Content Security Policy
          "Content-Security-Policy": [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Nuxt requires unsafe-inline and unsafe-eval in dev
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "connect-src 'self' http://localhost:3000", // Allow API calls to backend
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join("; "),
          // Strict Transport Security (HSTS) - only in production
          ...(process.env.NODE_ENV === "production"
            ? {
                "Strict-Transport-Security":
                  "max-age=31536000; includeSubDomains",
              }
            : {}),
        },
      },
    },
  },
});
