// TypeScript interfaces for the extraction result

export interface Metadata {
  company_name: string | null;
  rcs_number: string | null;
  address: string | null;
  financial_year_start: string | null;
  financial_year_end: string | null;
  currency: string;
  account_type: "full" | "abridged" | "consolidated" | null;
  extraction_confidence: "high" | "medium" | "low";
  extraction_notes: string[];
}

export interface BalanceSheetItem {
  name: string;
  current_year: number | null;
  previous_year: number | null;
  is_ic: boolean;
  note_reference?: string;
}

export interface BalanceSheetSection {
  items: BalanceSheetItem[];
  total: number | null;
  previous_year_total: number | null;
}

export interface BalanceSheet {
  fixed_assets: BalanceSheetSection;
  current_assets: BalanceSheetSection;
  prepayments: BalanceSheetSection;
  total_assets: number | null;
  previous_year_total_assets: number | null;
  capital_and_reserves: BalanceSheetSection;
  provisions: BalanceSheetSection;
  creditors: BalanceSheetSection;
  total_liabilities: number | null;
  previous_year_total_liabilities: number | null;
}

export interface ProfitAndLossItem {
  name: string;
  current_year: number | null;
  previous_year: number | null;
  is_ic: boolean;
  note_reference?: string;
}

export interface ProfitAndLoss {
  income_items: ProfitAndLossItem[];
  expense_items: ProfitAndLossItem[];
  operating_result: number | null;
  financial_result: number | null;
  profit_for_year: number | null;
  previous_year_profit: number | null;
}

export interface ShareholdingDetail {
  counterparty: string;
  country?: string;
  percentage?: number;
  carrying_value: number | null;
  equity_value?: number | null;
}

export interface LoanDetail {
  counterparty: string;
  currency: string;
  amount: number | null;
  interest_rate?: number | null;
  maturity_date?: string | null;
  note_reference?: string;
}

// New interfaces for enhanced extraction

export interface BoardMember {
  name: string;
  role?: string;
  address?: string;
}

export interface DetailedLoan {
  counterparty_name: string;
  jurisdiction?: string | null;
  instrument_type: "interest_bearing" | "profit_participating" | "convertible" | "interest_free";
  original_principal: number | null;
  currency: string;
  execution_date?: string | null;
  maturity_date?: string | null;
  interest_rate?: number | null;
  rate_adjustments?: string | null;
  // New fields for enhanced loan documentation (Phase 1)
  security_type?: "unsecured" | "secured" | "subordinated" | "not_specified";
  guarantee_from_parent?: boolean | null;
  rate_benchmark?: "EURIBOR" | "LIBOR" | "SOFR" | "ESTR" | "fixed" | "not_specified" | null;
  margin_bps?: number | null;
  covenant_indicators?: boolean | null;
  payment_schedule?: "bullet" | "amortizing" | "PIK" | "not_specified" | null;
  current_principal: number | null;
  capitalised_interest?: number | null;
  accrued_interest?: number | null;
  current_year_total: number | null;
  previous_year_total?: number | null;
  note_reference?: string;
  account_caption?: string;
  is_from_shareholder: boolean;
}

export interface AccountCaption {
  code: string;
  description: string;
  current_year: number | null;
  previous_year: number | null;
  is_ic: boolean;
}

export interface EntityGovernance {
  board_members: BoardMember[];
  administrator?: string | null;
  shareholder_name?: string | null;
  shareholder_jurisdiction?: string | null;
}

export interface CashPoolingDetail {
  exists: boolean;
  counterparty?: string;
  receivable_balance: number | null;
  payable_balance: number | null;
}

export interface NotesExtraction {
  shares_in_affiliated_details: ShareholdingDetail[];
  loans_to_affiliated_details: LoanDetail[];
  loans_from_affiliated_details: LoanDetail[];
  // New enhanced loan details (loan-by-loan breakdown)
  detailed_loans_granted?: DetailedLoan[];
  detailed_loans_received?: DetailedLoan[];
  shareholder_loans?: DetailedLoan[];
  account_captions?: AccountCaption[];
  related_party_transactions: string[];
  cash_pooling: CashPoolingDetail;
  employees_fte: number | null;
  off_balance_sheet_commitments: string[];
}

export interface EntityClassification {
  primary_type: "operational" | "holding" | "financing" | "ip_holding" | "mixed";
  // New field for Luxembourg-specific entity sub-types (Phase 1)
  sub_type?: "soparfi" | "spf" | "sicar" | "securitization" | "other" | null;
  activities_description: string | null;
  substance_indicators: string[];
}

// Functional Analysis interfaces - FAR (Functions, Assets, Risks) analysis (Phase 1)
export interface AssetsControlled {
  financial_assets: string[];
  intangible_assets: string[];
  tangible_assets: string[];
}

export interface FunctionalAnalysis {
  functions_performed: string[];
  assets_controlled: AssetsControlled;
  risks_assumed: string[];
  decision_making_location: "Luxembourg" | "abroad" | "mixed" | "not_determinable";
  substance_level: "significant" | "limited" | "minimal";
  substance_notes: string[];
}

