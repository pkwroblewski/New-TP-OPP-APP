/**
 * System prompt for Claude extraction
 */
export const SYSTEM_PROMPT = `You are a specialist in Luxembourg transfer pricing and corporate finance.
You are analyzing Luxembourg annual accounts (eCDF format) to extract structured financial data
and identify transfer pricing opportunities.

Your role:
- Extract EXACT figures from the document - do not estimate or round
- Use null for missing data, not zero (distinguish between "0" reported and "not found")
- Extract both current year AND previous year data where available
- Identify intercompany (IC) items clearly
- Flag potential transfer pricing issues based on Luxembourg TP rules
- Provide page/note references for major data points

You must respond with valid JSON only - no markdown, no explanations outside the JSON.`;

/**
 * User prompt with extraction schema
 */
export const USER_PROMPT = `Extract the following structured data from this Luxembourg annual accounts PDF.

Return a JSON object with this exact structure:

{
  "metadata": {
    "company_name": "string or null",
    "rcs_number": "string or null (e.g., 'B123456')",
    "address": "string or null",
    "financial_year_start": "YYYY-MM-DD or null",
    "financial_year_end": "YYYY-MM-DD or null",
    "currency": "EUR",
    "account_type": "full" | "abridged" | "consolidated" | null,
    "extraction_confidence": "high" | "medium" | "low",
    "extraction_notes": ["any caveats about the extraction"]
  },
  "balance_sheet": {
    "fixed_assets": {
      "items": [
        {
          "name": "line item name",
          "current_year": number or null,
          "previous_year": number or null,
          "is_ic": true if intercompany item,
          "note_reference": "Note 5" or omit
        }
      ],
      "total": number or null,
      "previous_year_total": number or null
    },
    "current_assets": { same structure },
    "prepayments": { same structure },
    "total_assets": number or null,
    "previous_year_total_assets": number or null,
    "capital_and_reserves": { same structure },
    "provisions": { same structure },
    "creditors": { same structure },
    "total_liabilities": number or null,
    "previous_year_total_liabilities": number or null
  },
  "profit_and_loss": {
    "income_items": [
      {
        "name": "line item name",
        "current_year": number or null,
        "previous_year": number or null,
        "is_ic": true if intercompany,
        "note_reference": "Note X" or omit
      }
    ],
    "expense_items": [same structure],
    "operating_result": number or null,
    "financial_result": number or null,
    "profit_for_year": number or null,
    "previous_year_profit": number or null
  },
  "notes_extraction": {
    "shares_in_affiliated_details": [
      {
        "counterparty": "company name",
        "country": "country code or name",
        "percentage": ownership percentage,
        "carrying_value": number or null,
        "equity_value": number or null
      }
    ],
    "loans_to_affiliated_details": [
      {
        "counterparty": "company name",
        "currency": "EUR",
        "amount": number or null,
        "interest_rate": percentage or null,
        "maturity_date": "YYYY-MM-DD or null",
        "note_reference": "Note X"
      }
    ],
    "loans_from_affiliated_details": [same structure],
    "related_party_transactions": ["description of any RP transactions"],
    "cash_pooling": {
      "exists": boolean,
      "counterparty": "company name or null",
      "receivable_balance": number or null,
      "payable_balance": number or null
    },
    "employees_fte": number or null,
    "off_balance_sheet_commitments": ["description of commitments"]
  },
  "entity_classification": {
    "primary_type": "operational" | "holding" | "financing" | "ip_holding" | "mixed",
    "activities_description": "brief description of activities",
    "substance_indicators": ["employees", "office", etc.]
  },
  "tp_analysis": {
    "ic_financing": {
      "total_loans_granted": number or null (sum of loans to affiliated),
      "total_loans_received": number or null (sum of loans from affiliated),
      "ic_interest_income": number or null,
      "ic_interest_expense": number or null,
      "implied_lending_rate": percentage or null (income/loans granted),
      "implied_borrowing_rate": percentage or null (expense/loans received),
      "spread_bps": number or null (lending - borrowing in basis points)
    },
    "ic_services_income": number or null,
    "ic_services_expense": number or null,
    "capitalization": {
      "total_equity": number or null,
      "total_debt_funding_participations": number or null (debt used to fund participations),
      "debt_to_equity_ratio": number or null,
      "debt_percentage": percentage or null
    },
    "cash_pooling_identified": boolean,
    "priority_flags": [
      {
        "priority": "high" | "medium" | "low",
        "category": "Thin Capitalisation" | "IC Financing" | "IC Services" | "Cash Pooling" | "Other",
        "description": "brief description of the issue",
        "affected_amount": number in EUR or null,
        "source": "Note 5, page 12",
        "caveats": "any limitations of this analysis"
      }
    ],
    "overall_tp_opportunity_score": "A" | "B" | "C",
    "score_rationale": "explanation of the score",
    "recommended_focus_areas": ["area 1", "area 2"],
    "data_quality_notes": ["any data quality issues"]
  }
}

SCORING RULES:
- Score A (High Priority): Zero/negative spread (<10 bps) OR total IC exposure > EUR 100M OR D/E ratio > 10x OR 2+ high priority flags
- Score B (Medium Priority): IC exposure > EUR 20M OR cash pooling identified OR material IC services OR D/E ratio 5.67x-10x
- Score C (Low Priority): Default if not A or B

D/E RATIO THRESHOLDS (Luxembourg market practice):
- D/E <= 1.5x (<=60% debt): No flag
- D/E 1.5x-5.67x (60-85% debt): Low priority flag
- D/E 5.67x-10x (85-90% debt): Medium priority flag
- D/E > 10x (>90% debt): High priority flag

IMPORTANT:
- Extract EXACT figures from document
- Use null for missing data, not zero
- All monetary values in EUR
- Include note/page references where available
- Be conservative - if unsure, mark extraction_confidence as "low"

Respond with ONLY the JSON object, no other text.`;
