# Session Notes - January 9, 2026

## Current Status: FULLY WORKING - ALL ISSUES RESOLVED

### Issue 1: Schema Validation Bug - FIXED
**Error**: `Extraction validation failed: Expected string, received null`
**Root Cause**: Multiple schema fields had `.optional()` which allows `undefined` but rejects `null`. Claude returns `null` for missing values.
**Fix Applied**: Added `.nullable()` to all optional string fields across multiple schemas:
- `BoardMemberSchema.address`, `role`
- `BalanceSheetItemSchema.note_reference`
- `ProfitAndLossItemSchema.note_reference`
- `ShareholdingDetailSchema.country`, `percentage`
- `LoanDetailSchema.note_reference`
- `DetailedLoanSchema.note_reference`, `account_caption`
- `TPFlagSchema.caveats`
**Status**: FIXED - Production tested and working

### Issue 2: Vercel Timeout - FIXED (Direct Convex Calls)
**Error**: "Unable to connect to the AI service" / "Server Error" (on Vercel production)
**Root Cause**: Vercel Hobby plan has hard 10-second function timeout. PDF extraction takes 60-90 seconds. Even calling Convex from Vercel API route still times out because Vercel kills the function.
**Solution**: Modified frontend to call Convex action DIRECTLY (bypasses Vercel entirely)
**Status**: FIXED - Production tested and working

### Issue 3: Missing Convex Production API Key - FIXED
**Error**: Server Error (500)
**Root Cause**: `ANTHROPIC_API_KEY` was only set in Convex dev environment, not production
**Fix Applied**: `npx convex env set ANTHROPIC_API_KEY <key> --prod`
**Status**: FIXED

### Implementation Summary

**Architecture Change:**
- OLD: Client → Vercel API → Convex Action → Claude API (Vercel timeout after 10s)
- NEW: Client → Convex Action → Claude API (Convex 10-minute timeout)

**Files Modified/Created (January 9):**
1. `src/lib/schema.ts` - Added `.nullable()` to 10+ optional fields
2. `convex/package.json` - CREATED with `@anthropic-ai/sdk` dependency
3. `convex/actions/extractPdf.ts` - CREATED (Convex action for PDF extraction with full prompts)
4. `src/hooks/useStreamingExtraction.ts` - MODIFIED to call Convex directly via `useAction`
5. `src/app/api/extract/stream/route.ts` - MODIFIED (now backup, not primary)
6. `tsconfig.json` - Added `@convex/*` path alias
7. Vercel env: Added `CONVEX_URL`
8. Convex prod env: Added `ANTHROPIC_API_KEY`

### Deployments
- Convex: https://fast-oriole-516.convex.cloud
- Vercel: https://tp-extractor.vercel.app

### Production Test Results
- PDF extraction: WORKING
- 60-90 second extractions: WORKING (no timeout)
- Schema validation: WORKING (null values accepted)

### Plan File
Full plan saved at: `.claude/plans/rustling-coalescing-beacon.md`

---

# Session Notes - January 8, 2026

## Issue Investigated
User reported PDF upload errors on `/analyze` page that had been occurring for hours.

## Root Causes Found

### 1. Invalid Test PDF Files
- `test.pdf`, `test2.pdf`, `test-loading.pdf`, `large-test.pdf` were corrupt/incomplete
- They only contained PDF header (`%PDF-1.4`) with no actual content (9 bytes)
- Claude API rejected them with "The PDF specified was not valid"
- **Solution**: Deleted all invalid test PDFs

### 2. Poor Error Handling
- Raw JSON errors from Claude API were displayed to users
- No handling for connection errors, API overload, etc.
- **Solution**: Added comprehensive error handling in `src/lib/claude.ts`

### 3. React Key Warning
- `DetailedLoansTable` component had key prop on wrong element (inside fragment instead of on fragment)
- **Solution**: Changed `<>` to `<Fragment key={index}>` in `src/components/data-tables/detailed-loans-table.tsx`

### 4. Serverless Environment Issue (Vercel)
- Anthropic client was initialized at module load time
- Environment variables may not be available during cold starts
- **Solution**: Changed to lazy initialization with `getAnthropicClient()` function

## Files Modified

### `src/lib/claude.ts`
- Added lazy Anthropic client initialization
- Added comprehensive error handling for:
  - APIConnectionError
  - Invalid PDF errors
  - Rate limiting (429)
  - Authentication errors (401)
  - API overload (529)
  - Network errors
- Added console logging for debugging

### `src/components/data-tables/detailed-loans-table.tsx`
- Added `Fragment` import from React
- Changed `<>` to `<Fragment key={index}>` in loans.map()
- Changed `</>` to `</Fragment>`

### Deleted Files
- `test.pdf`
- `test2.pdf`
- `test-loading.pdf`
- `large-test.pdf`

## Commits Made
1. `b2ca495` - Fix PDF upload error handling and React key warning
2. `67928d0` - Improve API error handling with connection error support
3. `a7ca330` - Fix Anthropic client initialization for serverless environments

## Current Status
- All changes committed and pushed to GitHub
- Deployed to Vercel (3 deployments)
- **NEEDS TESTING**: User should test PDF upload on https://tp-extractor.vercel.app/analyze

## Potential Remaining Issues
1. **Vercel Function Timeout**: Hobby plan has 10-second limit, PDF extraction takes 30-60 seconds. May need Vercel Pro or alternative approach.
2. **API Key Verification**: If "Connection error" persists, verify ANTHROPIC_API_KEY in Vercel env vars is correct.

## How to Test
1. Go to https://tp-extractor.vercel.app/analyze
2. Sign in if required
3. Upload a valid Luxembourg company PDF (e.g., from Downloads folder like B269292.pdf)
4. Should see extraction progress and results
5. If error occurs, note the exact error message for debugging

## Next Steps if Issues Persist
1. Check Vercel logs: `vercel logs tp-extractor.vercel.app`
2. Verify API key: `vercel env ls` and compare with `.env.local`
3. Consider upgrading to Vercel Pro for longer function timeouts
4. Test locally with `npm run dev` to isolate Vercel-specific issues
