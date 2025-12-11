# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InstaCrawl is a Next.js 15 application for influencer relationship management and email marketing. It enables users to connect Instagram accounts, manage influencers, create email templates with dynamic variables, and send personalized emails via SMTP (Gmail or MailPlug).

## Key Commands

### Development
```bash
npm run dev       # Start development server on port 3001
npm run build     # Build for production (includes prisma db push)
npm run start     # Start production server
yarn dev          # Alternative: Start dev server (port 3001)
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
   - Key models: User, InstagramAccount, Influencer, EmailTemplate, EmailSent/Received
   - Dynamic influencer fields system with InfluencerField model
   - User creation happens automatically on first login via `/api/users` endpoint

3. **Instagram Integration**:
   - OAuth flow: `/api/instagram/auth` → Instagram → `/api/instagram/callback`
   - Stores Instagram tokens in database
   - Business account integration with specific scopes

4. **API Structure**:
   - `/api/users` - User CRUD operations
   - `/api/instagram/*` - Instagram OAuth flow and account management
   - `/api/influencers` - Influencer management with dynamic fields
   - `/api/email-templates` - Email template CRUD with variables and conditions
   - `/api/emails/*` - Email sending (SMTP), receiving (POP3/IMAP), and management
   - `/api/upload` - File uploads for images and attachments to Supabase Storage

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

5. **Email System**:
   - Dual provider support: Gmail SMTP and MailPlug (Korean enterprise email service)
   - Template system with variable substitution using {{variableName}} syntax
   - Conditional logic in templates with {{#if condition}}...{{/if}}
   - POP3/IMAP support for receiving emails
   - Bulk sending with personalization per influencer
   - Image and attachment support via Supabase Storage

## Current Features

- Google OAuth authentication via Supabase
- User profile management with dual email provider support (Gmail/MailPlug)
- Instagram account connection (OAuth)
- Dynamic influencer management with customizable fields
- Email template system with variables and conditional logic
- Bulk email sending with personalization
- Email inbox with POP3/IMAP support
- File uploads (images and attachments) via Supabase Storage
- Settings page for SMTP configuration and connected accounts
- Responsive UI with TailwindCSS v4

## File Structure Notes

- Main application is in `/instacrawl` subdirectory
- App Router structure in `/instacrawl/app` directory
- API routes in `/instacrawl/app/api`
- Shared components in `/instacrawl/components`
- Utility functions in `/instacrawl/lib`
- Database schema in `/instacrawl/prisma/schema.prisma`