# TP Analysis Configuration

## Overview

This file defines the analysis rules applied to extracted financial data. You can modify these rules to adjust what gets flagged and how opportunities are scored.

The app separates **extraction** (getting data from PDF) from **analysis** (interpreting that data). This file controls the analysis layer.

---

## Analysis Philosophy

**Important Luxembourg TP Context:**

1. There is **no statutory thin capitalisation safe harbour** in Luxembourg
2. The historical 85:15 debt-to-equity guideline for debt funding participations is **indicative, not prescriptive**
3. Every situation requires case-by-case analysis based on:
   - Nature of the debt (funding participations vs. operational)
   - Arm's length comparables
   - Group financing policy
   - Substance and functions

4. The app identifies **potential issues for review**, not definitive compliance problems

---

## Configurable Analysis Rules

### 1. Debt-to-Equity Analysis (for debt funding participations)

```yaml
debt_equity_analysis:
  description: "Analyzes leverage for debt that funds participations in subsidiaries"
  
  # What counts as "debt funding participations"
  debt_components:
    - loans_from_affiliated_undertakings
    - bank_loans_funding_participations  # if identifiable
    - debenture_loans_funding_participations  # if identifiable
  
  # The equity base
  equity_components:
    - subscribed_capital
    - share_premium
    - reserves
    - profit_brought_forward
    # Note: Current year P&L may or may not be included depending on analysis
  
  # Reference: D/E ratio to Debt%/Equity% conversion
  # D/E 1.0x  = 50% debt / 50% equity
  # D/E 1.5x  = 60% debt / 40% equity
  # D/E 5.67x = 85% debt / 15% equity
  # D/E 9.0x  = 90% debt / 10% equity
  # D/E 19.0x = 95% debt / 5% equity
  # D/E 49.0x = 98% debt / 2% equity
  
  # Thresholds based on market practice and risk levels
  thresholds:
    no_flag: 1.5           # ≤ 60% debt / ≥ 40% equity — within typical third-party benchmarks
    low_attention: 5.67    # 60-85% debt / 40-15% equity — within historical guideline but above benchmarks
    medium_attention: 10.0 # 85-90% debt / 15-10% equity — exceeds guideline, needs benchmarking
    high_attention: 10.0   # > 90% debt / < 10% equity — significant excess, recharacterisation risk
  
  # Output flags and descriptions
  flags:
    no_flag:
      priority: "none"
      description: "Debt/equity within typical third-party benchmark range (≤60% debt)"
      action: "No specific TP concern on capitalisation"
    
    low_attention:
      priority: "low"
      description: "Above third-party typical but within historical 85:15 guideline"
      action: "Consider benchmarking to support debt level"
    
    medium_attention:
      priority: "medium"
      description: "Exceeds 85:15 historical guideline — arm's length benchmarking required"
      action: "Obtain third-party benchmark study to support debt funding level"
    
    high_attention:
      priority: "high"
      description: "Significant excess debt funding (>90% debt) — risk of interest deduction denial or recharacterisation to dividend"
      action: "High risk of tax authority challenge. Interest deduction may be denied. If recharacterised as dividend, subject to WHT. Urgent review required."
  
  # Tax risk context
  tax_risks:
    deduction_denial: "Tax authorities may deny interest deduction on 'excessive' debt portion"
    recharacterisation: "Interest payments may be recharacterised as dividends, triggering withholding tax"
    transfer_pricing: "Arm's length principle requires debt level comparable to what third party would provide"
  
  # Important caveats
  caveats:
    - "Luxembourg has no statutory thin cap safe harbour"
    - "The 85:15 guideline is historical market practice, not a legal threshold"
    - "Third-party benchmarks typically show 60% debt / 40% equity for holding structures"
    - "Each case requires individual analysis based on specific facts and circumstances"
    - "Arm's length benchmarking is the proper approach, not mechanical ratios"
```

### 2. Intercompany Financing Analysis

