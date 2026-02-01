# Nova Subs

A modern subscription management system built with React, TypeScript, and Supabase.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth + Database + Storage)
- **State Management**: TanStack Query (React Query)

## Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- npm or bun
- Supabase project (for auth and database)

## Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_GIT_URL>
cd nova-subs
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
```

### 4. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## Project Structure

```
nova-subs/
├── src/
│   ├── components/     # UI components
│   │   ├── auth/       # Authentication components
│   │   ├── customers/  # Customer management
│   │   ├── packages/   # Package management
│   │   ├── layout/     # Layout components
│   │   └── ui/         # shadcn/ui components
│   ├── contexts/       # React contexts (Auth)
│   ├── hooks/          # Custom React hooks
│   ├── integrations/   # External integrations (Supabase)
│   ├── lib/            # Utility functions
│   └── pages/          # Page components
├── supabase/           # Supabase migrations
└── public/             # Static assets
```

## Security

For security setup including RLS policies and database configuration, see [SECURITY_SETUP.md](./SECURITY_SETUP.md).

## Pre-deploy Checklist

Before deploying to production, run the following checks:

```bash
# 1. Type check
npm run typecheck

# 2. Lint check
npm run lint

# 3. Build production bundle
npm run build
```

All commands should pass without errors.

## Deployment

### Firebase Hosting

```bash
# Build the app
npm run build

# Deploy to Firebase
firebase deploy
```

### Vercel

The project includes `vercel.json` for Vercel deployment. Simply connect your repository to Vercel for automatic deployments.

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ID | ✅ |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | ✅ |
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |

> ⚠️ Never commit your `.env` file. Use `.env.example` as a template.

## License

Private project.
