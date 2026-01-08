import { z } from "zod";

// Zod schemas for validation

export const MetadataSchema = z.object({
  company_name: z.string().nullable(),
  rcs_number: z.string().nullable(),
  address: z.string().nullable(),
  financial_year_start: z.string().nullable(),
  financial_year_end: z.string().nullable(),
  currency: z.string().default("EUR"),
  account_type: z.enum(["full", "abridged", "consolidated"]).nullable(),
  extraction_confidence: z.enum(["high", "medium", "low"]).default("medium"),
  extraction_notes: z.array(z.string()).default([]),
});

export const BalanceSheetItemSchema = z.object({
  name: z.string(),
  current_year: z.number().nullable(),
  previous_year: z.number().nullable(),
  is_ic: z.boolean().default(false),
  note_reference: z.string().optional(),
});

export const BalanceSheetSectionSchema = z.object({
  items: z.array(BalanceSheetItemSchema).default([]),
  total: z.number().nullable(),
  previous_year_total: z.number().nullable(),
});

export const BalanceSheetSchema = z.object({
  fixed_assets: BalanceSheetSectionSchema,
  current_assets: BalanceSheetSectionSchema,
  prepayments: BalanceSheetSectionSchema,
  total_assets: z.number().nullable(),
  previous_year_total_assets: z.number().nullable(),
  capital_and_reserves: BalanceSheetSectionSchema,
  provisions: BalanceSheetSectionSchema,
  creditors: BalanceSheetSectionSchema,
  total_liabilities: z.number().nullable(),
  previous_year_total_liabilities: z.number().nullable(),
});

export const ProfitAndLossItemSchema = z.object({
  name: z.string(),
  current_year: z.number().nullable(),
  previous_year: z.number().nullable(),
  is_ic: z.boolean().default(false),
  note_reference: z.string().optional(),
});

export const ProfitAndLossSchema = z.object({
  income_items: z.array(ProfitAndLossItemSchema).default([]),
  expense_items: z.array(ProfitAndLossItemSchema).default([]),
  operating_result: z.number().nullable(),
  financial_result: z.number().nullable(),
  profit_for_year: z.number().nullable(),
  previous_year_profit: z.number().nullable(),
});

export const ShareholdingDetailSchema = z.object({
  counterparty: z.string(),
  country: z.string().optional(),
  percentage: z.number().optional(),
  carrying_value: z.number().nullable(),
  equity_value: z.number().optional().nullable(),
});

export const LoanDetailSchema = z.object({
  counterparty: z.string(),
  currency: z.string().default("EUR"),
  amount: z.number().nullable(),
  interest_rate: z.number().optional().nullable(),
  maturity_date: z.string().optional().nullable(),
  note_reference: z.string().optional(),
});

// New schemas for enhanced extraction

export const BoardMemberSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  address: z.string().optional(),
});

export const DetailedLoanSchema = z.object({
  counterparty_name: z.string(),
  jurisdiction: z.string().optional().nullable(),
  instrument_type: z.enum([
    "interest_bearing",
    "profit_participating",
    "convertible",
    "interest_free",
  ]).default("interest_bearing"),
  original_principal: z.number().nullable(),
  currency: z.string().default("EUR"),
  execution_date: z.string().optional().nullable(),
  maturity_date: z.string().optional().nullable(),
  interest_rate: z.number().optional().nullable(),
  rate_adjustments: z.string().optional().nullable(), // e.g. "minus remuneration"
  current_principal: z.number().nullable(),
  capitalised_interest: z.number().optional().nullable(),
  accrued_interest: z.number().optional().nullable(),
  current_year_total: z.number().nullable(),
  previous_year_total: z.number().optional().nullable(),
  note_reference: z.string().optional(),
  account_caption: z.string().optional(), // e.g. "1139", "1147"
  is_from_shareholder: z.boolean().default(false),
});

