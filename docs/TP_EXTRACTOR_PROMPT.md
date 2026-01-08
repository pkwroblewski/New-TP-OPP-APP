# TP Extractor Prompt Documentation

This document contains the full extraction prompt used by the TP Extractor to analyze Luxembourg annual accounts PDFs.

## Overview

The TP Extractor uses Claude's vision capabilities to analyze PDF documents and extract structured financial data. The extraction is performed in a single API call, and results are streamed to the frontend via Server-Sent Events (SSE).

---

## System Prompt

```
You are a specialist in Luxembourg transfer pricing and corporate finance.
You are analyzing Luxembourg annual accounts (eCDF format) to extract structured financial data
and identify transfer pricing opportunities.

Your role:
- Extract EXACT figures from the document - do not estimate or round
- Use null for missing data, not zero (distinguish between "0" reported and "not found")
- Extract both current year AND previous year data where available
- Identify intercompany (IC) items clearly
- Flag potential transfer pricing issues based on Luxembourg TP rules
- Provide page/note references for major data points

You must respond with valid JSON only - no markdown, no explanations outside the JSON.
```

---

## User Prompt (JSON Schema)

The extraction returns a structured JSON object with the following sections:

### 1. Metadata
```json
{
  "metadata": {
    "company_name": "string or null",
    "rcs_number": "string or null (e.g., 'B123456')",
    "address": "string or null",
    "financial_year_start": "YYYY-MM-DD or null",
    "financial_year_end": "YYYY-MM-DD or null",
    "currency": "EUR",
    "account_type": "full | abridged | consolidated | null",
    "extraction_confidence": "high | medium | low",
    "extraction_notes": ["any caveats about the extraction"]
  }
}
```

### 2. Entity Governance (NEW)
```json
{
  "entity_governance": {
    "board_members": [
      {
        "name": "full name of manager/director",
        "role": "Manager | Director | Chairman | null",
        "address": "address if provided"
      }
    ],
    "administrator": "name of administrator/service provider if any",
    "shareholder_name": "name of shareholder entity from notes about loans received",
    "shareholder_jurisdiction": "jurisdiction of shareholder (e.g., 'Luxembourg')"
  }
}
```

### 3. Balance Sheet
```json
{
  "balance_sheet": {
    "fixed_assets": {
      "items": [
        {
          "name": "line item name",
          "current_year": "number or null",
          "previous_year": "number or null",
          "is_ic": "true if intercompany item",
          "note_reference": "Note 5 or omit"
        }
      ],
      "total": "number or null",
      "previous_year_total": "number or null"
    },
    "current_assets": { "same structure" },
    "prepayments": { "same structure" },
    "total_assets": "number or null",
    "previous_year_total_assets": "number or null",
    "capital_and_reserves": { "same structure" },
    "provisions": { "same structure" },
    "creditors": { "same structure" },
    "total_liabilities": "number or null",
    "previous_year_total_liabilities": "number or null"
  }
}
```

### 4. Profit and Loss
```json
{
  "profit_and_loss": {
    "income_items": [
      {
        "name": "line item name",
        "current_year": "number or null",
        "previous_year": "number or null",
        "is_ic": "true if intercompany",
        "note_reference": "Note X or omit"
      }
    ],
    "expense_items": ["same structure"],
    "operating_result": "number or null",
    "financial_result": "number or null",
    "profit_for_year": "number or null",
    "previous_year_profit": "number or null"
  }
}
```

### 5. Notes Extraction

#### Basic Loan Details
```json
{
  "notes_extraction": {
    "shares_in_affiliated_details": [
      {
        "counterparty": "company name",
        "country": "country code or name",
        "percentage": "ownership percentage",
        "carrying_value": "number or null",
        "equity_value": "number or null"
      }
    ],
    "loans_to_affiliated_details": [
      {
        "counterparty": "company name",
        "currency": "EUR",
        "amount": "number or null",
        "interest_rate": "percentage or null",
        "maturity_date": "YYYY-MM-DD or null",
        "note_reference": "Note X"
      }
    ],
    "loans_from_affiliated_details": ["same structure"]
  }
}
```

