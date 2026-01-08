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
