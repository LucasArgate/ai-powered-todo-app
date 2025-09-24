# Frontend Setup Instructions

## Quick Fix for Warnings

### 1. Create Environment File
Copy the example environment file:
```bash
cp env.example .env.local
```

### 2. Install Dependencies
Make sure you're using pnpm (not npm):
```bash
pnpm install
```

### 3. Start Development Server
```bash
pnpm dev
```

## Fixed Issues

✅ **Next.js Config**: Removed deprecated `appDir` experimental option (App Router is default in Next.js 14)

✅ **NPM Warnings**: Created `.npmrc` file to suppress unknown config warnings

✅ **API URL**: Updated to use port 3001 (backend port) instead of 3000

## Environment Variables

The frontend needs these environment variables:

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:3001)

## Troubleshooting

If you still see npm workspace errors, make sure you're running commands from the frontend directory:
```bash
cd apps/frontend
pnpm dev
```

Or use the root workspace commands:
```bash
# From project root
pnpm dev-app  # Runs only frontend
pnpm dev      # Runs both frontend and backend
```