export const AccountCaptionSchema = z.object({
  code: z.string(), // e.g. "1139", "1147"
  description: z.string(),
  current_year: z.number().nullable(),
  previous_year: z.number().nullable(),
  is_ic: z.boolean().default(false),
});

export const EntityGovernanceSchema = z.object({
  board_members: z.array(BoardMemberSchema).default([]),
  administrator: z.string().optional().nullable(),
  shareholder_name: z.string().optional().nullable(),
  shareholder_jurisdiction: z.string().optional().nullable(),
});

export const CashPoolingDetailSchema = z.object({
  exists: z.boolean().default(false),
  counterparty: z.string().nullable().optional(),
  receivable_balance: z.number().nullable().default(null),
  payable_balance: z.number().nullable().default(null),
});

export const NotesExtractionSchema = z.object({
  shares_in_affiliated_details: z.array(ShareholdingDetailSchema).default([]),
  loans_to_affiliated_details: z.array(LoanDetailSchema).default([]),
  loans_from_affiliated_details: z.array(LoanDetailSchema).default([]),
  // New enhanced loan details (loan-by-loan breakdown)
  detailed_loans_granted: z.array(DetailedLoanSchema).default([]),
  detailed_loans_received: z.array(DetailedLoanSchema).default([]),
  shareholder_loans: z.array(DetailedLoanSchema).default([]),
  account_captions: z.array(AccountCaptionSchema).default([]),
  related_party_transactions: z.array(z.string()).default([]),
  cash_pooling: CashPoolingDetailSchema,
  employees_fte: z.number().nullable(),
  off_balance_sheet_commitments: z.array(z.string()).default([]),
});

export const EntityClassificationSchema = z.object({
  primary_type: z.enum([
    "operational",
    "holding",
    "financing",
    "ip_holding",
    "mixed",
  ]).nullable().default("mixed"),
  activities_description: z.string().nullable(),
  substance_indicators: z.array(z.string()).default([]),
});

export const TPFlagSchema = z.object({
  priority: z.enum(["high", "medium", "low"]),
  category: z.string(),
  description: z.string(),
  affected_amount: z.number().nullable(),
  source: z.string(),
  caveats: z.string().optional(),
});

export const ICFinancingSchema = z.object({
  total_loans_granted: z.number().nullable(),
  total_loans_received: z.number().nullable(),
  ic_interest_income: z.number().nullable(),
  ic_interest_expense: z.number().nullable(),
  implied_lending_rate: z.number().nullable(),
  implied_borrowing_rate: z.number().nullable(),
  spread_bps: z.number().nullable(),
});

export const CapitalizationSchema = z.object({
  total_equity: z.number().nullable(),
  total_debt_funding_participations: z.number().nullable(),
  debt_to_equity_ratio: z.number().nullable(),
  debt_percentage: z.number().nullable(),
});

export const TPAnalysisSchema = z.object({
  ic_financing: ICFinancingSchema,
  ic_services_income: z.number().nullable(),
  ic_services_expense: z.number().nullable(),
  capitalization: CapitalizationSchema,
  cash_pooling_identified: z.boolean().default(false),
  priority_flags: z.array(TPFlagSchema).default([]),
  overall_tp_opportunity_score: z.enum(["A", "B", "C"]),
  score_rationale: z.string(),
  recommended_focus_areas: z.array(z.string()).default([]),
  data_quality_notes: z.array(z.string()).default([]),
});

export const ExtractionResultSchema = z.object({
  metadata: MetadataSchema,
  balance_sheet: BalanceSheetSchema,
  profit_and_loss: ProfitAndLossSchema,
  notes_extraction: NotesExtractionSchema,
  entity_classification: EntityClassificationSchema,
  entity_governance: EntityGovernanceSchema.optional(),
  tp_analysis: TPAnalysisSchema,
  extraction_cost_usd: z.number().optional(),
});

export type ValidatedExtractionResult = z.infer<typeof ExtractionResultSchema>;
