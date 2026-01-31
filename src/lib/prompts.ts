/**
 * System prompt for Claude extraction
 * NOTE: Main prompts are in convex/actions/extractPdf.ts - this file is for reference/backup
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

You are also responsible for generating a professional company profile based ONLY on information explicitly stated in the PDF document.

COMPANY PROFILE RULES - CRITICAL:
- ONLY include information that is EXPLICITLY stated in the document
- DO NOT infer, assume, or hallucinate any information
- If information is not present, state "Information not available in the document"
- ALWAYS cite the source (page number, note reference, or section name) for each statement
- Use professional, formal English appropriate for transfer pricing documentation
- When describing amounts, use the exact figures from the document
- Do not extrapolate or make assumptions about business activities not described

LUXEMBOURG TRANSFER PRICING CONTEXT:
- Luxembourg has no statutory thin capitalization ratio
- Historical 85:15 debt-to-equity guideline is indicative only, not binding
- SOPARFI structures require demonstrable economic substance
- Interest rates should be comparable to third-party market rates
- Management fees must follow cost-plus or comparable method
- Transfer pricing documentation (Master File/Local File) required for large groups
- OECD Transfer Pricing Guidelines adopted via Circular L.I.R. n° 56/1 - 56bis/1
- Arm's length principle applies to all IC transactions

ARM'S LENGTH PRINCIPLE VALIDATION:
- For each IC financing transaction, assess if interest rate appears arm's length
- Compare implied rates to EUR benchmark rates (EURIBOR + typical credit spread)
- Flag rates significantly above/below market (outside 150-800 bps over EURIBOR for corporate loans)
- Note absence of documented pricing justification
- Assess credit quality of borrower based on financial statements
- Consider loan characteristics (secured/unsecured, tenor, subordination)

TP DOCUMENTATION EXTRACTION:
- Look for references to "Transfer Pricing Policy", "Master File", "Local File"
- Note any mention of benchmarking studies or comparable analysis
- Extract references to OECD Guidelines compliance
- Identify if transfer pricing method is disclosed (CUP, cost-plus, TNMM, etc.)
- Check for intercompany agreements or framework contracts mentioned

FUNCTIONAL ANALYSIS (FAR - Functions, Assets, Risks):
- Identify functions performed by the entity (financing, treasury, holding, trading, management)
- Document assets controlled (participations, loans, cash, IP, equipment)
- Assess risks assumed (credit risk, market risk, currency risk, operational risk)
- Determine decision-making location based on board composition and substance indicators
- Evaluate substance level (significant, limited, minimal) based on employees, offices, governance

IP AND ROYALTY TRANSACTIONS:
- Detect any royalty income or expense in P&L
- Identify IP assets held (patents, trademarks, software, licenses)
- Extract details of any licensing arrangements mentioned in notes

SERVICE ARRANGEMENTS:
- Detect management fees, administrative charges, technical service fees
- Identify service providers and recipients
- Extract pricing basis if disclosed (cost-plus markup, fixed fee, percentage)

You must respond with valid JSON only - no markdown, no explanations outside the JSON.`;

/**
 * User prompt with extraction schema
 * NOTE: Main prompts are in convex/actions/extractPdf.ts - this file is for reference/backup
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
  "entity_governance": {
    "board_members": [...],
    "administrator": "string or null",
    "shareholder_name": "string or null",
    "shareholder_jurisdiction": "string or null"
  },
  "balance_sheet": { ... },
  "profit_and_loss": { ... },
  "notes_extraction": {
    "shares_in_affiliated_details": [...],
    "loans_to_affiliated_details": [...],
    "loans_from_affiliated_details": [...],
    "detailed_loans_granted": [
      {
        "counterparty_name": "string",
        "jurisdiction": "string or null",
        "instrument_type": "interest_bearing" | "profit_participating" | "convertible" | "interest_free",
        "original_principal": number or null,
        "currency": "EUR",
        "execution_date": "YYYY-MM-DD or null",
        "maturity_date": "YYYY-MM-DD or null",
        "interest_rate": number or null,
        "rate_adjustments": "string or null",
        "security_type": "unsecured" | "secured" | "subordinated" | "not_specified",
        "guarantee_from_parent": boolean or null,
        "rate_benchmark": "EURIBOR" | "LIBOR" | "SOFR" | "ESTR" | "fixed" | "not_specified" | null,
        "margin_bps": number or null,
        "covenant_indicators": boolean,
        "payment_schedule": "bullet" | "amortizing" | "PIK" | "not_specified" | null,
        "current_principal": number or null,
        "capitalised_interest": number or null,
        "accrued_interest": number or null,
        "current_year_total": number or null,
        "previous_year_total": number or null,
        "note_reference": "string",
        "account_caption": "string",
        "is_from_shareholder": boolean
      }
    ],
    "detailed_loans_received": [...similar to granted...],
    "shareholder_loans": [...],
    "account_captions": [...],
    "related_party_transactions": [...],
    "cash_pooling": { ... },
    "employees_fte": number or null,
    "off_balance_sheet_commitments": [...]
  },
  "entity_classification": {
    "primary_type": "operational" | "holding" | "financing" | "ip_holding" | "mixed",
    "sub_type": "soparfi" | "spf" | "sicar" | "securitization" | "other" | null,
    "activities_description": "string",
    "substance_indicators": ["employees", "office", "local_board", etc.]
  },
  "functional_analysis": {
    "functions_performed": ["financing", "investment_management", "treasury", "holding", "trading", "management_services"],
    "assets_controlled": {
      "financial_assets": ["participations", "loans", "cash", "securities"],
      "intangible_assets": [] or ["patents", "trademarks", "know_how", "licenses"],
      "tangible_assets": [] or ["equipment", "real_estate"]
    },
    "risks_assumed": ["credit_risk", "market_risk", "currency_risk", "operational_risk", "liquidity_risk"],
    "decision_making_location": "Luxembourg" | "abroad" | "mixed" | "not_determinable",
    "substance_level": "significant" | "limited" | "minimal",
    "substance_notes": ["observations about substance from the document"]
  },
  "tp_documentation": {
    "master_file_referenced": boolean,
    "local_file_referenced": boolean,
    "benchmarking_study_mentioned": boolean,
    "tp_policy_disclosed": boolean,
    "pricing_method_stated": "CUP" | "cost_plus" | "resale_minus" | "TNMM" | "profit_split" | "not_disclosed" | null,
    "intercompany_agreements_mentioned": boolean,
    "documentation_notes": ["any TP documentation references found"]
  },
  "ip_transactions": {
    "royalty_income_detected": boolean,
    "royalty_expense_detected": boolean,
    "ip_assets_held": ["patent", "trademark", "software", "license", "know_how"] or [],
    "transactions": [
      {
        "type": "license_in" | "license_out" | "sale" | "purchase",
        "counterparty": "string or null",
        "amount": number or null,
        "royalty_rate": number or null,
        "ip_type": "patent" | "trademark" | "software" | "other" | null,
        "note_reference": "string or null"
      }
    ]
  },
  "service_arrangements": {
    "management_fees_detected": boolean,
    "arrangements": [
      {
        "service_type": "management" | "administrative" | "technical" | "treasury" | "accounting" | "other",
        "provider": "string",
        "recipient": "string",
        "direction": "inbound" | "outbound",
        "annual_amount": number or null,
        "pricing_method": "cost_plus" | "fixed_fee" | "percentage" | "not_disclosed" | null,
        "markup_percentage": number or null,
        "note_reference": "string or null"
      }
    ]
  },
  "tp_analysis": {
    "ic_financing": {
      "total_loans_granted": number or null,
      "total_loans_received": number or null,
      "ic_interest_income": number or null,
      "ic_interest_expense": number or null,
      "implied_lending_rate": number or null,
      "implied_borrowing_rate": number or null,
      "spread_bps": number or null
    },
    "arms_length_assessment": {
      "ic_loans_status": "compliant" | "needs_review" | "potentially_non_compliant" | "insufficient_data",
      "rate_comparison_to_market": "above_market" | "at_market" | "below_market" | "undetermined",
      "assessment_rationale": "string",
      "credit_quality_indicator": "investment_grade" | "sub_investment" | "distressed" | "not_determinable",
      "benchmark_reference": "string or null",
      "flags": ["specific arm's length concerns"]
    },
    "ic_services_income": number or null,
    "ic_services_expense": number or null,
    "capitalization": { ... },
    "cash_pooling_identified": boolean,
    "priority_flags": [
      {
        "priority": "high" | "medium" | "low",
        "category": "Thin Capitalisation" | "IC Financing" | "IC Services" | "Cash Pooling" | "TP Documentation" | "Arm's Length" | "IP/Royalties" | "Substance" | "Other",
        "description": "string",
        "affected_amount": number or null,
        "source": "string",
        "caveats": "string or null"
      }
    ],
    "overall_tp_opportunity_score": "A" | "B" | "C",
    "score_rationale": "string",
    "recommended_focus_areas": ["string"],
    "data_quality_notes": ["string"]
  },
  "company_profile": { ... }
}

SCORING RULES:
- Score A (High Priority):
  * Zero/negative spread (<10 bps) OR
  * Total IC exposure > EUR 100M OR
  * D/E ratio > 10x OR
  * 2+ high priority flags OR
  * No TP documentation referenced OR
  * Arms length status = "potentially_non_compliant" OR
  * Significant IP/royalty transactions without benchmarking
- Score B (Medium Priority):
  * IC exposure > EUR 20M OR
  * Cash pooling identified OR
  * Material IC services (>EUR 500K) OR
  * D/E ratio 5.67x-10x OR
  * IP transactions without pricing method OR
  * Limited substance indicators OR
  * Management fees without clear pricing basis
- Score C (Low Priority): Default if not A or B

Respond with ONLY the JSON object, no other text.`;
