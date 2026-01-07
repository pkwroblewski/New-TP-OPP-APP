# TP Extractor — Project Specification

## Purpose

A simple web application that extracts financial data from Luxembourg annual accounts (PDFs) and produces a transfer pricing analysis summary. Upload a PDF, get structured data + TP opportunity flags.

**Target User:** Transfer pricing professionals  
**Business Value:** Automates 2-3 hours of manual financial statement review into a 30-second upload

---

## Core Concept

### The Simple Approach

Claude can reliably read Luxembourg GAAP PDFs when given a well-structured extraction prompt. No complex OCR pipelines needed.

**Architecture:**
```
User uploads PDF
       ↓
Next.js API route
       ↓
Claude API (PDF + extraction prompt)
       ↓
Structured JSON response
       ↓
Frontend displays results + Excel export
```

### Why This Works

1. **Luxembourg eCDF format is standardized** — Same structure across filings
2. **Claude handles PDFs natively** — No preprocessing needed
3. **Structured prompt = consistent output** — JSON schema ensures reliability
4. **Single API call** — Simple, fast, cost-effective (~$0.25/extraction)

---

## Technology Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | Next.js 14 (App Router) | Server components, API routes |
| **Language** | TypeScript | Type safety for JSON schema |
| **Styling** | Tailwind CSS + shadcn/ui | Clean, professional UI |
| **AI** | Claude API (Sonnet) | PDF reading + extraction |
| **Validation** | Zod | Validate Claude's JSON response |

**For MVP:**
- No database needed — stateless extraction, results displayed immediately
- Excel export is a feature, not a core dependency (generate on-demand)
- No user accounts — internal tool

---

## App Structure

### Pages

1. **Home / Upload Page** (`/`)
   - Clean landing with company branding
   - Drag-and-drop PDF upload zone
   - "Extract" button
   - Loading state while processing

2. **Results Page** (`/results` or same page with state)
   - Company header (name, RCS, year)
   - Summary cards (key metrics)
   - TP Opportunity Flags (color-coded)
   - Tabbed data view (Balance Sheet, P&L, IC Details)
   - Export buttons (Excel, JSON)

### API Routes

1. **`/api/extract`** (POST)
   - Receives PDF file
   - Converts to base64
   - Calls Claude API with extraction prompt
   - Returns structured JSON
   - Validates response against Zod schema

---

## The Extraction Prompt

See `TP_EXTRACTOR_PROMPT.md` for the full prompt specification.

Key elements:
- System prompt establishes Claude as Luxembourg TP specialist
- User prompt contains the JSON schema to follow
- PDF is attached as document
- Response is pure JSON (no markdown)

---

## JSON Response Schema

The Claude response follows this structure:

```typescript
interface ExtractionResult {
  metadata: {
    company_name: string;
    rcs_number: string;
    financial_year_end: string;
    currency: string;
    account_type: 'full' | 'abridged' | 'consolidated';
    extraction_confidence: 'high' | 'medium' | 'low';
  };
  
  balance_sheet: {
    assets: { /* nested structure */ };
    liabilities: { /* nested structure */ };
  };
  
  profit_and_loss: { /* P&L line items */ };
  
  notes_extraction: {
    shares_in_affiliated_details: Array<{...}>;
    loans_to_affiliated_details: Array<{...}>;
    loans_from_affiliated_details: Array<{...}>;
    related_party_transactions: {...};
    cash_pooling: {...};
    employees: {...};
  };
  
  tp_analysis: {
    ic_financing: {
      loans_granted_total: number;
      loans_received_total: number;
      interest_income_ic: number;
      interest_expense_ic: number;
      spread_bps: number | null;
      spread_flag: 'zero_spread' | 'negative_spread' | 'low_spread' | 'normal';
    };
    capitalization: {
      debt_equity_ratio: number;
      thin_cap_flag: 'within_safe_harbour' | 'exceeds_safe_harbour';
    };
    priority_flags: Array<{
      priority: 'high' | 'medium' | 'low';
      category: string;
      description: string;
      affected_amount: number;
    }>;
    overall_tp_opportunity_score: 'A' | 'B' | 'C';
  };
}
```

---

## UI Components

### Summary Cards (Top of Results)

| Card | Content |
|------|---------|
| **Company** | Name, RCS, Year End |
| **Entity Type** | Holding / Financing / Operational / Mixed |
| **Total Assets** | EUR amount with YoY change |
| **IC Exposure** | Total IC assets + liabilities |
| **TP Score** | A / B / C with color coding |

