# CLAUDE.md - Project Instructions for Claude Code

This file provides guidance to Claude Code when working on this project.

## Project Overview

**TP Extractor** - A Luxembourg Transfer Pricing Analysis Tool built with Next.js 14, TypeScript, and Anthropic Claude API.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes + Convex (database, auth, real-time)
- **AI**: Anthropic Claude API (Claude Sonnet)
- **Database**: Convex with Clerk authentication
- **PDF**: react-pdf / pdf.js
- **Validation**: Zod schemas
- **Theme**: Dark mode first

## Project Structure

```
/                       # Root directory
  convex/              # Convex backend (schema, functions, auth)
  src/
    app/               # Next.js App Router pages and API routes
    components/        # React components (shadcn/ui based)
    lib/               # Utilities, Claude client, schemas
    types/             # TypeScript interfaces
  public/              # Static assets
  convex.json          # Convex codegen config
  .env.local           # API keys (not committed)
```

## Development Commands

```bash
# Start both servers (run in separate terminals)
npm run dev            # Start Next.js dev server
npx convex dev         # Start Convex dev server

# Build and lint
npm run build          # Production build
npm run lint           # ESLint

# Convex commands
npx convex deploy      # Deploy to production
npx convex dashboard   # Open Convex dashboard
npx convex logs        # View logs
```

## Key Files

- `src/lib/schema.ts` - Zod validation schemas for extraction
- `src/lib/claude.ts` - Claude API client
- `src/lib/prompts.ts` - Extraction prompts
- `src/app/api/extract/route.ts` - Main extraction endpoint
- `convex/schema.ts` - Convex database schema
- `convex/extractions.ts` - Convex query/mutation functions

## Rules and Guidelines

Additional coding rules are in `.claude/rules/`:

- [convex-rules.md](.claude/rules/convex-rules.md) - Convex function syntax, validators, queries, mutations
- [convex-ai-docs.md](.claude/rules/convex-ai-docs.md) - AI code generation best practices with Convex

For Convex implementation details, see:
- [docs/convex-implementation-plan.md](docs/convex-implementation-plan.md)

## Testing

Features are tracked in `features.db` SQLite database using MCP tools.

## Pending Tasks

### User Allowlist (Authentication Restriction)
Implement custom email allowlist to restrict registration to pre-approved users only.
- Plan file: `.claude/plans/bubbly-crunching-crescent.md`
- Status: Planned, not implemented
- Files to modify: `convex/schema.ts`, `convex/auth.ts` (new), `src/components/auth-guard.tsx` (new), `src/components/convex-provider.tsx`

## Deployment

- **Vercel**: https://tp-extractor.vercel.app
- **Convex**: https://dashboard.convex.dev/d/cautious-trout-725

## CURRENT STATUS (January 9, 2026)

### FULLY WORKING - ALL ISSUES RESOLVED

Production app is fully functional at https://tp-extractor.vercel.app/analyze

**Architecture:**
- Frontend calls Convex action directly (bypasses Vercel timeout)
- Convex action calls Claude API (10-minute timeout)
- No more Vercel 10-second limit issues

### Issues Fixed (January 9)

1. **Schema Validation Bug**: Added `.nullable()` to 10+ optional schema fields
2. **Vercel Timeout**: Frontend now calls Convex directly via `useAction` hook
3. **Missing Convex Prod API Key**: Set `ANTHROPIC_API_KEY` in Convex production

### Key Files

| File | Purpose |
|------|---------|
| `convex/actions/extractPdf.ts` | Convex action - calls Claude API directly |
| `src/hooks/useStreamingExtraction.ts` | Frontend hook - calls Convex via `useAction` |
| `src/lib/schema.ts` | Zod schemas with `.nullable()` for null values |
| `convex/package.json` | Anthropic SDK dependency for Convex |

See `.claude/session-notes.md` for full debugging history.

---

## Recent Changes (January 2026)

### Direct Convex Calls from Frontend (January 9)
- Modified `src/hooks/useStreamingExtraction.ts` to use `useAction` from `convex/react`
- Frontend calls Convex action directly, bypassing Vercel entirely
- Eliminates Vercel Hobby 10-second timeout issue completely

### Convex Action for PDF Extraction (January 9)
- Created `convex/actions/extractPdf.ts` - Runs Claude API with 10-minute timeout
- Contains full extraction prompts (SYSTEM_PROMPT, USER_PROMPT)
- Comprehensive error handling for API errors

### Schema Validation Bug (January 9)
- Added `.nullable()` to all optional string/number fields in `src/lib/schema.ts`
- Fields: `note_reference`, `country`, `percentage`, `account_caption`, `caveats`, etc.
- Claude returns `null` for missing values; Zod `.optional()` only allows `undefined`

### PDF Upload Error Handling (January 8)
- Added comprehensive error handling in `src/lib/claude.ts`
- Lazy initialization of Anthropic client for serverless environments
- User-friendly error messages for invalid PDFs, connection errors, rate limits

### Known Issues
- None - production tested and working

### Session Notes
See `.claude/session-notes.md` for detailed debugging history.

## Important Notes

- API key stored in `.env.local` - never commit
- File size limit: 50MB for PDF uploads
- Cost: ~$0.20-0.30 per extraction using Claude Sonnet
- Test PDFs must be valid, complete PDF documents (not just headers)
