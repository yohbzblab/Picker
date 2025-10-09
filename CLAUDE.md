# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InstaCrawl is a Next.js 15 application for Instagram analytics with Supabase authentication and Prisma ORM. The app allows users to connect their Instagram accounts and analyze their social media data.

## Key Commands

### Development
```bash
npm run dev       # Start development server (port 3000)
npm run build     # Build for production
npm run start     # Start production server
```

### Database Management
```bash
npx prisma generate          # Generate Prisma Client
npx prisma db push           # Sync schema with database
npx prisma migrate dev       # Create and apply migrations
npx prisma studio            # Open Prisma Studio GUI
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 with App Router, React 19, TailwindCSS v4
- **Authentication**: Supabase Auth with Google OAuth
- **Database**: PostgreSQL via Prisma ORM (custom output to `app/generated/prisma`)
- **Deployment**: Uses ngrok for development tunneling (foxiest-jerome-untruly.ngrok-free.dev)

### Key Architecture Patterns

1. **Authentication Flow**:
   - Supabase handles OAuth (Google login)
   - Middleware (`middleware.js`) protects routes
   - AuthProvider (`components/AuthProvider.js`) manages user state
   - Database user sync happens after Supabase authentication

2. **Database Architecture**:
   - Prisma schema at `prisma/schema.prisma`
   - Generated client outputs to `app/generated/prisma` (non-standard location)
   - Two main models: `User` and `InstagramAccount`
   - User creation happens automatically on first login via `/api/users` endpoint

3. **Instagram Integration**:
   - OAuth flow: `/api/instagram/auth` → Instagram → `/api/instagram/callback`
   - Stores Instagram tokens in database
   - Business account integration with specific scopes

4. **API Structure**:
   - `/api/users` - User CRUD operations
   - `/api/instagram/auth` - Initiates Instagram OAuth
   - `/api/instagram/callback` - Handles Instagram OAuth callback
   - `/api/instagram/accounts` - Manages Instagram accounts

## Environment Variables

Required environment variables in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_APP_URL` - Application URL (ngrok for dev)
- `INSTAGRAM_APP_ID` - Instagram app ID
- `INSTAGRAM_APP_SECRET` - Instagram app secret
- `NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI` - Instagram OAuth callback URL

## Important Implementation Details

1. **Custom Prisma Output**: Prisma client generates to `app/generated/prisma` instead of `node_modules/.prisma/client`

2. **Supabase Integration**:
   - Client-side: `lib/supabase/client.js`
   - Server-side: `lib/supabase/server.js`
   - Middleware handles auth state

3. **User Registration**: Automatic user creation in database on first Supabase login (see `components/AuthProvider.js:handleUserRegistration`)

4. **Development Setup**: Uses ngrok for HTTPS tunneling required for OAuth callbacks

## Current Features

- Google OAuth authentication via Supabase
- User profile management
- Instagram account connection (OAuth)
- Settings page for managing connected accounts
- Responsive UI with TailwindCSS

## File Structure Notes

- App Router structure in `/app` directory
- API routes in `/app/api`
- Shared components in `/components`
- Utility functions in `/lib`
- Database schema in `/prisma/schema.prisma`