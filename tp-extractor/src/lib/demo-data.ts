import type { ExtractionResult } from "@/types/extraction";

/**
 * Demo extraction data for testing the UI when API key is not configured.
 * This data represents a realistic Luxembourg holding company extraction.
 */
export const DEMO_EXTRACTION_RESULT: ExtractionResult = {
  metadata: {
    company_name: "Luxembourg Holdings S.à r.l.",
    rcs_number: "B 123456",
    address: "2, rue du Fort Bourbon, L-1249 Luxembourg",
    financial_year_start: "2023-01-01",
    financial_year_end: "2023-12-31",
    currency: "EUR",
    account_type: "full",
    extraction_confidence: "high",
    extraction_notes: [
      "DEMO MODE: This is sample data for testing purposes",
      "All values are illustrative and not from a real extraction",
      "Configure ANTHROPIC_API_KEY to enable real PDF extraction",
    ],
  },
  balance_sheet: {
    fixed_assets: {
      items: [
        {
          name: "Shares in affiliated undertakings",
          current_year: 85000000,
          previous_year: 75000000,
          is_ic: true,
          note_reference: "Note 3",
        },
        {
          name: "Loans to affiliated undertakings",
          current_year: 42000000,
          previous_year: 38000000,
          is_ic: true,
          note_reference: "Note 4",
        },
        {
          name: "Other financial assets",
          current_year: 500000,
          previous_year: 450000,
          is_ic: false,
        },
      ],
      total: 127500000,
      previous_year_total: 113450000,
    },
    current_assets: {
      items: [
        {
          name: "Trade receivables",
          current_year: 150000,
          previous_year: 125000,
          is_ic: false,
        },
        {
          name: "Amounts owed by affiliated undertakings",
          current_year: 8500000,
          previous_year: 7200000,
          is_ic: true,
          note_reference: "Note 5",
        },
        {
          name: "Cash at bank and in hand",
          current_year: 2350000,
          previous_year: 3100000,
          is_ic: false,
        },
      ],
      total: 11000000,
      previous_year_total: 10425000,
    },
    prepayments: {
      items: [
        {
          name: "Prepaid expenses",
          current_year: 45000,
          previous_year: 38000,
          is_ic: false,
        },
      ],
      total: 45000,
      previous_year_total: 38000,
    },
    total_assets: 138545000,
    previous_year_total_assets: 123913000,
    capital_and_reserves: {
      items: [
        {
          name: "Subscribed capital",
          current_year: 12500,
          previous_year: 12500,
          is_ic: false,
        },
        {
          name: "Share premium",
          current_year: 25000000,
          previous_year: 25000000,
          is_ic: false,
        },
        {
          name: "Legal reserve",
          current_year: 1250,
          previous_year: 1250,
          is_ic: false,
        },
        {
          name: "Retained earnings",
          current_year: 12500000,
          previous_year: 9800000,
          is_ic: false,
        },
        {
          name: "Profit for the financial year",
          current_year: 4850000,
          previous_year: 3950000,
          is_ic: false,
        },
      ],
      total: 42363750,
      previous_year_total: 38763750,
    },
    provisions: {
      items: [
        {
          name: "Provisions for taxation",
          current_year: 180000,
          previous_year: 150000,
          is_ic: false,
        },
      ],
      total: 180000,
      previous_year_total: 150000,
    },
    creditors: {
      items: [
        {
          name: "Amounts owed to credit institutions",
          current_year: 35000000,
          previous_year: 30000000,
          is_ic: false,
          note_reference: "Note 6",
        },
        {
          name: "Trade payables",
          current_year: 85000,
          previous_year: 72000,
          is_ic: false,
        },
        {
          name: "Amounts owed to affiliated undertakings",
          current_year: 60000000,
          previous_year: 54000000,
          is_ic: true,
          note_reference: "Note 7",
        },
        {
          name: "Other creditors",
          current_year: 916250,
          previous_year: 927250,
          is_ic: false,
        },
      ],
      total: 96001250,
      previous_year_total: 84999250,
    },
    total_liabilities: 138545000,
    previous_year_total_liabilities: 123913000,
  },
  profit_and_loss: {
    income_items: [
      {
        name: "Income from participating interests - affiliated",
        current_year: 3200000,
        previous_year: 2800000,
        is_ic: true,
        note_reference: "Note 8",
      },
      {
        name: "Interest receivable - affiliated undertakings",
        current_year: 2100000,
        previous_year: 1850000,
        is_ic: true,
        note_reference: "Note 9",
      },
      {
        name: "Interest receivable - other",
        current_year: 45000,
        previous_year: 52000,
        is_ic: false,
      },
      {
        name: "Management fee income",
        current_year: 850000,
        previous_year: 780000,
        is_ic: true,
      },
    ],
    expense_items: [
      {
        name: "Interest payable - affiliated undertakings",
        current_year: 1200000,
        previous_year: 1080000,
        is_ic: true,
        note_reference: "Note 10",
      },
      {
        name: "Interest payable - other",
        current_year: 875000,
        previous_year: 720000,
        is_ic: false,
      },
      {
        name: "External charges",
        current_year: 320000,
        previous_year: 285000,
        is_ic: false,
      },
      {
        name: "Staff costs",
        current_year: 180000,
        previous_year: 165000,
        is_ic: false,
      },
      {
        name: "Tax on profit",
        current_year: 170000,
        previous_year: 132000,
        is_ic: false,
      },
    ],
    operating_result: -500000,
    financial_result: 5270000,
    profit_for_year: 4850000,
    previous_year_profit: 3950000,
  },
  notes_extraction: {
    shares_in_affiliated_details: [
      {
        counterparty: "German OpCo GmbH",
        country: "Germany",
        percentage: 100,
        carrying_value: 45000000,
        equity_value: 52000000,
      },
      {
        counterparty: "French Holdings SAS",
        country: "France",
        percentage: 100,
        carrying_value: 28000000,
        equity_value: 31500000,
      },
      {
        counterparty: "UK Services Ltd",
        country: "United Kingdom",
        percentage: 75,
        carrying_value: 12000000,
        equity_value: 15800000,
      },
    ],
    loans_to_affiliated_details: [
      {
        counterparty: "German OpCo GmbH",
        currency: "EUR",
        amount: 25000000,
        interest_rate: 4.5,
        maturity_date: "2026-12-31",
        note_reference: "Note 4",
      },
      {
        counterparty: "French Holdings SAS",
        currency: "EUR",
        amount: 17000000,
        interest_rate: 4.25,
        maturity_date: "2025-06-30",
        note_reference: "Note 4",
      },
    ],
    loans_from_affiliated_details: [
      {
        counterparty: "Parent Corp B.V.",
        currency: "EUR",
        amount: 60000000,
        interest_rate: 2.0,
        maturity_date: "2028-12-31",
        note_reference: "Note 7",
      },
    ],
    related_party_transactions: [
      "Management services provided to German OpCo GmbH: EUR 500,000",
      "Management services provided to French Holdings SAS: EUR 350,000",
      "Treasury services from Parent Corp B.V.: EUR 75,000",
    ],
    cash_pooling: {
      exists: true,
      counterparty: "Parent Corp B.V.",
      receivable_balance: 8500000,
      payable_balance: null,
    },
    employees_fte: 2,
    off_balance_sheet_commitments: [
      "Guarantee in favor of German OpCo GmbH for bank facility: EUR 15,000,000",
      "Letter of support to UK Services Ltd",
    ],
  },
  entity_classification: {
    primary_type: "holding",
    activities_description:
      "The company's principal activity is the holding of participations in affiliated companies and the provision of intra-group financing and management services.",
    substance_indicators: [
      "2 full-time employees based in Luxembourg",
      "Board meetings held quarterly in Luxembourg",
      "Local bank accounts and treasury management",
      "Registered office with dedicated space",
    ],
  },
  tp_analysis: {
    ic_financing: {
      total_loans_granted: 42000000,
      total_loans_received: 60000000,
      ic_interest_income: 2100000,
      ic_interest_expense: 1200000,
      implied_lending_rate: 5.0,
      implied_borrowing_rate: 2.0,
      spread_bps: 300,
    },
    ic_services_income: 850000,
    ic_services_expense: 75000,
    capitalization: {
      total_equity: 42363750,
      total_debt_funding_participations: 60000000,
      debt_to_equity_ratio: 1.42,
      debt_percentage: 58.6,
    },
    cash_pooling_identified: true,
    priority_flags: [
      {
        priority: "high",
        category: "IC Financing",
        description:
          "Significant interest rate spread between IC lending (5.0%) and IC borrowing (2.0%) rates. Spread of 300 bps may require benchmarking to demonstrate arm's length pricing.",
        affected_amount: 102000000,
        source: "Notes 4, 7, 9, 10",
        caveats:
          "Implied rates calculated from annual averages; actual rates may vary by instrument.",
      },
      {
        priority: "high",
        category: "IC Financing",
        description:
          "Total IC financial exposure exceeds EUR 100M threshold. Entity is a significant financing hub requiring robust TP documentation.",
        affected_amount: 110500000,
        source: "Balance Sheet",
      },
      {
        priority: "medium",
        category: "Cash Pooling",
        description:
          "Cash pooling arrangement with Parent Corp B.V. identified. Intercompany cash pool balances and remuneration should be documented.",
        affected_amount: 8500000,
        source: "Note 5",
      },
      {
        priority: "medium",
        category: "Management Services",
        description:
          "Management fee income of EUR 850,000 charged to affiliates. Service agreements and cost-plus margins should be documented.",
        affected_amount: 850000,
        source: "P&L",
      },
      {
        priority: "low",
        category: "Guarantees",
        description:
          "Off-balance sheet guarantee provided to German OpCo GmbH. Consider whether guarantee fee is being charged.",
        affected_amount: 15000000,
        source: "Off-BS commitments",
      },
    ],
    overall_tp_opportunity_score: "A",
    score_rationale:
      "Score A (High Priority) assigned due to: (1) Total IC financial exposure exceeding EUR 100M, (2) Significant interest rate spread requiring benchmarking analysis, (3) Multiple IC transaction types including financing, services, and cash pooling.",
    recommended_focus_areas: [
      "Benchmark IC lending rates against market comparables",
      "Review IC borrowing rate vs. external bank funding cost",
      "Document management service fee methodology and cost base",
      "Assess arm's length remuneration for cash pooling participation",
      "Consider guarantee fee policy for off-balance sheet support",
    ],
    data_quality_notes: [
      "DEMO MODE: All figures are illustrative sample data",
      "Full extraction from actual PDF will provide verified figures",
      "Configure ANTHROPIC_API_KEY to enable real extractions",
    ],
  },
  extraction_cost_usd: 0,
};
