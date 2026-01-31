import { z } from "zod";

/**
 * Zod schema for validating extraction results in Convex action.
 * This mirrors the schema in src/lib/schema.ts but lives in Convex runtime.
 */

const MetadataSchema = z.object({
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

const BalanceSheetItemSchema = z.object({
  name: z.string(),
  current_year: z.number().nullable(),
  previous_year: z.number().nullable(),
  is_ic: z.boolean().default(false),
  note_reference: z.string().optional().nullable(),
});

const BalanceSheetSectionSchema = z.object({
  items: z.array(BalanceSheetItemSchema).default([]),
  total: z.number().nullable(),
  previous_year_total: z.number().nullable(),
});

const BalanceSheetSchema = z.object({
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

const ProfitAndLossItemSchema = z.object({
  name: z.string(),
  current_year: z.number().nullable(),
  previous_year: z.number().nullable(),
  is_ic: z.boolean().default(false),
  note_reference: z.string().optional().nullable(),
});

const ProfitAndLossSchema = z.object({
  income_items: z.array(ProfitAndLossItemSchema).default([]),
  expense_items: z.array(ProfitAndLossItemSchema).default([]),
  operating_result: z.number().nullable(),
  financial_result: z.number().nullable(),
  profit_for_year: z.number().nullable(),
  previous_year_profit: z.number().nullable(),
});

const BoardMemberSchema = z.object({
  name: z.string(),
  role: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

const EntityGovernanceSchema = z.object({
  board_members: z.array(BoardMemberSchema).default([]),
  administrator: z.string().optional().nullable(),
  shareholder_name: z.string().optional().nullable(),
  shareholder_jurisdiction: z.string().optional().nullable(),
});

const ShareholdingDetailSchema = z.object({
  counterparty: z.string(),
  country: z.string().optional().nullable(),
  percentage: z.number().optional().nullable(),
  carrying_value: z.number().nullable(),
  equity_value: z.number().optional().nullable(),
});

const LoanDetailSchema = z.object({
  counterparty: z.string(),
  currency: z.string().default("EUR"),
  amount: z.number().nullable(),
  interest_rate: z.number().optional().nullable(),
  maturity_date: z.string().optional().nullable(),
  note_reference: z.string().optional().nullable(),
});

const DetailedLoanSchema = z.object({
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
  rate_adjustments: z.string().optional().nullable(),
  // New fields for enhanced loan documentation (Phase 1)
  security_type: z.enum(["unsecured", "secured", "subordinated", "not_specified"]).default("not_specified"),
  guarantee_from_parent: z.boolean().optional().nullable(),
  rate_benchmark: z.enum(["EURIBOR", "LIBOR", "SOFR", "ESTR", "fixed", "not_specified"]).optional().nullable(),
  margin_bps: z.number().optional().nullable(),
  covenant_indicators: z.boolean().optional().nullable(),
  payment_schedule: z.enum(["bullet", "amortizing", "PIK", "not_specified"]).optional().nullable(),
  current_principal: z.number().nullable(),
  capitalised_interest: z.number().optional().nullable(),
  accrued_interest: z.number().optional().nullable(),
  current_year_total: z.number().nullable(),
  previous_year_total: z.number().optional().nullable(),
  note_reference: z.string().optional().nullable(),
  account_caption: z.string().optional().nullable(),
  is_from_shareholder: z.boolean().default(false),
});

const AccountCaptionSchema = z.object({
  code: z.string(),
  description: z.string(),
  current_year: z.number().nullable(),
  previous_year: z.number().nullable(),
  is_ic: z.boolean().default(false),
});

const CashPoolingDetailSchema = z.object({
  exists: z.boolean().default(false),
  counterparty: z.string().nullable().optional(),
  receivable_balance: z.number().nullable().default(null),
  payable_balance: z.number().nullable().default(null),
});

const NotesExtractionSchema = z.object({
  shares_in_affiliated_details: z.array(ShareholdingDetailSchema).default([]),
  loans_to_affiliated_details: z.array(LoanDetailSchema).default([]),
  loans_from_affiliated_details: z.array(LoanDetailSchema).default([]),
  detailed_loans_granted: z.array(DetailedLoanSchema).default([]),
  detailed_loans_received: z.array(DetailedLoanSchema).default([]),
  shareholder_loans: z.array(DetailedLoanSchema).default([]),
  account_captions: z.array(AccountCaptionSchema).default([]),
  related_party_transactions: z.array(z.string()).default([]),
  cash_pooling: CashPoolingDetailSchema,
  employees_fte: z.number().nullable(),
  off_balance_sheet_commitments: z.array(z.string()).default([]),
});

const EntityClassificationSchema = z.object({
  primary_type: z.enum([
    "operational",
    "holding",
    "financing",
    "ip_holding",
    "mixed",
  ]).nullable().default("mixed"),
  // New field for Luxembourg-specific entity sub-types (Phase 1)
  sub_type: z.enum(["soparfi", "spf", "sicar", "securitization", "other"]).optional().nullable(),
  activities_description: z.string().nullable(),
  substance_indicators: z.array(z.string()).default([]),
});

// Functional Analysis schema - FAR (Functions, Assets, Risks) analysis (Phase 1)
const AssetsControlledSchema = z.object({
  financial_assets: z.array(z.string()).default([]),
  intangible_assets: z.array(z.string()).default([]),
  tangible_assets: z.array(z.string()).default([]),
});

const FunctionalAnalysisSchema = z.object({
  functions_performed: z.array(z.string()).default([]),
  assets_controlled: AssetsControlledSchema,
  risks_assumed: z.array(z.string()).default([]),
  decision_making_location: z.enum(["Luxembourg", "abroad", "mixed", "not_determinable"]).default("not_determinable"),
  substance_level: z.enum(["significant", "limited", "minimal"]).default("limited"),
  substance_notes: z.array(z.string()).default([]),
});

// TP Documentation schema - Transfer Pricing documentation references (Phase 1)
const TPDocumentationSchema = z.object({
  master_file_referenced: z.boolean().default(false),
  local_file_referenced: z.boolean().default(false),
  benchmarking_study_mentioned: z.boolean().default(false),
  tp_policy_disclosed: z.boolean().default(false),
  pricing_method_stated: z.enum(["CUP", "cost_plus", "resale_minus", "TNMM", "profit_split", "not_disclosed"]).optional().nullable(),
  intercompany_agreements_mentioned: z.boolean().default(false),
  documentation_notes: z.array(z.string()).default([]),
});

// IP Transaction schema - Individual IP/royalty transaction (Phase 1)
const IPTransactionSchema = z.object({
  type: z.enum(["license_in", "license_out", "sale", "purchase"]),
  counterparty: z.string().optional().nullable(),
  amount: z.number().optional().nullable(),
  royalty_rate: z.number().optional().nullable(),
  ip_type: z.enum(["patent", "trademark", "software", "other"]).optional().nullable(),
  note_reference: z.string().optional().nullable(),
});

// IP Transactions schema - Collection of IP/royalty transactions (Phase 1)
const IPTransactionsSchema = z.object({
  royalty_income_detected: z.boolean().default(false),
  royalty_expense_detected: z.boolean().default(false),
  ip_assets_held: z.array(z.string()).default([]),
  transactions: z.array(IPTransactionSchema).default([]),
});

// Service Arrangement schema - Individual service arrangement (Phase 1)
const ServiceArrangementSchema = z.object({
  service_type: z.enum(["management", "administrative", "technical", "treasury", "accounting", "other"]),
  provider: z.string(),
  recipient: z.string(),
  direction: z.enum(["inbound", "outbound"]),
  annual_amount: z.number().optional().nullable(),
  pricing_method: z.enum(["cost_plus", "fixed_fee", "percentage", "not_disclosed"]).optional().nullable(),
  markup_percentage: z.number().optional().nullable(),
  note_reference: z.string().optional().nullable(),
});

// Service Arrangements schema - Collection of service arrangements (Phase 1)
const ServiceArrangementsSchema = z.object({
  management_fees_detected: z.boolean().default(false),
  arrangements: z.array(ServiceArrangementSchema).default([]),
});

// Arm's Length Assessment schema - Assessment of IC transactions (Phase 1)
const ArmsLengthAssessmentSchema = z.object({
  ic_loans_status: z.enum(["compliant", "needs_review", "potentially_non_compliant", "insufficient_data"]).default("insufficient_data"),
  rate_comparison_to_market: z.enum(["above_market", "at_market", "below_market", "undetermined"]).default("undetermined"),
  assessment_rationale: z.string().optional().nullable(),
  credit_quality_indicator: z.enum(["investment_grade", "sub_investment", "distressed", "not_determinable"]).default("not_determinable"),
  benchmark_reference: z.string().optional().nullable(),
  flags: z.array(z.string()).default([]),
});

const TPFlagSchema = z.object({
  priority: z.enum(["high", "medium", "low"]),
  category: z.string(),
  description: z.string(),
  affected_amount: z.number().nullable(),
  source: z.string(),
  caveats: z.string().optional().nullable(),
});

const ICFinancingSchema = z.object({
  total_loans_granted: z.number().nullable(),
  total_loans_received: z.number().nullable(),
  ic_interest_income: z.number().nullable(),
  ic_interest_expense: z.number().nullable(),
  implied_lending_rate: z.number().nullable(),
  implied_borrowing_rate: z.number().nullable(),
  spread_bps: z.number().nullable(),
});

const CapitalizationSchema = z.object({
  total_equity: z.number().nullable(),
  total_debt_funding_participations: z.number().nullable(),
  debt_to_equity_ratio: z.number().nullable(),
  debt_percentage: z.number().nullable(),
});

const TPAnalysisSchema = z.object({
  ic_financing: ICFinancingSchema,
  // New field for arm's length assessment (Phase 1)
  arms_length_assessment: ArmsLengthAssessmentSchema.optional(),
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

// Company Profile schemas - AI-generated profile based on PDF content
const CompanyProfileSectionSchema = z.object({
  content: z.string(),
  sources: z.array(z.string()).default([]),
  data_availability: z.enum(["complete", "partial", "unavailable"]).default("partial"),
});

const CompanyProfileTPRelevantInfoSchema = z.object({
  ic_financing: CompanyProfileSectionSchema.nullable(),
  ic_trading: CompanyProfileSectionSchema.nullable(),
  ip_transactions: CompanyProfileSectionSchema.nullable(),
  cost_sharing: CompanyProfileSectionSchema.nullable(),
  management_fees: CompanyProfileSectionSchema.nullable(),
});

const CompanyProfileSchema = z.object({
  company_overview: CompanyProfileSectionSchema,
  business_activities: CompanyProfileSectionSchema,
  tp_relevant_info: CompanyProfileTPRelevantInfoSchema,
  profile_generated: z.boolean().default(true),
  generation_notes: z.array(z.string()).default([]),
});

export const ExtractionResultSchema = z.object({
  // Schema version for tracking extraction format changes
  schema_version: z.string().default("2.0.0"),
  metadata: MetadataSchema,
  balance_sheet: BalanceSheetSchema,
  profit_and_loss: ProfitAndLossSchema,
  notes_extraction: NotesExtractionSchema,
  entity_classification: EntityClassificationSchema,
  entity_governance: EntityGovernanceSchema.optional(),
  // New sections added in Phase 1
  functional_analysis: FunctionalAnalysisSchema.optional(),
  tp_documentation: TPDocumentationSchema.optional(),
  ip_transactions: IPTransactionsSchema.optional(),
  service_arrangements: ServiceArrangementsSchema.optional(),
  tp_analysis: TPAnalysisSchema,
  company_profile: CompanyProfileSchema.optional(),
  extraction_cost_usd: z.number().optional(),
});

export type ValidatedExtractionResult = z.infer<typeof ExtractionResultSchema>;

/**
 * Validate extraction result with Zod schema.
 * Returns validated data or throws with detailed error message.
 */
export function validateExtractionResult(data: unknown): ValidatedExtractionResult {
  const result = ExtractionResultSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    throw new Error(`Extraction validation failed: ${errors}`);
  }

  return result.data;
}