```yaml
ic_financing_analysis:
  description: "Identifies IC financing arrangements and potential pricing issues"
  
  # What we're looking for
  ic_assets:
    - loans_to_affiliated_undertakings  # C.III.2 - fixed assets
    - amounts_owed_by_affiliated_current  # D.II.2 - current assets
  
  ic_liabilities:
    - amounts_owed_to_affiliated  # C.6
    - cash_pooling_liabilities  # If disclosed separately
  
  ic_income:
    - interest_income_from_affiliated  # P&L items 10a, 11a
  
  ic_expense:
    - interest_expense_to_affiliated  # P&L item 14a
  
  # Spread analysis
  spread_calculation:
    method: "implied_rate_comparison"
    # Note: Implied rates are approximations based on year-end balances
    # Actual rates may differ due to timing, currency, etc.
    
    implied_lending_rate: "ic_interest_income / average_ic_loans_granted"
    implied_borrowing_rate: "ic_interest_expense / average_ic_loans_received"
    spread: "implied_lending_rate - implied_borrowing_rate"
  
  # Thresholds for flagging
  spread_thresholds:
    zero_spread_bps: 10      # < 10 bps = essentially zero
    low_spread_bps: 25       # < 25 bps = very thin margin
    normal_range_min_bps: 25
    normal_range_max_bps: 100
  
  # Flags
  flags:
    zero_spread:
      priority: "high"
      description: "Zero or near-zero spread on IC financing suggests no TP margin"
      action: "Review financing policy and pricing documentation"
    
    negative_spread:
      priority: "high" 
      description: "Borrowing rate exceeds lending rate - unusual for intermediary"
      action: "Verify data accuracy; if correct, review commercial rationale"
    
    large_ic_financing:
      priority: "medium"
      threshold: 50000000  # EUR 50M
      description: "Material IC financing activity"
      action: "Ensure appropriate documentation exists"
  
  # Important caveats
  caveats:
    - "Implied rates based on year-end balances may not reflect actual contractual rates"
    - "Currency mix and timing differences affect rate calculations"
    - "Review actual loan agreements for contractual terms"
```

### 3. Cash Pooling Analysis

```yaml
cash_pooling_analysis:
  description: "Identifies cash pooling arrangements from notes"
  
  # Detection
  # Cash pooling is typically disclosed in notes to receivables/payables
  # Look for: "cash pooling", "cash management", "treasury arrangements"
  
  detection_sources:
    - notes_to_debtors
    - notes_to_creditors
    - related_party_transactions_note
  
  # What to extract
  data_points:
    - counterparty_name  # Usually group treasury entity
    - asset_balance      # Cash pooling receivable
    - liability_balance  # Cash pooling payable
    - interest_rate_disclosed  # If available
    - netting_allowed    # Physical vs notional
  
  # Flags
  flags:
    cash_pooling_present:
      priority: "medium"
      description: "Cash pooling arrangement identified"
      action: "Review cash pool terms: leader compensation, interest allocation, credit risk"
    
    large_cash_pool_balance:
      priority: "medium"
      threshold: 10000000  # EUR 10M
      description: "Material cash pool position"
      action: "Verify arm's length compensation for cash pool leader"
  
  # Analysis points to highlight
  review_points:
    - "Cash pool leader compensation (typically 5-10 bps on notional)"
    - "Interest rates applied to participants vs. third party alternatives"
    - "Credit risk allocation among participants"
    - "Physical vs notional pooling structure"
```

### 4. Corporate Services Analysis