#### Detailed Loans (NEW - Loan-by-Loan)
```json
{
  "detailed_loans_granted": [
    {
      "counterparty_name": "full borrower name from notes",
      "jurisdiction": "country code (e.g., 'LU', 'UK') or null",
      "instrument_type": "interest_bearing | profit_participating | convertible | interest_free",
      "original_principal": "number in EUR or null",
      "currency": "EUR",
      "execution_date": "YYYY-MM-DD or null",
      "maturity_date": "YYYY-MM-DD or null",
      "interest_rate": "percentage (e.g., 5.5 for 5.5%) or null",
      "rate_adjustments": "any rate adjustments like 'minus remuneration 0.10%' or null",
      "current_principal": "principal at year end or null",
      "capitalised_interest": "accumulated capitalised interest or null",
      "accrued_interest": "accrued not yet capitalised or null",
      "current_year_total": "total current year balance or null",
      "previous_year_total": "total previous year balance or null",
      "note_reference": "Note X",
      "account_caption": "eCDF caption code (e.g., '1139', '1147')",
      "is_from_shareholder": false
    }
  ],
  "detailed_loans_received": ["same structure with is_from_shareholder: true if from direct shareholder"],
  "shareholder_loans": ["same structure - ONLY for loans from direct shareholders in Other creditors/1397-1401"]
}
```

#### Account Captions (NEW)
```json
{
  "account_captions": [
    {
      "code": "eCDF caption code (e.g., '1139')",
      "description": "caption description (e.g., 'Loans to affiliated undertakings')",
      "current_year": "number or null",
      "previous_year": "number or null",
      "is_ic": "true if intercompany"
    }
  ]
}
```

#### Other Notes Fields
```json
{
  "related_party_transactions": ["description of any RP transactions"],
  "cash_pooling": {
    "exists": "boolean",
    "counterparty": "company name or null",
    "receivable_balance": "number or null",
    "payable_balance": "number or null"
  },
  "employees_fte": "number or null",
  "off_balance_sheet_commitments": ["description of commitments"]
}
```

### 6. Entity Classification
```json
{
  "entity_classification": {
    "primary_type": "operational | holding | financing | ip_holding | mixed",
    "activities_description": "brief description of activities",
    "substance_indicators": ["employees", "office", "etc."]
  }
}
```

### 7. TP Analysis
```json
{
  "tp_analysis": {
    "ic_financing": {
      "total_loans_granted": "number or null (sum of loans to affiliated)",
      "total_loans_received": "number or null (sum of loans from affiliated)",
      "ic_interest_income": "number or null",
      "ic_interest_expense": "number or null",
      "implied_lending_rate": "percentage or null (income/loans granted)",
      "implied_borrowing_rate": "percentage or null (expense/loans received)",
      "spread_bps": "number or null (lending - borrowing in basis points)"
    },
    "ic_services_income": "number or null",
    "ic_services_expense": "number or null",
    "capitalization": {
      "total_equity": "number or null",
      "total_debt_funding_participations": "number or null (debt used to fund participations)",
      "debt_to_equity_ratio": "number or null",
      "debt_percentage": "percentage or null"
    },
    "cash_pooling_identified": "boolean",
    "priority_flags": [
      {
        "priority": "high | medium | low",
        "category": "Thin Capitalisation | IC Financing | IC Services | Cash Pooling | Other",
        "description": "brief description of the issue",
        "affected_amount": "number in EUR or null",
        "source": "Note 5, page 12",
        "caveats": "any limitations of this analysis"
      }
    ],
    "overall_tp_opportunity_score": "A | B | C",
    "score_rationale": "explanation of the score",
    "recommended_focus_areas": ["area 1", "area 2"],
    "data_quality_notes": ["any data quality issues"]
  }
}
```