// TP Documentation interface - Transfer Pricing documentation references (Phase 1)
export interface TPDocumentation {
  master_file_referenced: boolean;
  local_file_referenced: boolean;
  benchmarking_study_mentioned: boolean;
  tp_policy_disclosed: boolean;
  pricing_method_stated?: "CUP" | "cost_plus" | "resale_minus" | "TNMM" | "profit_split" | "not_disclosed" | null;
  intercompany_agreements_mentioned: boolean;
  documentation_notes: string[];
}

// IP Transaction interface - Individual IP/royalty transaction (Phase 1)
export interface IPTransaction {
  type: "license_in" | "license_out" | "sale" | "purchase";
  counterparty?: string | null;
  amount?: number | null;
  royalty_rate?: number | null;
  ip_type?: "patent" | "trademark" | "software" | "other" | null;
  note_reference?: string | null;
}

// IP Transactions interface - Collection of IP/royalty transactions (Phase 1)
export interface IPTransactions {
  royalty_income_detected: boolean;
  royalty_expense_detected: boolean;
  ip_assets_held: string[];
  transactions: IPTransaction[];
}

// Service Arrangement interface - Individual service arrangement (Phase 1)
export interface ServiceArrangement {
  service_type: "management" | "administrative" | "technical" | "treasury" | "accounting" | "other";
  provider: string;
  recipient: string;
  direction: "inbound" | "outbound";
  annual_amount?: number | null;
  pricing_method?: "cost_plus" | "fixed_fee" | "percentage" | "not_disclosed" | null;
  markup_percentage?: number | null;
  note_reference?: string | null;
}

// Service Arrangements interface - Collection of service arrangements (Phase 1)
export interface ServiceArrangements {
  management_fees_detected: boolean;
  arrangements: ServiceArrangement[];
}

// Arm's Length Assessment interface - Assessment of IC transactions (Phase 1)
export interface ArmsLengthAssessment {
  ic_loans_status: "compliant" | "needs_review" | "potentially_non_compliant" | "insufficient_data";
  rate_comparison_to_market: "above_market" | "at_market" | "below_market" | "undetermined";
  assessment_rationale?: string | null;
  credit_quality_indicator: "investment_grade" | "sub_investment" | "distressed" | "not_determinable";
  benchmark_reference?: string | null;
  flags: string[];
}

export interface TPFlag {
  priority: "high" | "medium" | "low";
  category: string;
  description: string;
  affected_amount: number | null;
  source: string;
  caveats?: string;
}

export interface ICFinancing {
  total_loans_granted: number | null;
  total_loans_received: number | null;
  ic_interest_income: number | null;
  ic_interest_expense: number | null;
  implied_lending_rate: number | null;
  implied_borrowing_rate: number | null;
  spread_bps: number | null;
}

export interface Capitalization {
  total_equity: number | null;
  total_debt_funding_participations: number | null;
  debt_to_equity_ratio: number | null;
  debt_percentage: number | null;
}

export interface TPAnalysis {
  ic_financing: ICFinancing;
  // New field for arm's length assessment (Phase 1)
  arms_length_assessment?: ArmsLengthAssessment;
  ic_services_income: number | null;
  ic_services_expense: number | null;
  capitalization: Capitalization;
  cash_pooling_identified: boolean;
  priority_flags: TPFlag[];
  overall_tp_opportunity_score: "A" | "B" | "C";
  score_rationale: string;
  recommended_focus_areas: string[];
  data_quality_notes: string[];
}

// Company Profile interfaces - AI-generated profile based on PDF content
export interface CompanyProfileSection {
  content: string;
  sources: string[];
  data_availability: "complete" | "partial" | "unavailable";
}

export interface CompanyProfileTPRelevantInfo {
  ic_financing: CompanyProfileSection | null;
  ic_trading: CompanyProfileSection | null;
  ip_transactions: CompanyProfileSection | null;
  cost_sharing: CompanyProfileSection | null;
  management_fees: CompanyProfileSection | null;
}

export interface CompanyProfile {
  company_overview: CompanyProfileSection;
  business_activities: CompanyProfileSection;
  tp_relevant_info: CompanyProfileTPRelevantInfo;
  profile_generated: boolean;
  generation_notes: string[];
}

export interface ExtractionResult {
  // Schema version for tracking extraction format changes
  schema_version?: string;
  metadata: Metadata;
  balance_sheet: BalanceSheet;
  profit_and_loss: ProfitAndLoss;
  notes_extraction: NotesExtraction;
  entity_classification: EntityClassification;
  entity_governance?: EntityGovernance;
  // New sections added in Phase 1
  functional_analysis?: FunctionalAnalysis;
  tp_documentation?: TPDocumentation;
  ip_transactions?: IPTransactions;
  service_arrangements?: ServiceArrangements;
  tp_analysis: TPAnalysis;
  company_profile?: CompanyProfile;
  extraction_cost_usd?: number;
}