```yaml
corporate_services_analysis:
  description: "Identifies IC service fee arrangements"
  
  # P&L items
  income_items:
    - other_operating_income  # Often includes IC service recharges
  
  expense_items:
    - other_external_expenses  # May include IC service charges received
  
  # Notes disclosure
  notes_sources:
    - related_party_transactions
    - note_to_operating_income
    - note_to_external_expenses
  
  # Types of services to identify
  service_types:
    - management_fees
    - administrative_services
    - IT_services
    - HR_services
    - procurement_services
    - R_and_D_services
    - royalties_and_licenses
  
  # Flags
  flags:
    material_service_fees:
      priority: "medium"
      threshold: 5000000  # EUR 5M
      description: "Material IC service fee activity"
      action: "Review service agreements and pricing methodology"
    
    service_fee_imbalance:
      priority: "low"
      description: "Significant difference between services charged and received"
      action: "Verify consistency with group service model"
```

### 5. Entity Classification

```yaml
entity_classification:
  description: "Classifies entity type based on financial profile"
  
  # Classification logic
  types:
    holding:
      indicators:
        - shares_in_affiliated > 50% of total_assets
        - dividend_income > 50% of total_income
        - minimal_turnover
      typical_functions: "Holds and manages participations"
    
    financing:
      indicators:
        - ic_loans_granted > 30% of total_assets
        - interest_income_ic > 30% of total_income
        - on-lending_activity
      typical_functions: "Provides intragroup financing"
    
    operational:
      indicators:
        - turnover > 50% of total_income
        - material_staff_costs
        - tangible_assets_present
      typical_functions: "Conducts trading or manufacturing"
    
    mixed:
      indicators:
        - combination_of_above
      typical_functions: "Multiple activities"
  
  # Substance indicators
  substance_factors:
    - employee_count
    - staff_costs
    - office_presence  # Registered office in Luxembourg
    - local_management  # Directors, decision-making
```

---

## Scoring Framework

```yaml
opportunity_scoring:
  description: "Determines overall TP opportunity priority"
  
  # Score is A (high), B (medium), or C (low)
  
  scoring_logic:
    # A = High Priority - Immediate attention
    score_A_criteria:
      any_of:
        - zero_or_negative_spread: true
        - ic_financing_total > 100000000  # EUR 100M
        - debt_equity_ratio > 10.0  # > 90% debt funding - recharacterisation risk
        - multiple_high_flags: >= 2
    
    # B = Medium Priority - Worth reviewing
    score_B_criteria:
      any_of:
        - ic_financing_total > 20000000  # EUR 20M
        - cash_pooling_present: true
        - material_service_fees: true
        - debt_equity_ratio > 5.67  # 85-90% debt - exceeds historical guideline
    
    # C = Low Priority - Monitor
    score_C_criteria:
      default: true  # If not A or B
  
  # Output text
  score_descriptions:
    A: "High priority - significant concerns requiring immediate attention (excess leverage, zero spread, or large IC exposure)"
    B: "Medium priority - material IC transactions warrant documentation review"
    C: "Lower priority - limited IC activity or within typical market ranges"
```

---

## How to Modify This Configuration

### To change a threshold:
Find the relevant `threshold` value and adjust. Example:
```yaml
# Change when "large IC financing" flag triggers
large_ic_financing:
  threshold: 100000000  # Changed from EUR 50M to EUR 100M
```

### To add a new flag:
Add a new entry under the relevant `flags` section:
```yaml
new_flag_name:
  priority: "medium"
  threshold: 10000000  # if applicable
  description: "What this flag means"
  action: "What to do about it"
```

### To disable a flag:
Set `enabled: false`:
```yaml
cash_pooling_present:
  enabled: false  # Won't be flagged
```

### To change scoring:
Modify the `scoring_logic` criteria to adjust what qualifies as A, B, or C.

---

## Important Notes

1. **These rules inform, they don't determine compliance** — The app highlights areas for professional review, not definitive answers

2. **Implied rates are estimates** — Year-end balances don't capture intra-year fluctuations, currency effects, or actual contractual rates

3. **Luxembourg context** — No thin cap safe harbour exists. Historical guidelines are indicative only.

4. **Source everything** — When the app flags something, it should cite where in the PDF that data came from

5. **Professional judgment required** — This tool assists TP professionals, it doesn't replace them
