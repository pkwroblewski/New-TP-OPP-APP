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
tp-extractor/           # Main Next.js application
  convex/              # Convex backend (schema, functions, auth)
  src/
    app/               # Next.js App Router pages and API routes
    components/        # React components (shadcn/ui based)
    lib/               # Utilities, Claude client, schemas
    types/             # TypeScript interfaces
  convex.json          # Convex codegen config
  .env.local           # API keys (not committed)
```

## Development Commands

```bash
# From root directory
npm run dev            # Start dev server (runs tp-extractor)

# From tp-extractor directory
npm run dev            # Start Next.js dev server
npx convex dev         # Start Convex dev server (run in separate terminal)
npm run build          # Production build
npm run lint           # ESLint

# Convex commands
npx convex deploy      # Deploy to production
npx convex dashboard   # Open Convex dashboard
npx convex logs        # View logs
```

## Key Files

- `tp-extractor/src/lib/schema.ts` - Zod validation schemas for extraction
- `tp-extractor/src/lib/claude.ts` - Claude API client
- `tp-extractor/src/lib/prompts.ts` - Extraction prompts
- `tp-extractor/src/app/api/extract/route.ts` - Main extraction endpoint
- `tp-extractor/convex/schema.ts` - Convex database schema
- `tp-extractor/convex/extractions.ts` - Convex query/mutation functions

## Rules and Guidelines

Additional coding rules are in `.claude/rules/`:

- [convex-rules.md](.claude/rules/convex-rules.md) - Convex function syntax, validators, queries, mutations
- [convex-ai-docs.md](.claude/rules/convex-ai-docs.md) - AI code generation best practices with Convex

For Convex implementation details, see:
- [tp-extractor/docs/convex-implementation-plan.md](tp-extractor/docs/convex-implementation-plan.md)

## Testing

Features are tracked in `features.db` SQLite database using MCP tools.

## Important Notes

- API key stored in `.env.local` - never commit
- File size limit: 50MB for PDF uploads
- Cost: ~$0.20-0.30 per extraction using Claude Sonnet