### TP Flags Section

Color-coded flags:
- 🔴 **HIGH** — Zero/negative spread, large IC financing
- 🟡 **MEDIUM** — Corporate services, cash pooling
- 🟢 **LOW** — Within safe harbours, minor IC activity

### Data Tables (Tabbed)

1. **Balance Sheet Tab** — Assets and Liabilities with IC breakdown
2. **P&L Tab** — Income and expenses with IC split
3. **IC Details Tab** — Loan details, counterparties, rates
4. **Raw JSON Tab** — Full extraction for verification

### Export Options

- **Excel Download** — Formatted workbook with all tabs
- **JSON Download** — Raw extraction data
- **Copy Summary** — One-click copy of key findings for email

---

## TP Analysis Logic

### Important Context

**Luxembourg has no statutory thin capitalisation safe harbour.** The historical 85:15 (or 5.67x D/E) guideline for debt funding participations is indicative, not prescriptive. Every situation requires case-by-case analysis.

The app **identifies potential issues for professional review**, not definitive compliance problems.

### Configurable Analysis Layer

The analysis rules are defined in `TP_ANALYSIS_CONFIG.md`, which you can modify without changing code. This includes:
- Thresholds for flagging
- What counts as "high/medium/low" priority  
- How scoring works
- Caveats and context to display

### Key Analysis Areas

| Area | What We Analyze | Key Question |
|------|-----------------|--------------|
| **IC Financing** | Loans granted/received, interest flows | Is there arm's length pricing? |
| **Debt/Equity** | Debt funding participations vs equity | What's the leverage for holding structures? |
| **Cash Pooling** | Treasury arrangements with group | Is cash pool leader compensated? |
| **Corporate Services** | Management/service fees | Is pricing documented? |
| **Substance** | Employees, local management | Does the entity have substance for its functions? |

### Debt-to-Equity Analysis (Specific Context)

For Luxembourg holding/financing structures, the relevant D/E analysis is:

```
Debt funding participations
─────────────────────────── = D/E Ratio
      Total Equity
```

**Not** general leverage, but specifically debt that funds shareholdings in subsidiaries.

**Reference: D/E Ratio to Funding Split:**
| D/E Ratio | Debt % | Equity % |
|-----------|--------|----------|
| 1.0x | 50% | 50% |
| 1.5x | 60% | 40% |
| 5.67x | 85% | 15% |
| 9.0x | 90% | 10% |
| 19.0x | 95% | 5% |
| 49.0x | 98% | 2% |

**Thresholds (based on market practice):**

| D/E Ratio | Funding Split | Flag | Rationale |
|-----------|---------------|------|-----------|
| ≤ 1.5x | ≤ 60% debt | ✅ None | Within typical third-party benchmarks |
| 1.5x – 5.67x | 60-85% debt | 🟡 Low | Above benchmarks but within historical 85:15 guideline |
| 5.67x – 10x | 85-90% debt | 🟠 Medium | Exceeds guideline — needs arm's length benchmarking |
| > 10x | > 90% debt | 🔴 High | Significant risk of deduction denial or recharacterisation to dividend (WHT exposure) |

**Tax Risks for Excessive Debt:**
- **Interest deduction denial** — Tax authorities treat excessive debt as equity, deny deduction
- **Recharacterisation to dividend** — Interest payments treated as dividends, subject to WHT

**Always include caveat:** "Luxembourg has no statutory thin cap safe harbour. Third-party benchmarks typically show 60/40 debt-equity for holding structures. Arm's length analysis required."

### Spread Analysis (IC Financing)

```
Implied Lending Rate = IC Interest Income / IC Loans Granted
Implied Borrowing Rate = IC Interest Expense / IC Loans Received
Spread = Lending Rate - Borrowing Rate
```

**Caveats to always note:**
- Implied rates are estimates based on year-end balances
- Actual contractual rates may differ
- Currency and timing effects not captured

**Flags:**
- `zero_spread` — < 10 bps spread (essentially zero margin)
- `negative_spread` — Borrowing rate exceeds lending rate (unusual)
- `low_spread` — < 25 bps (very thin margin)

### Scoring Framework

