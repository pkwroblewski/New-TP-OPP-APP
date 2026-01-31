# Project Status

**Last Updated:** January 31, 2026
**Status:** Production - All Phases Complete

## Enhancement Phases

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 0 | Security & Architecture Cleanup | ✅ COMPLETE |
| Phase 1 | Prompt Enhancement | ✅ COMPLETE |
| Phase 2 | Schema Consolidation | ✅ COMPLETE |
| Phase 3 | Architecture Robustness | ✅ COMPLETE |
| Phase 4 | UI/UX Enhancements | ✅ COMPLETE |
| Phase 5 | Enhanced Scoring & Luxembourg Rules | ✅ COMPLETE |

## Current Architecture

```
Frontend (Next.js) ──▶ Convex Action ──▶ Claude API
        │                   │
        ▼                   ▼
   Clerk Auth          Convex DB
                           │
                    ┌──────┴──────┐
                    ▼      ▼      ▼
               extractions audit  usage
                         _trail  _tracking
```

- Frontend calls Convex action directly (bypasses Vercel timeout)
- Convex action calls Claude API (10-minute timeout)
- Rate limiting: 10 requests/minute per user
- Retry logic with exponential backoff
- Audit trail for all extractions
- Monthly usage tracking

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
| `convex/actions/extractPdf.ts` | Main extraction action with retry, audit, rate limit |
| `convex/lib/retry_helpers.ts` | Exponential backoff with jitter |
| `convex/audit.ts` | Audit trail logging |
| `convex/usage.ts` | Monthly usage tracking |
| `convex/rateLimit.ts` | Rate limiting (10/min) |
| `src/hooks/useStreamingExtraction.ts` | Frontend hook - calls Convex via `useAction` |
| `src/lib/schema.ts` | Zod schemas for extraction validation |
| `src/types/extraction.ts` | TypeScript interfaces for extraction result |
| `convex/schema.ts` | Convex database schema |

## Database Tables

| Table | Purpose |
|-------|---------|
| `extractions` | Extraction results |
| `audit_trail` | Logs all extraction attempts |
| `usage_tracking` | Monthly usage per user |
| `rate_limits` | Request timestamps for rate limiting |

## Schema Version

Current: **3.0.0** (All Phases Complete)

## Recent Debugging History

See [session-notes.md](./session-notes.md) for full debugging history.
