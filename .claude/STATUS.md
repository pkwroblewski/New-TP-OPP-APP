# Project Status

**Last Updated:** January 31, 2026
**Status:** Production - Fully Working

## Current Architecture

```
Frontend (Next.js) ──▶ Convex Action ──▶ Claude API
        │                   │
        ▼                   ▼
   Clerk Auth          Convex DB
```

- Frontend calls Convex action directly (bypasses Vercel timeout)
- Convex action calls Claude API (10-minute timeout)
- No more Vercel 10-second limit issues

## Key URLs

| Environment | URL |
|-------------|-----|
| **Production** | https://tp-extractor.vercel.app |
| **Analyze Page** | https://tp-extractor.vercel.app/analyze |
| **Convex Dashboard** | https://dashboard.convex.dev/d/cautious-trout-725 |

## Known Issues

None - production tested and working.

## Key Files

| File | Purpose |
|------|---------|
| `convex/actions/extractPdf.ts` | Convex action - calls Claude API with TP prompts |
| `src/hooks/useStreamingExtraction.ts` | Frontend hook - calls Convex via `useAction` |
| `src/lib/schema.ts` | Zod schemas for extraction validation (frontend) |
| `convex/lib/extraction_schema.ts` | Zod schemas mirror (Convex runtime) |
| `src/types/extraction.ts` | TypeScript interfaces for extraction result |
| `convex/schema.ts` | Convex database schema |

## Schema Version

Current: **2.0.0** (Phase 2 - Schema Consolidation)

## Recent Debugging History

See [session-notes.md](./session-notes.md) for full debugging history.
