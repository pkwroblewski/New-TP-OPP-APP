# TP Extractor Enhancement Plan
## Comprehensive Review & Improvement Roadmap

**Project:** Luxembourg Transfer Pricing Analysis Tool
**Date:** January 31, 2026
**Scope:** Security hardening, architecture cleanup, documentation restructuring, prompt optimization, Luxembourg TP compliance

---

## Executive Summary

This plan addresses **five major improvement areas** organized into **6 phases**:

| Phase | Area | Priority | Status |
|-------|------|----------|--------|
| **Phase 0** | Security & Architecture Cleanup | 🔴 CRITICAL | ✅ COMPLETE |
| **Phase 1** | Prompt Enhancement | High | ✅ COMPLETE |
| **Phase 2** | Schema Consolidation | High | ✅ COMPLETE |
| **Phase 3** | Architecture Robustness | Medium | ✅ COMPLETE |
| **Phase 4** | UI/UX Enhancements | Medium | ✅ COMPLETE |
| **Phase 5** | Luxembourg-Specific Rules | High | ✅ COMPLETE |

---

# PHASE 0: SECURITY & ARCHITECTURE CLEANUP
**Duration:** 1-2 days | **Priority:** 🔴 CRITICAL | **Risk:** High if not addressed

## 0.1 SECURITY HARDENING

### Task 0.1.1: Rotate Exposed API Keys (URGENT)

**Issue Identified:** Multiple `.env*` files with API keys are in git history.

**Immediate Actions:**
1. **Anthropic API Key** - Rotate at https://console.anthropic.com/settings/keys
2. **Clerk Keys** - Rotate at https://dashboard.clerk.com
3. **Convex Deployment** - Verify environment variables in Convex dashboard

### Task 0.1.2: Clean Git History

**Commands to execute (after key rotation):**
```bash
# Option 1: Use BFG Repo-Cleaner (recommended)
# Install: brew install bfg (Mac) or download from git-scm.com

# Create backup first
git clone --mirror . ../tp-extractor-backup.git

# Remove sensitive files from history
bfg --delete-files .env.local
bfg --delete-files '.env.vercel*'

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force

# Option 2: If BFG not available, use git filter-branch (slower)
```

### Task 0.1.3: Update .gitignore

**File:** `.gitignore`

**Add these entries:**
```gitignore
# Secrets (explicit patterns)
.env
.env.local*
.env.*.local
.env.vercel*
*.pem
*.key

# Local data & artifacts
.local/
*.db
nul
*.sqlite
*.sqlite3

# Claude settings (managed externally)
.claude_settings.json
.claude_assistant_settings.json
.agent.lock

# Test artifacts
test-*.txt
invalid.txt

# Scripts output
scripts/output/

# OS files
.DS_Store
Thumbs.db
Desktop.ini

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# Build artifacts
.next/
.turbo/
.vercel/
out/
dist/
build/
```

### Task 0.1.4: Remove Sensitive Files from Repo

**Files to remove (after ensuring .gitignore updated):**
```bash
git rm --cached .env.local 2>/dev/null || true
git rm --cached .env.vercel* 2>/dev/null || true
git rm --cached nul 2>/dev/null || true
git rm --cached *.db 2>/dev/null || true
```

---

## 0.2 PROJECT FOLDER REORGANIZATION

### Task 0.2.1: Create Standard Directories

**Create these folders:**
```
scripts/           # Utility scripts
.local/            # Local runtime data (gitignored)
.local/data/       # SQLite databases
.local/artifacts/  # Test files
```

**Commands:**
```bash
mkdir -p scripts
mkdir -p .local/data
mkdir -p .local/artifacts
```

### Task 0.2.2: Move Root Clutter

| File | Move To | Action |
|------|---------|--------|
| `init.sh` | `scripts/init.sh` | Move |
| `create-large-file.js` | `scripts/create-large-file.js` | Move |
| `features.db` | `.local/data/features.db` | Move (if needed) |
| `assistant.db` | `.local/data/assistant.db` | Move (if needed) |
| `invalid.txt` | `.local/artifacts/invalid.txt` | Move or delete |
| `test-invalid.txt` | `.local/artifacts/test-invalid.txt` | Move or delete |
| `app_spec.txt` | `docs/app_spec.txt` | Move |
| `claude-progress.txt` | `.claude/progress.txt` | Move |
| `nul` | (delete) | Delete Windows artifact |

### Task 0.2.3: Organize src/components/

