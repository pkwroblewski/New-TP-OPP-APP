"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";
import {
  calculateCost,
  cleanJsonResponse,
  stripBase64Prefix,
  handleAnthropicError,
} from "../lib/claude_helpers";
import { validateExtractionResult } from "../lib/extraction_schema";

/**
 * System prompt for Claude extraction
 */
const SYSTEM_PROMPT = `You are a specialist in Luxembourg transfer pricing and corporate finance.
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

You must respond with valid JSON only - no markdown, no explanations outside the JSON.`;

/**
 * User prompt with extraction schema
 */
const USER_PROMPT = `Extract the following structured data from this Luxembourg annual accounts PDF.

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
    "board_members": [
      {
        "name": "full name of manager/director",
        "role": "Manager" | "Director" | "Chairman" | null,
        "address": "address if provided"
      }
    ],
    "administrator": "name of administrator/service provider if any (e.g., 'Aztec Financial Services')",
    "shareholder_name": "name of shareholder entity from notes about loans received",
    "shareholder_jurisdiction": "jurisdiction of shareholder (e.g., 'Luxembourg')"
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
    "detailed_loans_granted": [
      {
        "counterparty_name": "full borrower name from notes",
        "jurisdiction": "country code (e.g., 'LU', 'UK') or null",
        "instrument_type": "interest_bearing" | "profit_participating" | "convertible" | "interest_free",
        "original_principal": number in EUR or null,
        "currency": "EUR",
        "execution_date": "YYYY-MM-DD or null",
        "maturity_date": "YYYY-MM-DD or null",
        "interest_rate": percentage (e.g., 5.5 for 5.5%) or null,
        "rate_adjustments": "any rate adjustments like 'minus remuneration 0.10%' or null",
        "current_principal": principal at year end or null,
        "capitalised_interest": accumulated capitalised interest or null,
        "accrued_interest": accrued not yet capitalised or null,
        "current_year_total": total current year balance or null,
        "previous_year_total": total previous year balance or null,
        "note_reference": "Note X",
        "account_caption": "eCDF caption code (e.g., '1139', '1147')",
        "is_from_shareholder": false
      }
    ],
    "detailed_loans_received": [
      {
        "counterparty_name": "lender name (often shareholder/parent)",
        "jurisdiction": "country code or null",
        "instrument_type": "interest_bearing" | "profit_participating" | "convertible" | "interest_free",
        "original_principal": number or null,
        "currency": "EUR",
        "execution_date": "YYYY-MM-DD or null",
        "maturity_date": "YYYY-MM-DD or null",
        "interest_rate": percentage or null,
        "rate_adjustments": "any adjustments or null",
        "current_principal": number or null,
        "capitalised_interest": number or null,
        "accrued_interest": number or null,
        "current_year_total": number or null,
        "previous_year_total": number or null,
        "note_reference": "Note X",
        "account_caption": "e.g., '1379-1383', '1397-1401'",
        "is_from_shareholder": true if from direct shareholder
      }
    ],
    "shareholder_loans": [same structure as detailed_loans_received but ONLY for loans from direct shareholders in Other creditors/1397-1401],
    "account_captions": [
      {
        "code": "eCDF caption code (e.g., '1139')",
        "description": "caption description (e.g., 'Loans to affiliated undertakings')",
        "current_year": number or null,
        "previous_year": number or null,
        "is_ic": true if intercompany
      }
    ],
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
  },
  "company_profile": {
    "company_overview": {
      "content": "string - Professional paragraph with company name, legal form, RCS, address, FY, account type",
      "sources": ["page/note references"],
      "data_availability": "complete or partial or unavailable"
    },
    "business_activities": {
      "content": "string - Business activities from corporate purpose, notes, management report",
      "sources": ["source references"],
      "data_availability": "complete or partial or unavailable"
    },
    "tp_relevant_info": {
      "ic_financing": null,
      "ic_trading": null,
      "ip_transactions": null,
      "cost_sharing": null,
      "management_fees": null
    },
    "profile_generated": true,
    "generation_notes": ["caveats about the profile"]
  }
}

TP_RELEVANT_INFO FIELDS (set to object or null):
- ic_financing: { "content": "IC loans description", "sources": ["Note X"], "data_availability": "complete|partial|unavailable" } OR null if none
- ic_trading: { "content": "IC trading description", "sources": [], "data_availability": "..." } OR null if none
- ip_transactions: { "content": "IP/licensing description", "sources": [], "data_availability": "..." } OR null if none
- cost_sharing: { "content": "Cost sharing description", "sources": [], "data_availability": "..." } OR null if none
- management_fees: { "content": "Management fees description", "sources": [], "data_availability": "..." } OR null if none

COMPANY PROFILE GENERATION RULES:
- Profile must be based SOLELY on information in the PDF - NO HALLUCINATION
- Each section MUST cite its sources (Note X, Page Y, Balance Sheet, etc.)
- Use formal, professional English suitable for transfer pricing documentation
- If a TP-relevant category has no related information in the document, set it to null
- data_availability: "complete" (all info present), "partial" (some gaps), "unavailable" (no info)
- For ic_financing, ALWAYS document if loans exist even if details are limited
- business_activities: Search the entire document including notes, corporate purpose, and any descriptive sections

SCORING RULES:
- Score A (High Priority): Zero/negative spread (<10 bps) OR total IC exposure > EUR 100M OR D/E ratio > 10x OR 2+ high priority flags
- Score B (Medium Priority): IC exposure > EUR 20M OR cash pooling identified OR material IC services OR D/E ratio 5.67x-10x
- Score C (Low Priority): Default if not A or B

D/E RATIO THRESHOLDS (Luxembourg market practice):
- D/E <= 1.5x (<=60% debt): No flag
- D/E 1.5x-5.67x (60-85% debt): Low priority flag
- D/E 5.67x-10x (85-90% debt): Medium priority flag
- D/E > 10x (>90% debt): High priority flag

ACCOUNT CAPTION MAPPING (Luxembourg eCDF format):
- Caption 1139: "Loans to affiliated undertakings" - traditional IC loans granted
- Caption 1147: "Other loans" - sometimes contains IC loans (check note details)
- Caption 1379-1383: "Amounts owed to affiliated undertakings" - IC loans received
- Caption 1397-1401: "Other creditors" - often contains shareholder loans (check note details)

LOAN-BY-LOAN EXTRACTION:
- For EACH IC loan in the notes, extract individual loan details
- Parse European number format: "108.784.025,00" means 108,784,025.00
- Look for principal/capitalised interest/accrued interest breakdown
- Identify rate adjustments like "minus remuneration 0.10%"
- Execution dates may be in DD/MM/YYYY or DD.MM.YYYY format

BOARD OF MANAGERS EXTRACTION:
- Extract names from "Board of Managers" or "Directors" section
- Often found at end of document or in management report
- Include administrator/service provider if mentioned (e.g., "Aztec Financial Services")

IMPORTANT:
- Extract EXACT figures from document
- Use null for missing data, not zero
- All monetary values in EUR
- Include note/page references where available
- Be conservative - if unsure, mark extraction_confidence as "low"
- Parse European number format correctly (period = thousands, comma = decimal)

Respond with ONLY the JSON object, no other text.`;