---

## Scoring Rules

### Overall TP Opportunity Score
- **Score A (High Priority)**: Zero/negative spread (<10 bps) OR total IC exposure > EUR 100M OR D/E ratio > 10x OR 2+ high priority flags
- **Score B (Medium Priority)**: IC exposure > EUR 20M OR cash pooling identified OR material IC services OR D/E ratio 5.67x-10x
- **Score C (Low Priority)**: Default if not A or B

### D/E Ratio Thresholds (Luxembourg market practice)
| D/E Ratio | Debt % | Flag Level |
|-----------|--------|------------|
| ≤1.5x | ≤60% | No flag |
| 1.5x-5.67x | 60-85% | Low priority flag |
| 5.67x-10x | 85-90% | Medium priority flag |
| >10x | >90% | High priority flag |

---

## Account Caption Mapping (Luxembourg eCDF format)

| Caption Code | Description | Notes |
|--------------|-------------|-------|
| 1139 | Loans to affiliated undertakings | Traditional IC loans granted |
| 1147 | Other loans | Sometimes contains IC loans (check note details) |
| 1379-1383 | Amounts owed to affiliated undertakings | IC loans received |
| 1397-1401 | Other creditors | Often contains shareholder loans (check note details) |

---

## Extraction Guidelines

### Loan-by-Loan Extraction
- For EACH IC loan in the notes, extract individual loan details
- Parse European number format: "108.784.025,00" means 108,784,025.00
- Look for principal/capitalised interest/accrued interest breakdown
- Identify rate adjustments like "minus remuneration 0.10%"
- Execution dates may be in DD/MM/YYYY or DD.MM.YYYY format

### Board of Managers Extraction
- Extract names from "Board of Managers" or "Directors" section
- Often found at end of document or in management report
- Include administrator/service provider if mentioned (e.g., "Aztec Financial Services")

### Important Notes
- Extract EXACT figures from document
- Use null for missing data, not zero
- All monetary values in EUR
- Include note/page references where available
- Be conservative - if unsure, mark extraction_confidence as "low"
- Parse European number format correctly (period = thousands, comma = decimal)

---

## SSE Event Phases

The extraction results are streamed via SSE in the following phases:

1. `connected` - Connection established
2. `metadata` - Company info, extraction confidence
3. `governance` - Board of managers, administrator, shareholder (NEW)
4. `entity` - Entity classification
5. `balance_sheet` - Assets, liabilities, equity
6. `profit_and_loss` - Income, expenses
7. `notes` - IC details, related parties, cash pooling
8. `tp_analysis` - TP flags, scoring, capitalization
9. `complete` - Success signal

---

## Sample PDFs Analyzed

### B269292 (Volpi Capital III)
- Uses **caption 1139** for IC loans granted (EUR 108.8M)
- Uses **caption 1397-1401** (Other creditors) for shareholder loans (EUR 113.7M)
- Detailed loan info in Note 4: counterparty, rate, dates, principal/capitalised/accrued breakdown
- Shareholder: Volpi Capital Investments III SCSp

### B236098 (Volpi Capital II)
- Uses **caption 1147** (Other loans) for IC loans - NOT 1139!
- Uses **caption 1379-1383** for amounts owed TO affiliated
- Board explicitly listed: Olivia Tournier-Demal, Barbara Maluska, Duncan Smith
- Administrator: Aztec Financial Services (Luxembourg) S.A.

---

## Related Files

- **Prompt source**: `src/lib/prompts.ts`
- **Schema definitions**: `src/lib/schema.ts`
- **TypeScript types**: `src/types/extraction.ts`
- **SSE route**: `src/app/api/extract/stream/route.ts`
- **Streaming hook**: `src/hooks/useStreamingExtraction.ts`