**Target Structure:**
```
src/components/
├── layout/                    # Layout components
│   ├── auth-header.tsx
│   ├── logo.tsx
│   └── pdf-sidebar.tsx
├── extraction/                # Extraction workflow
│   ├── upload-zone.tsx
│   ├── progress-grid.tsx
│   ├── results-dashboard.tsx
│   └── streaming-results-dashboard.tsx
├── analysis/                  # TP analysis display
│   ├── summary-cards.tsx
│   ├── tp-flags.tsx
│   ├── capitalization-gauge.tsx
│   ├── spread-analysis-section.tsx
│   └── board-managers-card.tsx
├── data-tables/               # Data display tables
│   ├── balance-sheet-table.tsx
│   ├── pnl-table.tsx
│   ├── ic-details-table.tsx
│   ├── detailed-loans-table.tsx
│   └── raw-json-viewer.tsx
├── export/                    # Export functionality
│   └── export-buttons.tsx
├── common/                    # Shared utilities
│   ├── loading-skeletons.tsx
│   └── copyable-cell.tsx
└── ui/                        # shadcn/ui base components
```

---

## 0.3 DOCUMENTATION RESTRUCTURING

### Task 0.3.1: Modularize CLAUDE.md

**Principle:** CLAUDE.md should be the **index/quick reference** with links to detailed docs.

**NEW CLAUDE.md Structure:**
```markdown
# CLAUDE.md - Project Instructions

## Quick Reference
- **Project**: TP Extractor - Luxembourg Transfer Pricing Analysis
- **Tech Stack**: Next.js 14 + Convex + Claude AI + Clerk Auth
- **Status**: Production - See [.claude/STATUS.md](.claude/STATUS.md)

## Documentation Index
| Document | Purpose |
|----------|---------|
| [.claude/STATUS.md](.claude/STATUS.md) | Current status & known issues |
| [.claude/CHANGELOG.md](.claude/CHANGELOG.md) | Recent changes |
| [.claude/rules/](.claude/rules/) | Coding rules & guidelines |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture |
| [docs/TP_ANALYSIS_CONFIG.md](docs/TP_ANALYSIS_CONFIG.md) | TP analysis rules |

## Development Commands
[Keep existing commands section - it's useful for quick reference]

## Key Files
[Keep existing key files section]

## Rules
See [.claude/rules/](.claude/rules/) for coding standards.
```

### Task 0.3.2: Create .claude/STATUS.md

**File:** `.claude/STATUS.md`

**Content:** Move "CURRENT STATUS" and "Known Issues" from CLAUDE.md here.

```markdown
# Project Status

**Last Updated:** January 31, 2026
**Status:** ✅ Production - Fully Working

## Current Architecture
- Frontend calls Convex action directly (bypasses Vercel timeout)
- Convex action calls Claude API (10-minute timeout)
- No more Vercel 10-second limit issues

## Known Issues
- None - production tested and working

## Key URLs
- **Production**: https://tp-extractor.vercel.app
- **Convex Dashboard**: https://dashboard.convex.dev/d/cautious-trout-725
```

### Task 0.3.3: Create .claude/CHANGELOG.md

**File:** `.claude/CHANGELOG.md`

**Content:** Move "Recent Changes" section from CLAUDE.md here.

```markdown
# Changelog

## January 2026

### January 10
- Fixed 15 additional nullable schema fields

### January 9
- Direct Convex calls from frontend (bypass Vercel timeout)
- Created `convex/actions/extractPdf.ts`
- Added `.nullable()` to schema fields

### January 8
- Added comprehensive PDF upload error handling
- Lazy initialization of Anthropic client
```

### Task 0.3.4: Create docs/README.md (Index)

**File:** `docs/README.md`

```markdown
# Documentation Index

## Architecture
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design & data flow

## Specifications
- [Spec.md](./Spec.md) - Application specification
- [TP_ANALYSIS_CONFIG.md](./TP_ANALYSIS_CONFIG.md) - TP analysis rules

## Implementation
- [convex-implementation-plan.md](./convex-implementation-plan.md) - Backend architecture

## Prompts
- [TP_EXTRACTOR_PROMPT.md](./TP_EXTRACTOR_PROMPT.md) - Claude extraction prompts

## Enhancement Plans
- [TP_EXTRACTOR_ENHANCEMENT_PLAN.md](./TP_EXTRACTOR_ENHANCEMENT_PLAN.md) - Future improvements
```

### Task 0.3.5: Create docs/ARCHITECTURE.md

**File:** `docs/ARCHITECTURE.md`