export const extractPdf = action({
  args: {
    pdfBase64: v.string(),
  },
  returns: v.object({
    result: v.any(),
    cost_usd: v.number(),
    input_tokens: v.number(),
    output_tokens: v.number(),
  }),
  handler: async (ctx, args): Promise<{
    result: unknown;
    cost_usd: number;
    input_tokens: number;
    output_tokens: number;
  }> => {
    // Authentication check - prevent unauthorized API usage
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required. Please sign in to use the extraction feature.");
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not configured");
    }

    const anthropic = new Anthropic({ apiKey });
    const base64Data = stripBase64Prefix(args.pdfBase64);

    let response;
    try {
      response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: base64Data,
                },
              } as unknown as Anthropic.ImageBlockParam,
              {
                type: "text",
                text: USER_PROMPT,
              },
            ],
          },
        ],
      });
    } catch (error) {
      handleAnthropicError(error);
    }

    // Extract text content from response
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse JSON response
    let parsedResult: unknown;
    try {
      const jsonText = cleanJsonResponse(textContent.text);
      parsedResult = JSON.parse(jsonText);
    } catch {
      // Truncate logged response to avoid exposing sensitive data
      const truncated = textContent.text.substring(0, 500);
      console.error("Failed to parse Claude response:", truncated + "...");
      throw new Error("Invalid JSON response from extraction");
    }

    // Validate extraction result with Zod schema
    const validatedResult = validateExtractionResult(parsedResult);

    // Calculate cost
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const cost = calculateCost(inputTokens, outputTokens);

    return {
      result: {
        ...validatedResult,
        extraction_cost_usd: cost,
      },
      cost_usd: cost,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
    };
  },
});
