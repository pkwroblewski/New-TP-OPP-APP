"use client";

import { NotesExtraction, ICFinancing } from "@/types/extraction";
import { formatEUR, formatPercentage, formatBps, formatDate } from "@/lib/utils";

interface ICDetailsTableProps {
  notes: NotesExtraction;
  icFinancing: ICFinancing;
}

export default function ICDetailsTable({ notes, icFinancing }: ICDetailsTableProps) {
  const hasLoansTo = notes.loans_to_affiliated_details.length > 0;
  const hasLoansFrom = notes.loans_from_affiliated_details.length > 0;
  const hasShares = notes.shares_in_affiliated_details.length > 0;
  const hasCashPooling = notes.cash_pooling.exists;
  const hasRelatedParty = notes.related_party_transactions.length > 0;

  return (
    <div className="space-y-8">
      {/* IC Financing Summary */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          IC Financing Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Loans Granted</p>
            <p className="text-xl font-mono text-slate-100">
              {formatEUR(icFinancing.total_loans_granted)}
            </p>
          </div>
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Loans Received</p>
            <p className="text-xl font-mono text-slate-100">
              {formatEUR(icFinancing.total_loans_received)}
            </p>
          </div>
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <p className="text-sm text-slate-400">IC Interest Income</p>
            <p className="text-xl font-mono text-slate-100">
              {formatEUR(icFinancing.ic_interest_income)}
            </p>
          </div>
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <p className="text-sm text-slate-400">IC Interest Expense</p>
            <p className="text-xl font-mono text-slate-100">
              {formatEUR(icFinancing.ic_interest_expense)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Implied Lending Rate</p>
            <p className="text-xl font-mono text-slate-100">
              {icFinancing.implied_lending_rate !== null
                ? formatPercentage(icFinancing.implied_lending_rate)
                : "-"}
            </p>
          </div>
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Implied Borrowing Rate</p>
            <p className="text-xl font-mono text-slate-100">
              {icFinancing.implied_borrowing_rate !== null
                ? formatPercentage(icFinancing.implied_borrowing_rate)
                : "-"}
            </p>
          </div>
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Spread</p>
            <p className="text-xl font-mono text-slate-100">
              {formatBps(icFinancing.spread_bps)}
            </p>
          </div>
        </div>
      </div>

      {/* Shares in Affiliated */}
      {hasShares && (
        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Shares in Affiliated Undertakings
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
                    Counterparty
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
                    Country
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                    % Held
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                    Carrying Value
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                    Equity Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {notes.shares_in_affiliated_details.map((share, index) => (
                  <tr key={index} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3 text-slate-300">
                      {share.counterparty}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {share.country || "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                      {share.percentage !== undefined
                        ? `${share.percentage}%`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                      {formatEUR(share.carrying_value)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-400">
                      {formatEUR(share.equity_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loans to Affiliated */}
      {hasLoansTo && (
        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Loans to Affiliated Undertakings
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
                    Counterparty
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-400">
                    Currency
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                    Interest Rate
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
                    Maturity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {notes.loans_to_affiliated_details.map((loan, index) => (
                  <tr key={index} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3 text-slate-300">
                      {loan.counterparty}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400">
                      {loan.currency}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                      {formatEUR(loan.amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                      {loan.interest_rate !== null && loan.interest_rate !== undefined
                        ? `${loan.interest_rate}%`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatDate(loan.maturity_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loans from Affiliated */}
      {hasLoansFrom && (
        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Loans from Affiliated Undertakings
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
                    Counterparty
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-400">
                    Currency
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                    Interest Rate
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
                    Maturity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {notes.loans_from_affiliated_details.map((loan, index) => (
                  <tr key={index} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3 text-slate-300">
                      {loan.counterparty}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400">
                      {loan.currency}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                      {formatEUR(loan.amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                      {loan.interest_rate !== null && loan.interest_rate !== undefined
                        ? `${loan.interest_rate}%`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatDate(loan.maturity_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cash Pooling */}
      {hasCashPooling && (
        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Cash Pooling
          </h3>
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-400">Counterparty</p>
                <p className="text-slate-100">
                  {notes.cash_pooling.counterparty || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Receivable Balance</p>
                <p className="font-mono text-slate-100">
                  {formatEUR(notes.cash_pooling.receivable_balance)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Payable Balance</p>
                <p className="font-mono text-slate-100">
                  {formatEUR(notes.cash_pooling.payable_balance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Related Party Transactions */}
      {hasRelatedParty && (
        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Related Party Transactions
          </h3>
          <ul className="space-y-2">
            {notes.related_party_transactions.map((transaction, index) => (
              <li
                key={index}
                className="bg-slate-700/30 p-3 rounded-lg text-slate-300"
              >
                {transaction}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty state */}
      {!hasLoansTo &&
        !hasLoansFrom &&
        !hasShares &&
        !hasCashPooling &&
        !hasRelatedParty && (
          <div className="text-center py-8 text-slate-400">
            No intercompany details extracted from this document.
          </div>
        )}
    </div>
  );
}