```markdown
# System Architecture

## Overview
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Convex        │────▶│   Claude API    │
│   (Next.js)     │     │   (Backend)     │     │   (Anthropic)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Clerk Auth    │     │   Convex DB     │
│   (External)    │     │   (PostgreSQL)  │
└─────────────────┘     └─────────────────┘
```

## Data Flow
1. User uploads PDF via UploadZone component
2. PDF stored in Convex file storage
3. Frontend calls Convex action via useAction hook
4. Convex action calls Claude API with PDF
5. Claude extracts structured data
6. Data validated with Zod schemas
7. Results stored in Convex database
8. Frontend displays results reactively

## Key Directories
[Document folder purposes]
```

### Task 0.3.6: Create .claude/rules/README.md

**File:** `.claude/rules/README.md`

```markdown
# Coding Rules & Guidelines

## Available Rules

| Rule File | Purpose |
|-----------|---------|
| [convex-rules.md](./convex-rules.md) | Convex function syntax, validators, queries, mutations |
| [convex-ai-docs.md](./convex-ai-docs.md) | AI code generation best practices |

## Adding New Rules
Create new `.md` files in this directory. They will be automatically loaded by Claude Code.
```

### Task 0.3.7: Clean Up Stale References

**In CLAUDE.md, remove:**
- Reference to `.claude/plans/bubbly-crunching-crescent.md` (doesn't exist)
- Detailed status information (moved to STATUS.md)
- Recent changes (moved to CHANGELOG.md)

---

## 0.4 FINAL FOLDER STRUCTURE

**Target Project Structure:**
```
TP-Extractor/
├── .claude/                          # AI assistant configuration
│   ├── README.md                     # NEW: Index of .claude contents
│   ├── STATUS.md                     # NEW: Current status
│   ├── CHANGELOG.md                  # NEW: Recent changes
│   ├── session-notes.md              # Debugging history
│   ├── rules/
│   │   ├── README.md                 # NEW: Rules index
│   │   ├── convex-rules.md
│   │   └── convex-ai-docs.md
│   └── plans/
│       └── vercel-timeout-fix.md
├── .local/                           # NEW: Local runtime data (gitignored)
│   ├── data/
│   │   ├── features.db
│   │   └── assistant.db
│   └── artifacts/
├── convex/                           # Backend
│   ├── actions/
│   ├── lib/
│   ├── _generated/
│   ├── schema.ts
│   ├── extractions.ts
│   └── auth.config.ts
├── docs/                             # Documentation
│   ├── README.md                     # NEW: Docs index
│   ├── ARCHITECTURE.md               # NEW: System design
│   ├── Spec.md
│   ├── TP_ANALYSIS_CONFIG.md
│   ├── TP_EXTRACTOR_PROMPT.md
│   ├── TP_EXTRACTOR_ENHANCEMENT_PLAN.md
│   └── convex-implementation-plan.md
├── scripts/                          # NEW: Utility scripts
│   ├── init.sh
│   └── create-large-file.js
├── src/
│   ├── app/
│   ├── components/                   # Reorganized by feature
│   ├── hooks/
│   ├── lib/
│   └── types/
├── public/
├── CLAUDE.md                         # Streamlined index
├── README.md
├── .gitignore                        # Updated
└── [config files]
```

---

## Verification for Phase 0

1. **Security Check:**
   - [ ] API keys rotated in Anthropic console
   - [ ] API keys rotated in Clerk dashboard
   - [ ] Git history cleaned (no secrets visible)
   - [ ] `.gitignore` updated and committed

2. **Structure Check:**
   - [ ] No loose files in root (except config)
   - [ ] scripts/ folder exists with utilities
   - [ ] .local/ folder exists and is gitignored
   - [ ] docs/README.md exists

3. **Documentation Check:**
   - [ ] CLAUDE.md is streamlined (~50% smaller)
   - [ ] .claude/STATUS.md contains current status
   - [ ] .claude/CHANGELOG.md contains recent changes
   - [ ] All cross-references work

---

# PHASE 1: PROMPT ENHANCEMENT FOR LUXEMBOURG TP COMPLIANCE
**Duration:** 2-3 days | **Risk:** Low | **Impact:** High

## Task 1.1: Add Arm's Length Principle Validation

**File:** `convex/actions/extractPdf.ts` (SYSTEM_PROMPT section)

Add to SYSTEM_PROMPT:
```
ARM'S LENGTH PRINCIPLE VALIDATION:
- For each IC financing transaction, assess if interest rate appears arm's length
- Compare implied rates to EUR benchmark rates (EURIBOR + typical credit spread)
- Flag rates significantly above/below market (outside 150-800 bps over EURIBOR for corporate loans)
- Note absence of documented pricing justification
- Assess credit quality of borrower based on financial statements
```

**File:** `src/lib/prompts.ts` (USER_PROMPT tp_analysis section)

Add new field:
```json
"arms_length_assessment": {
  "ic_loans_status": "compliant" | "needs_review" | "potentially_non_compliant" | "insufficient_data",
  "rate_comparison_to_market": "above_market" | "at_market" | "below_market" | "undetermined",
  "assessment_rationale": "explanation",
  "credit_quality_indicator": "investment_grade" | "sub_investment" | "distressed" | "not_determinable"
}
```

## Task 1.2: Add TP Documentation Status Extraction

**Files:** `convex/actions/extractPdf.ts`, `src/lib/prompts.ts`

Add to SYSTEM_PROMPT:
```
TP DOCUMENTATION EXTRACTION:
- Look for references to "Transfer Pricing Policy", "Master File", "Local File"
- Note any mention of benchmarking studies or comparable analysis
- Extract references to OECD Guidelines compliance
- Identify if transfer pricing method is disclosed (CUP, cost-plus, TNMM)
```

Add to USER_PROMPT:
```json
"tp_documentation": {
  "master_file_referenced": boolean,
  "local_file_referenced": boolean,
  "benchmarking_study_mentioned": boolean,
  "tp_policy_disclosed": boolean,
  "pricing_method_stated": "CUP" | "cost_plus" | "resale_minus" | "TNMM" | "profit_split" | "not_disclosed",
  "documentation_notes": ["any references found"]
}
```

## Task 1.3: Add Functional Analysis Framework (FAR)

Add to USER_PROMPT:
```json
"functional_analysis": {
  "functions_performed": ["financing", "investment_management", "treasury", "holding", "trading"],
  "assets_controlled": {
    "financial_assets": ["participations", "loans", "cash"],
    "intangible_assets": ["patents", "trademarks", "know_how"],
    "tangible_assets": ["equipment", "real_estate"]
  },
  "risks_assumed": ["credit_risk", "market_risk", "currency_risk", "operational_risk"],
  "decision_making_location": "Luxembourg" | "abroad" | "mixed" | "not_determinable",
  "substance_level": "significant" | "limited" | "minimal"
}
```

## Task 1.4: Enhanced Loan Documentation Prompts

Add to detailed_loans schema:
```json
{
  "security_type": "unsecured" | "secured" | "subordinated" | "not_specified",
  "guarantee_from_parent": boolean,
  "rate_benchmark": "EURIBOR" | "LIBOR" | "SOFR" | "fixed" | "not_specified",
  "margin_bps": number or null,
  "covenant_indicators": boolean,
  "payment_schedule": "bullet" | "amortizing" | "PIK" | "not_specified"
}
```

## Task 1.5: Add IP/Royalty Transaction Detection

Add to USER_PROMPT:
```json
"ip_transactions": {
  "royalty_income_detected": boolean,
  "royalty_expense_detected": boolean,
  "ip_assets_held": ["patent", "trademark", "software", "license"],
  "transactions": [
    {
      "type": "license_in" | "license_out" | "sale" | "purchase",
      "counterparty": "string",
      "amount": number,
      "royalty_rate": number or null,
      "ip_type": "string"
    }
  ]
}
```

## Task 1.6: Add Service Arrangement Detection

Add to USER_PROMPT:
```json
"service_arrangements": {
  "management_fees_detected": boolean,
  "arrangements": [
    {
      "service_type": "management" | "administrative" | "technical" | "treasury" | "other",
      "provider": "string",
      "recipient": "string",
      "annual_amount": number,
      "pricing_method": "cost_plus" | "fixed_fee" | "percentage" | "not_disclosed",
      "markup_percentage": number or null
    }
  ]
}
```

---

# PHASE 2: SCHEMA CONSOLIDATION & ENHANCEMENT
**Duration:** 3-4 days | **Risk:** Medium | **Impact:** High

## Task 2.1: Add New Zod Schemas

**Files to modify:**
- `src/lib/schema.ts`
- `convex/lib/extraction_schema.ts` (mirror changes)
- `src/types/extraction.ts` (add TypeScript interfaces)

**New schemas:** TPDocumentationSchema, FunctionalAnalysisSchema, ArmsLengthAssessmentSchema, IPTransactionsSchema, ServiceArrangementsSchema

## Task 2.2: Enhance DetailedLoan Schema

Add fields: security_type, guarantee_from_parent, rate_benchmark, margin_bps, covenant_indicators, payment_schedule

## Task 2.3: Enhance Entity Classification

Add: sub_type (soparfi, spf, sicar, etc.), luxembourg_vehicle_type

## Task 2.4: Update ExtractionResultSchema

Add optional sections for new schemas + schema_version field

## Task 2.5: Add Schema Version to Convex

Add `schemaVersion: v.optional(v.string())` to extractions table

---

# PHASE 3: ARCHITECTURE ROBUSTNESS
**Duration:** 3-4 days | **Risk:** Medium | **Impact:** Medium

## Task 3.1: Add Retry Logic with Exponential Backoff

**File to create:** `convex/lib/retry-helpers.ts`

## Task 3.2: Add Usage Tracking Table

**File:** `convex/schema.ts` - Add usage_tracking table

## Task 3.3: Add Rate Limiting

**File:** `convex/actions/extractPdf.ts` - Add rate limit check

## Task 3.4: Add Audit Trail Table

**File:** `convex/schema.ts` - Add extraction_audit table

---

# PHASE 4: UI/UX ENHANCEMENTS
**Duration:** 4-5 days | **Risk:** Low | **Impact:** Medium

## Task 4.1: Add TP Documentation Status Component
## Task 4.2: Add Functional Analysis Display
## Task 4.3: Add Arms Length Assessment Panel
## Task 4.4: Add IP/Royalty Transactions Table
## Task 4.5: Add Service Arrangements Table
## Task 4.6: Integrate into Extraction Detail Pages
## Task 4.7: Add PDF Report Export

---

# PHASE 5: ENHANCED SCORING & LUXEMBOURG-SPECIFIC RULES
**Duration:** 2 days | **Risk:** Low | **Impact:** High

## Task 5.1: Update Scoring Logic

Enhanced triggers:
- No TP documentation referenced → Score A
- Arms length status = "potentially_non_compliant" → Score A
- IP transactions without benchmarking → Score B
- Limited substance indicators → Score B

## Task 5.2: Add Luxembourg-Specific Guidance

Add to SYSTEM_PROMPT:
```
LUXEMBOURG TRANSFER PRICING CONTEXT:
- Luxembourg has no statutory thin capitalization ratio
- Historical 85:15 debt-to-equity guideline is indicative only
- SOPARFI structures require demonstrable economic substance
- Interest rates should be comparable to third-party market rates
- Management fees must follow cost-plus or comparable method
- Transfer pricing documentation (Master File/Local File) required for large groups
- OECD Transfer Pricing Guidelines adopted via Circular L.I.R. n° 56/1 - 56bis/1
```

---

## Critical Files Summary

| Phase | File | Changes |
|-------|------|---------|
| 0 | `.gitignore` | Security patterns |
| 0 | `CLAUDE.md` | Streamline, add links |
| 0 | `.claude/STATUS.md` | NEW: Current status |
| 0 | `.claude/CHANGELOG.md` | NEW: Recent changes |
| 0 | `docs/README.md` | NEW: Docs index |
| 1 | `convex/actions/extractPdf.ts` | Prompt enhancements |
| 1 | `src/lib/prompts.ts` | Prompt enhancements |
| 2 | `src/lib/schema.ts` | New schemas |
| 2 | `convex/lib/extraction_schema.ts` | Mirror schemas |
| 3 | `convex/lib/retry-helpers.ts` | NEW: Retry logic |
| 3 | `convex/schema.ts` | New tables |
| 4 | `src/components/` | New UI components |
| 5 | `convex/actions/extractPdf.ts` | Scoring updates |

---

## Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 0 | 1-2 days | None (DO FIRST) |
| Phase 1 | 2-3 days | Phase 0 |
| Phase 2 | 3-4 days | Phase 1 |
| Phase 3 | 3-4 days | Phase 2 |
| Phase 4 | 4-5 days | Phase 2 |
| Phase 5 | 2 days | Phase 1 |

**Total: 15-20 days** (Phases 3 & 4 can run in parallel after Phase 2)

---

## Rollback Strategy

- **Phase 0**: Git operations can be reverted; documentation is additive
- **Phase 1**: Revert prompts only
- **Phase 2**: New schemas are optional (.optional())
- **Phase 3**: New tables can be ignored
- **Phase 4**: Components are additive
- **Phase 5**: Scoring changes are backward compatible
