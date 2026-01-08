# TP Extractor - Master Extraction Prompt

## Overview

This prompt is embedded in the app and sent to Claude API along with the uploaded PDF. It instructs Claude to extract financial data in a structured JSON format that the frontend can reliably parse and display.

---

## System Prompt

```
You are a Luxembourg transfer pricing specialist extracting financial data from annual accounts prepared under Luxembourg GAAP (Law of 19 December 2002).

Your task is to extract financial data from the uploaded PDF and return it as structured JSON. Be precise, use exact figures from the document, and follow the schema exactly.

CRITICAL RULES:
1. Extract EXACT figures from the document - never estimate or calculate unless explicitly asked
2. Use null for fields where data is not found or not disclosed
3. Distinguish between "0" (disclosed as zero) and null (not disclosed/not found)
4. Always extract both current year AND previous year figures
5. For IC (intercompany) items, be thorough - these are the most important for TP analysis
6. Include page references where you found each major data point
7. All monetary values should be in EUR (convert if necessary, noting the original currency)

OUTPUT FORMAT: Return ONLY valid JSON matching the schema below. No markdown, no explanation, just JSON.
```

---

## User Prompt Template

```
Extract financial data from this Luxembourg annual accounts PDF and return structured JSON.

Company identification to extract:
- Company name
- RCS number (format: B followed by digits)
- Address
- Financial year start and end dates
- Currency used

Return the data in this exact JSON structure:

{
  "metadata": {
    "company_name": "string",
    "rcs_number": "string",
    "address": "string",
    "financial_year_start": "YYYY-MM-DD",
    "financial_year_end": "YYYY-MM-DD",
    "currency": "EUR",
    "account_type": "full | abridged | consolidated",
    "extraction_confidence": "high | medium | low",
    "extraction_notes": "string - any issues or limitations noted"
  },
  
  "balance_sheet": {
    "assets": {
      "fixed_assets": {
        "total": { "current_year": number, "previous_year": number },
        "intangible_assets": { "current_year": number, "previous_year": number },
        "tangible_assets": { "current_year": number, "previous_year": number },
        "financial_assets": {
          "total": { "current_year": number, "previous_year": number },
          "shares_in_affiliated": { "current_year": number, "previous_year": number },
          "loans_to_affiliated": { "current_year": number, "previous_year": number },
          "participating_interests": { "current_year": number, "previous_year": number },
          "other_loans": { "current_year": number, "previous_year": number }
        }
      },
      "current_assets": {
        "total": { "current_year": number, "previous_year": number },
        "debtors": {
          "total": { "current_year": number, "previous_year": number },
          "trade_debtors": { "current_year": number, "previous_year": number },
          "amounts_owed_by_affiliated": {
            "total": { "current_year": number, "previous_year": number },
            "within_one_year": { "current_year": number, "previous_year": number },
            "after_one_year": { "current_year": number, "previous_year": number }
          },
          "other_debtors": { "current_year": number, "previous_year": number }
        },
        "investments": {
          "total": { "current_year": number, "previous_year": number },
          "own_shares": { "current_year": number, "previous_year": number }
        },
        "cash_at_bank": { "current_year": number, "previous_year": number }
      },
      "prepayments": { "current_year": number, "previous_year": number },
      "total_assets": { "current_year": number, "previous_year": number }
    },
    
    "liabilities": {
      "capital_and_reserves": {
        "total": { "current_year": number, "previous_year": number },
        "subscribed_capital": { "current_year": number, "previous_year": number },
        "share_premium": { "current_year": number, "previous_year": number },
        "reserves": {
          "total": { "current_year": number, "previous_year": number },
          "legal_reserve": { "current_year": number, "previous_year": number },
          "reserve_for_own_shares": { "current_year": number, "previous_year": number },
          "other_reserves": { "current_year": number, "previous_year": number }
        },
        "profit_brought_forward": { "current_year": number, "previous_year": number },
        "profit_loss_for_year": { "current_year": number, "previous_year": number }
      },
      "provisions": {
        "total": { "current_year": number, "previous_year": number },
        "provisions_for_pensions": { "current_year": number, "previous_year": number },
        "provisions_for_tax": { "current_year": number, "previous_year": number },
        "other_provisions": { "current_year": number, "previous_year": number }
      },
      "creditors": {
        "total": { "current_year": number, "previous_year": number },
        "debenture_loans": {
          "total": { "current_year": number, "previous_year": number },
          "within_one_year": { "current_year": number, "previous_year": number },
          "after_one_year": { "current_year": number, "previous_year": number }
        },
        "amounts_owed_to_credit_institutions": {
          "total": { "current_year": number, "previous_year": number },
          "within_one_year": { "current_year": number, "previous_year": number },
          "after_one_year": { "current_year": number, "previous_year": number }
        },
        "trade_creditors": { "current_year": number, "previous_year": number },
        "amounts_owed_to_affiliated": {
          "total": { "current_year": number, "previous_year": number },
          "within_one_year": { "current_year": number, "previous_year": number },
          "after_one_year": { "current_year": number, "previous_year": number }
        },
        "other_creditors": {
          "total": { "current_year": number, "previous_year": number },
          "tax_authorities": { "current_year": number, "previous_year": number },
          "social_security": { "current_year": number, "previous_year": number },
          "other": { "current_year": number, "previous_year": number }
        }
      },
      "deferred_income": { "current_year": number, "previous_year": number },
      "total_liabilities": { "current_year": number, "previous_year": number }
    }
  },
  
  "profit_and_loss": {
    "net_turnover": { "current_year": number, "previous_year": number },
    "other_operating_income": { "current_year": number, "previous_year": number },
    "raw_materials_and_consumables": { "current_year": number, "previous_year": number },
    "other_external_expenses": { "current_year": number, "previous_year": number },
    "staff_costs": {
      "total": { "current_year": number, "previous_year": number },
      "wages_and_salaries": { "current_year": number, "previous_year": number },
      "social_security_costs": { "current_year": number, "previous_year": number },
      "other_staff_costs": { "current_year": number, "previous_year": number }
    },
    "value_adjustments": {
      "on_fixed_assets": { "current_year": number, "previous_year": number },
      "on_current_assets": { "current_year": number, "previous_year": number }
    },
    "other_operating_expenses": { "current_year": number, "previous_year": number },
    "income_from_participating_interests": {
      "total": { "current_year": number, "previous_year": number },
      "from_affiliated": { "current_year": number, "previous_year": number },
      "other": { "current_year": number, "previous_year": number }
    },
    "income_from_other_investments": {
      "total": { "current_year": number, "previous_year": number },
      "from_affiliated": { "current_year": number, "previous_year": number },
      "other": { "current_year": number, "previous_year": number }
    },
    "other_interest_receivable": {
      "total": { "current_year": number, "previous_year": number },
      "from_affiliated": { "current_year": number, "previous_year": number },
      "other": { "current_year": number, "previous_year": number }
    },
    "value_adjustments_financial_assets": { "current_year": number, "previous_year": number },
    "interest_payable": {
      "total": { "current_year": number, "previous_year": number },
      "to_affiliated": { "current_year": number, "previous_year": number },
      "other": { "current_year": number, "previous_year": number }
    },
    "tax_on_profit": { "current_year": number, "previous_year": number },
    "profit_after_tax": { "current_year": number, "previous_year": number },
    "other_taxes": { "current_year": number, "previous_year": number },
    "profit_loss_for_year": { "current_year": number, "previous_year": number }
  },
  
  "notes_extraction": {
    "shares_in_affiliated_details": [
      {
        "name": "string",
        "registered_office": "string",
        "percentage_held": "string",
        "carrying_amount_current": number,
        "carrying_amount_previous": number
      }
    ],
    "loans_to_affiliated_details": [
      {
        "counterparty": "string",
        "currency": "string",
        "amount_current": number,
        "amount_previous": number,
        "interest_rate": "string or null",
        "maturity": "string or null"
      }
    ],
    "loans_from_affiliated_details": [
      {
        "counterparty": "string",
        "currency": "string",
        "amount_current": number,
        "amount_previous": number,
        "interest_rate": "string or null",
        "maturity": "string or null"
      }
    ],
    "related_party_transactions": {
      "management_fees_charged": { "current_year": number, "previous_year": number },
      "management_fees_received": { "current_year": number, "previous_year": number },
      "service_fees_charged": { "current_year": number, "previous_year": number },
      "service_fees_received": { "current_year": number, "previous_year": number },
      "royalties_charged": { "current_year": number, "previous_year": number },
      "royalties_received": { "current_year": number, "previous_year": number },
      "guarantees_given": { "current_year": number, "previous_year": number },
      "guarantees_received": { "current_year": number, "previous_year": number }
    },
    "cash_pooling": {
      "exists": true | false,
      "counterparty": "string or null",
      "asset_balance": { "current_year": number, "previous_year": number },
      "liability_balance": { "current_year": number, "previous_year": number }
    },
    "employees": {
      "average_fte_current": number,
      "average_fte_previous": number
    },
    "off_balance_sheet_commitments": {
      "guarantees_given": { "current_year": number, "previous_year": number },
      "other_commitments": { "current_year": number, "previous_year": number }
    }
  },
  
  "entity_classification": {
    "primary_type": "operational | holding | financing | ip_holding | mixed",
    "activities_description": "string - extracted from management report or notes",
    "substance_indicators": {
      "has_employees": true | false,
      "employee_count": number,
      "has_office": true | false,
      "has_local_management": true | false
    }
  },
  
  "tp_analysis": {
    "ic_financing": {
      "loans_granted_total": number,
      "loans_received_total": number,
      "interest_income_ic": number,
      "interest_expense_ic": number,
      "implied_lending_rate_pct": number | null,
      "implied_borrowing_rate_pct": number | null,
      "spread_bps": number | null,
      "spread_flag": "zero_spread | negative_spread | low_spread | normal | not_calculable",
      "spread_calculation_note": "string - explain any caveats on the calculation"
    },
    "ic_services": {
      "services_income": number,
      "services_expense": number,
      "net_position": number,
      "source_note": "string - which note disclosed this"
    },
    "capitalization": {
      "total_equity": number,
      "debt_funding_participations": number,
      "other_debt": number,
      "total_debt": number,
      "debt_equity_ratio": number,
      "debt_equity_note": "string - context on what debt is funding participations vs operational"
    },
    "cash_pooling": {
      "identified": true | false,
      "counterparty": "string or null",
      "asset_position": number | null,
      "liability_position": number | null,
      "source_note": "string - e.g. 'Note 12 - Amounts owed to affiliated'"
    },
    "priority_flags": [
      {
        "priority": "high | medium | low",
        "category": "string",
        "description": "string",
        "affected_amount": number,
        "source": "string - where in PDF this was found"
      }
    ],
    "overall_tp_opportunity_score": "A | B | C",
    "score_rationale": "string - brief explanation of why this score",
    "recommended_focus_areas": ["string"],
    "data_quality_notes": ["string - any limitations or caveats on the extraction"]
  }
}

IMPORTANT ANALYSIS GUIDANCE:

1. DEBT-TO-EQUITY RATIO:
   - Calculate as: debt funding participations / total equity
   - Focus on debt that funds shareholdings in subsidiaries
   - Do NOT apply a "safe harbour" - Luxembourg has none
   
   Reference for D/E to debt% conversion:
   - D/E 1.0x  = 50% debt / 50% equity
   - D/E 1.5x  = 60% debt / 40% equity  
   - D/E 5.67x = 85% debt / 15% equity
   - D/E 9.0x  = 90% debt / 10% equity
   - D/E 49.0x = 98% debt / 2% equity
   
   Flag thresholds:
   - D/E ≤ 1.5x (≤60% debt): NO FLAG - within typical third-party benchmarks
   - D/E 1.5x-5.67x (60-85% debt): LOW - above benchmarks but within historical guideline
   - D/E 5.67x-10x (85-90% debt): MEDIUM - exceeds guideline, needs benchmarking
   - D/E > 10x (>90% debt): HIGH - significant risk of deduction denial or recharacterisation to dividend
   
   Tax risks to note for high leverage:
   - Interest deduction may be denied on "excessive" debt portion
   - Interest may be recharacterised as dividend, triggering WHT

2. SPREAD CALCULATION:
   - Implied rates are estimates based on year-end balances
   - Note if currency mix or timing could affect accuracy
   - Flag if data is insufficient to calculate reliably

3. CASH POOLING:
   - Only flag if explicitly mentioned in notes
   - Cite the specific note where it was found
   - Common locations: notes to debtors, notes to creditors, related party note

4. SCORING:
   - A = High: Zero/negative spread, OR IC financing > EUR 100M, OR D/E > 10x (>90% debt), OR 2+ high flags
   - B = Medium: IC financing > EUR 20M, OR cash pooling, OR material services, OR D/E 5.67-10x
   - C = Low: Default if not A or B

5. SOURCE EVERYTHING:
   - Every flag should cite where the data came from
   - Use note numbers (e.g., "Note 12") and page references where possible
```

---

## How This Works in the App

1. **User uploads PDF** → Frontend sends to API route
2. **API route**:
   - Converts PDF to base64
   - Sends to Claude API with system prompt + user prompt + PDF
   - Receives JSON response
3. **Frontend**:
   - Parses JSON
   - Displays in dashboard format
   - Enables Excel export

---

## Key Design Decisions

### Why a single Claude call works:
- Claude Sonnet can handle ~30-40 page PDFs in one context
- Luxembourg eCDF filings are standardized format
- The structured prompt ensures consistent output

### Why JSON output:
- Reliable parsing by frontend
- Easy to validate schema
- Simple Excel generation
- Can store for historical comparison

### Handling edge cases:
- `null` for missing data (not zero)
- `extraction_confidence` flags quality issues
- `extraction_notes` captures any anomalies

---

## Cost Estimate

Per extraction (assuming ~30 page PDF):
- Input: ~50K tokens (PDF + prompt)
- Output: ~5K tokens (JSON response)
- Cost: ~$0.20-0.30 per extraction with Sonnet

For internal use (Big Four practice), this is negligible compared to manual review time.
