# Antigravity x Supabase Production Starter

This is a premium, high-performance web application starter kit designed to be deployed to Vercel and integrated with Supabase.

## Features
- **Premium UI**: Dark-mode Glassmorphism design with background animations.
- **Supabase Integrated**: Pre-configured with Supabase JS library and automated migrations.
- **Vercel Ready**: Optimized for zero-config deployment to Vercel.
- **Automated Workflow**: Uses Supabase CLI for database schema management.

## Getting Started

### 1. Requirements
- Node.js installed.
- Supabase CLI installed.

### 2. Setup Database
Link your Supabase project:
```bash
npx supabase login
npx supabase link --project-ref your-project-ref
```

Push the database schema:
```bash
npx supabase db push
```

### 3. Run Locally
Simply open `index.html` in your browser. (Since this is a no-build project, no dev server is required, though you can use one like `live-server` or `vite` if preferred).

## Deployment
Push this repository to GitHub and connect it to Vercel as a "Static Site".