| Score | Criteria | Description |
|-------|----------|-------------|
| **A** | Zero/negative spread, OR large IC financing (>€100M), OR D/E > 10x (>90% debt), OR 2+ high flags | High priority — significant concerns requiring immediate attention |
| **B** | IC financing >€20M, OR cash pooling, OR material services, OR D/E 5.67-10x (85-90% debt) | Medium priority — material IC transactions warrant documentation review |
| **C** | Default if not A or B | Lower priority — limited IC activity or within typical ranges |

### Data Sourcing

Every flag should cite its source:
- Balance sheet line (e.g., "C.III.2 - Loans to affiliated")
- P&L item (e.g., "Item 14a - Interest to affiliated")
- Note reference (e.g., "Note 12 - Cash pooling with Aperam Treasury")

This allows verification against the original PDF.

---

## Implementation Notes

### Error Handling

- If Claude returns invalid JSON → Show error, allow retry
- If PDF is unreadable → Show clear message
- If extraction confidence is "low" → Display warning banner

### Performance

- Target: < 30 seconds for full extraction
- Show progress indicator during processing
- Consider streaming for perceived speed

### Security

- PDF files are not stored (stateless)
- API key stored in environment variables
- No user data persisted

---

## Data Sourcing & Traceability

### Where Data Comes From

Every extracted data point should trace back to a specific location in the PDF:

| Data Type | Source Location | Example |
|-----------|-----------------|---------|
| **Balance Sheet figures** | eCDF standardized format (pages 1-5) | "C.III.2 - Loans to affiliated: EUR 517M (page 2)" |
| **P&L figures** | eCDF standardized format (pages 6-7) | "Item 14a - Interest to affiliated: EUR 379M (page 7)" |
| **IC loan details** | Notes to financial assets (Note 4/5) | "Loans to Aperam Treasury S.A. in BRL, PLN, EUR" |
| **Cash pooling** | Notes to debtors/creditors (Note 12/13) | "Liabilities under cash pooling arrangements: EUR 274M" |
| **Related party transactions** | Specific note (often Note 7ter or similar) | "Corporate services charged to subsidiaries" |
| **Employee count** | Notes or management report | "Average FTE: 51 (2024)" |
| **Commitments/guarantees** | Off-balance sheet note (Note 20) | "Guarantees given: EUR 1.8B" |

### Example: Cash Pooling in Aperam

In the Aperam PDF, cash pooling was found in **Note 12** (Amounts owed to affiliated undertakings due within one year):

> "Liabilities under cash pooling arrangements" — EUR 274,000 thousand

This is a disclosed line item, not inferred. The app should cite "Note 12" when flagging this.

### Handling Missing Data

- If a data point isn't disclosed → Return `null`, not zero
- If a note exists but doesn't break down IC detail → Flag as "limited disclosure"
- If accounts are abridged → Flag that certain analysis is not possible

---

### Include
- Single PDF upload
- Full extraction (Balance Sheet, P&L, Notes)
- TP analysis summary
- Excel export
- Clean, professional UI

### Exclude (Future)
- User accounts / history
- Batch processing
- Database storage
- Comparison between years/companies
- Integration with CRM

---

## Design Direction

### Visual Style
- Clean, professional, "Big Four" appropriate
- White background, subtle grays
- Blue accent color (trustworthy, professional)
- Clear typography, good spacing
- No clutter — focus on the data

### Inspiration
- Bloomberg Terminal (data density done right)
- Modern SaaS dashboards (Stripe, Linear)
- Financial reporting tools

---

## File Structure (Suggested)

```
tp-extractor/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Upload page
│   │   ├── api/
│   │   │   └── extract/
│   │   │       └── route.ts      # Extraction API
│   │   └── layout.tsx
│   ├── components/
│   │   ├── upload-zone.tsx
│   │   ├── results-dashboard.tsx
│   │   ├── summary-cards.tsx
│   │   ├── tp-flags.tsx
│   │   ├── data-tables.tsx
│   │   └── export-buttons.tsx
│   ├── lib/
│   │   ├── claude.ts             # Claude API client
│   │   ├── prompts.ts            # Extraction prompts
│   │   ├── schema.ts             # Zod schemas
│   │   └── excel.ts              # Excel generation
│   └── types/
│       └── extraction.ts         # TypeScript types
├── .env.local                    # ANTHROPIC_API_KEY
└── package.json
```

---

## Getting Started

1. Create Next.js project with TypeScript + Tailwind
2. Install shadcn/ui components
3. Set up Claude API client
4. Implement extraction prompt
5. Build upload UI
6. Build results dashboard
7. Add Excel export
8. Polish and test
