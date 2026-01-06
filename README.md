# TP Extractor

**Luxembourg Transfer Pricing Analysis Tool**

A web application that extracts financial data from Luxembourg annual accounts (PDFs) and produces transfer pricing analysis summaries. Upload a PDF, get structured data + TP opportunity flags. Automates 2-3 hours of manual financial statement review into a 30-second upload for transfer pricing professionals.

## Features

- **PDF Upload**: Drag-and-drop or click-to-upload Luxembourg annual accounts
- **AI-Powered Extraction**: Uses Claude Sonnet to extract structured financial data
- **Real-Time Streaming**: Results populate progressively as extraction streams
- **TP Opportunity Analysis**: Automatic scoring (A/B/C) based on configurable rules
- **Comprehensive Data Display**:
  - Balance Sheet with IC highlighting
  - P&L statement
  - Intercompany details (loans, shareholdings, cash pooling)
  - Priority flags with source citations
- **Inline PDF Viewer**: Split-screen view with zoom and page navigation
- **Export Options**: Excel workbook, JSON download, copy summary for email

## Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes (Node.js)
- **AI**: Anthropic Claude API (Claude Sonnet)
- **PDF**: react-pdf / pdf.js for inline viewing
- **Validation**: Zod for JSON schema validation
- **Theme**: Dark mode first, modern Autocoder-style aesthetic

## Prerequisites

- Node.js 18+
- npm or pnpm
- Anthropic API key

## Quick Start

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd New-TP-Opp
   chmod +x init.sh
   ./init.sh
   ```

2. **Configure API key**:

   Set your Anthropic API key in `.env.local`:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

3. **Start development server**:
   ```bash
   cd tp-extractor
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
tp-extractor/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main page (upload + results)
│   │   ├── layout.tsx                  # Root layout with theme
│   │   ├── globals.css                 # Tailwind + custom styles
│   │   └── api/
│   │       └── extract/
│   │           └── route.ts            # Extraction API endpoint
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components
│   │   ├── upload-zone.tsx             # Drag-drop upload
│   │   ├── results-dashboard.tsx       # Main results container
│   │   ├── summary-cards.tsx           # Metric cards
│   │   ├── tp-flags.tsx                # Priority flags display
│   │   ├── data-tables/
│   │   │   ├── balance-sheet-table.tsx
│   │   │   ├── pnl-table.tsx
│   │   │   ├── ic-details-table.tsx
│   │   │   └── raw-json-viewer.tsx
│   │   ├── pdf-viewer.tsx              # Inline PDF display
│   │   ├── export-buttons.tsx          # Download actions
│   │   └── sticky-score.tsx            # Floating TP score
│   ├── lib/
│   │   ├── claude.ts                   # Claude API client
│   │   ├── prompts.ts                  # Extraction prompts
│   │   ├── schema.ts                   # Zod validation schemas
│   │   ├── excel.ts                    # Excel generation (xlsx)
│   │   ├── analysis.ts                 # TP analysis logic
│   │   └── utils.ts                    # Formatting, helpers
│   └── types/
│       └── extraction.ts               # TypeScript interfaces
├── public/
│   └── logo.svg                        # App logo
├── .env.local                          # ANTHROPIC_API_KEY
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## TP Analysis Rules

### Debt-to-Equity Analysis
- D/E <= 1.5x (<=60% debt): No flag
- D/E 1.5x-5.67x (60-85% debt): Low attention
- D/E 5.67x-10x (85-90% debt): Medium attention
- D/E > 10x (>90% debt): High attention

### Spread Analysis
- Zero spread: < 10 bps
- Low spread: < 25 bps
- Negative spread: Borrowing > lending (unusual)

### Scoring
- **Score A (High)**: Zero/negative spread, OR IC > EUR 100M, OR D/E > 10x, OR 2+ high flags
- **Score B (Medium)**: IC > EUR 20M, OR cash pooling, OR material services, OR D/E 5.67-10x
- **Score C (Low)**: Default if not A or B

## Design System

- **Theme**: Dark mode first
- **Colors**:
  - Background: slate-900/950
  - Cards: slate-800
  - Accent: blue-500, emerald-500, amber-500, red-500
- **Typography**: Inter for text, JetBrains Mono for data
- **Components**: shadcn/ui with rounded corners and smooth transitions

## API Security

- Rate limiting on extraction endpoint
- File size limit: 50MB
- File type validation: PDF only
- Request timeout: 60 seconds
- No user data stored (stateless processing)

## Cost Estimate

~$0.20-0.30 per extraction using Claude Sonnet

## License

Private - Internal tool

## Development

This project uses autonomous AI agents for development. Features are tracked in `features.db` SQLite database.

To check feature progress:
```bash
# Features are managed via MCP tools
# Check features.db for current status
```
