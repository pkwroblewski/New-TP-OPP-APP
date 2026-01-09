# Vercel Timeout Fix - COMPLETED

**Date**: January 9, 2026
**Status**: COMPLETE - Production Working

## Problem Summary

The TP Extractor app was failing on Vercel production with two errors:
1. "Unable to connect to the AI service" / "Server Error"
2. "Extraction validation failed: Expected string, received null"

## Root Causes

### 1. Vercel Hobby Timeout (10 seconds)
- PDF extraction takes 60-90 seconds via Claude API
- Vercel Hobby plan has a hard 10-second function timeout
- `maxDuration = 60` config only works on Vercel Pro

### 2. Schema Validation
- Zod `.optional()` allows `undefined` but rejects `null`
- Claude API returns `null` for missing values
- Multiple schema fields needed `.nullable()` added

### 3. Missing Convex Production API Key
- `ANTHROPIC_API_KEY` was only set in Convex dev environment
- Production environment was missing the key

## Solution Implemented

### Architecture Change
```
OLD: Client → Vercel API → Convex Action → Claude API
     (Vercel times out after 10 seconds)

NEW: Client → Convex Action → Claude API
     (Convex has 10-minute timeout, bypasses Vercel)
```

### Files Modified

| File | Change |
|------|--------|
| `convex/actions/extractPdf.ts` | CREATED - Convex action with Claude API call |
| `convex/package.json` | CREATED - Anthropic SDK dependency |
| `src/hooks/useStreamingExtraction.ts` | MODIFIED - Uses `useAction` to call Convex directly |
| `src/lib/schema.ts` | MODIFIED - Added `.nullable()` to 10+ fields |
| `tsconfig.json` | MODIFIED - Added `@convex/*` path alias |

### Environment Variables

| Variable | Location | Action |
|----------|----------|--------|
| `ANTHROPIC_API_KEY` | Convex Production | Added via `npx convex env set --prod` |
| `CONVEX_URL` | Vercel Production | Added via `vercel env add` |

## Testing Results

- PDF extraction: WORKING
- 60-90 second extractions: WORKING (no timeout)
- Schema validation: WORKING (null values accepted)
- Production URL: https://tp-extractor.vercel.app/analyze

## Key Learnings

1. Vercel Hobby 10-second limit is HARD - cannot be configured around
2. For long-running operations, call Convex directly from frontend
3. Claude API returns `null` not `undefined` for missing values
4. Always set environment variables in BOTH dev and prod environments
