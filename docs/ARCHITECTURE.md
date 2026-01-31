# System Architecture

TP Extractor - Luxembourg Transfer Pricing Analysis Tool

## Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Convex        │────▶│   Claude API    │
│   (Next.js)     │     │   (Backend)     │     │   (Anthropic)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Clerk Auth    │     │   Convex DB     │
│   (External)    │     │   (PostgreSQL)  │
└─────────────────┘     └─────────────────┘
```

## Components

### Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **State**: React hooks + Convex real-time subscriptions
- **PDF Viewer**: react-pdf / pdf.js
- **Theme**: Dark mode first

### Backend (Convex)
- **Database**: Convex (PostgreSQL under the hood)
- **Functions**: Queries, Mutations, Actions
- **File Storage**: Convex file storage for PDFs
- **Timeout**: 10-minute action timeout (vs Vercel's 10 seconds)

### AI Processing (Claude)
- **Model**: Claude Sonnet (claude-sonnet-4-20250514)
- **Input**: PDF documents (base64 encoded)
- **Output**: Structured JSON (validated with Zod)
- **Cost**: ~$0.20-0.30 per extraction

### Authentication (Clerk)
- **Provider**: Clerk (external auth service)
- **Integration**: Convex auth adapter
- **Features**: Sign in, sign up, user management

## Data Flow

```
1. User Upload
   └─▶ UploadZone component accepts PDF
       └─▶ File validated (type, size ≤ 50MB)
           └─▶ Stored in Convex file storage

2. Extraction Request
   └─▶ Frontend calls useAction(api.actions.extractPdf.extract)
       └─▶ Convex action retrieves PDF from storage
           └─▶ Converts to base64
               └─▶ Sends to Claude API with extraction prompts

3. AI Processing
   └─▶ Claude analyzes PDF content
       └─▶ Extracts structured data (company info, financials, TP flags)
           └─▶ Returns JSON response

4. Validation & Storage
   └─▶ Response validated with Zod schemas
       └─▶ Stored in Convex 'extractions' table
           └─▶ Real-time update pushed to frontend

5. Display
   └─▶ StreamingResultsDashboard receives update
       └─▶ Renders summary cards, tables, charts
           └─▶ Export options (JSON, Excel)
```

## Key Directories

```
/
├── convex/                    # Backend
│   ├── _generated/           # Convex codegen
│   ├── actions/              # Server actions
│   │   └── extractPdf.ts    # Main extraction action
│   ├── lib/                  # Shared utilities
│   ├── schema.ts             # Database schema
│   ├── extractions.ts        # CRUD functions
│   └── auth.config.ts        # Clerk integration
│
├── src/
│   ├── app/                  # Next.js pages
│   │   ├── analyze/         # Main extraction page
│   │   ├── history/         # Past extractions
│   │   └── api/             # API routes (minimal)
│   │
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui base
│   │   └── [feature]/       # Feature components
│   │
│   ├── hooks/                # React hooks
│   │   └── useStreamingExtraction.ts
│   │
│   ├── lib/                  # Utilities
│   │   ├── schema.ts        # Zod validation
│   │   ├── prompts.ts       # Claude prompts
│   │   └── claude.ts        # API client (deprecated)
│   │
│   └── types/                # TypeScript interfaces
│
├── docs/                      # Documentation
├── scripts/                   # Utility scripts
└── public/                    # Static assets
```

## Database Schema

### extractions table
```typescript
{
  _id: Id<"extractions">
  _creationTime: number
  userId: string
  pdfStorageId: Id<"_storage">
  fileName: string
  fileSize: number
  status: "pending" | "processing" | "completed" | "failed"
  result?: ExtractionResult  // Validated JSON
  error?: string
  processingTimeMs?: number
  schemaVersion?: string
}
```

## Security Considerations

1. **API Keys**: Stored in Convex environment variables (never in frontend)
2. **Authentication**: All routes protected by Clerk
3. **File Validation**: Type and size checks before upload
4. **Data Isolation**: Users only see their own extractions

## Performance Notes

- PDF size limit: 50MB
- Extraction timeout: 10 minutes (Convex action limit)
- Real-time updates via Convex subscriptions
- Client-side PDF rendering with pdf.js
