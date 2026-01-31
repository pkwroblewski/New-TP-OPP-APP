# Changelog

All notable changes to TP Extractor.

## January 2026

### January 31
- **Phase 3-5: Architecture Robustness, UI/UX, Enhanced Scoring** (deployed)
  - Added exponential backoff with jitter (`convex/lib/retry_helpers.ts`)
  - Added monthly usage tracking (`convex/usage.ts`)
  - Added audit trail logging (`convex/audit.ts`)
  - Added rate limiting at 10 requests/minute (`convex/rateLimit.ts`)
  - Added 3 new database tables: `audit_trail`, `usage_tracking`, `rate_limits`
  - Integrated retry, audit, and rate limit into `extractPdf` action
  - Added enhanced Luxembourg-specific scoring rules to prompts
  - Added TP Documentation Status card component
  - Added Functional Analysis (FAR) card component
  - Added Arms Length Assessment card component
  - Added IP Transactions table component
  - Added Service Arrangements table component
  - Integrated new cards into extraction detail pages
  - Added helper formatting functions to `src/lib/utils.ts`
- **Phase 2: Schema Consolidation**
  - Added Zod schemas for all new Phase 1 prompt fields
  - New schemas: `FunctionalAnalysisSchema`, `TPDocumentationSchema`, `IPTransactionsSchema`, `ServiceArrangementsSchema`, `ArmsLengthAssessmentSchema`
  - Enhanced `DetailedLoanSchema`: security_type, guarantee_from_parent, rate_benchmark, margin_bps, covenant_indicators, payment_schedule
  - Enhanced `EntityClassificationSchema`: sub_type field for Luxembourg vehicles
  - Added `arms_length_assessment` to `TPAnalysisSchema`
  - Added `schema_version` field for future schema migrations
  - Updated Convex database schema with `schemaVersion` field
  - Mirrored all schemas in both `src/lib/schema.ts` and `convex/lib/extraction_schema.ts`
  - Updated TypeScript interfaces in `src/types/extraction.ts`
- **Phase 1: Prompt Enhancement for Luxembourg TP Compliance**
  - Added Luxembourg Transfer Pricing Context to SYSTEM_PROMPT
  - Added Arm's Length Principle Validation guidance
  - Added TP Documentation Extraction guidelines
  - Added Functional Analysis Framework (FAR) instructions
  - Added IP/Royalty and Service Arrangement detection
  - New JSON fields: `functional_analysis`, `tp_documentation`, `ip_transactions`, `service_arrangements`
  - New `arms_length_assessment` section in `tp_analysis`
  - Enhanced `detailed_loans` with: `security_type`, `guarantee_from_parent`, `rate_benchmark`, `margin_bps`, `covenant_indicators`, `payment_schedule`
  - Added `sub_type` to `entity_classification` for Luxembourg vehicle types
  - Enhanced scoring rules with TP documentation and substance triggers
- **Phase 0: Security & Architecture Cleanup**
  - Updated .gitignore with security patterns
  - Created modular documentation structure (.claude/STATUS.md, CHANGELOG.md, docs/ARCHITECTURE.md)
  - Moved root clutter to appropriate directories (scripts/, .local/, docs/)

### January 10
- Fixed 15 additional nullable schema fields
- Fields fixed: `counterparty_name`, `counterparty`, `name`, `code`, `description`, `priority`, `category`, `source`, `score_rationale`, `content`, `overall_tp_opportunity_score`
- Root cause: Claude returns `null` for missing values; Zod's `.optional()` only allows `undefined`

### January 9
- **Direct Convex Calls**: Modified `src/hooks/useStreamingExtraction.ts` to use `useAction` from `convex/react`
- **Bypass Vercel Timeout**: Frontend calls Convex action directly, eliminating Vercel Hobby 10-second timeout
- **Created extractPdf Action**: `convex/actions/extractPdf.ts` runs Claude API with 10-minute timeout
- **Schema Validation Bug**: Added `.nullable()` to optional string/number/enum fields

### January 8
- Added comprehensive PDF upload error handling in `src/lib/claude.ts`
- Lazy initialization of Anthropic client for serverless environments
- User-friendly error messages for invalid PDFs, connection errors, rate limits

## December 2025

### December 2025 (Initial Release)
- Initial production deployment
- PDF extraction with Claude AI
- Convex backend integration
- Clerk authentication
- Luxembourg TP analysis features
