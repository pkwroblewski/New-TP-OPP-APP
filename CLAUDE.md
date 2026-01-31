# CLAUDE.md - Project Instructions

## Quick Reference

| | |
|---|---|
| **Project** | TP Extractor - Luxembourg Transfer Pricing Analysis |
| **Stack** | Next.js 14 + Convex + Claude AI + Clerk Auth |
| **Status** | Production - [See STATUS.md](.claude/STATUS.md) |
| **Production** | https://tp-extractor.vercel.app |

## Documentation Index

| Document | Purpose |
|----------|---------|
| [.claude/STATUS.md](.claude/STATUS.md) | Current status & known issues |
| [.claude/CHANGELOG.md](.claude/CHANGELOG.md) | Recent changes |
| [.claude/rules/](.claude/rules/) | Coding rules & guidelines |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture |
| [docs/TP_ANALYSIS_CONFIG.md](docs/TP_ANALYSIS_CONFIG.md) | TP analysis rules |
| [docs/README.md](docs/README.md) | Full documentation index |

## Development Commands

```bash
# Start both servers (run in separate terminals)
npm run dev            # Start Next.js dev server
npx convex dev         # Start Convex dev server

# Build and lint
npm run build          # Production build
npm run lint           # ESLint

# Convex commands
npx convex deploy      # Deploy to production
npx convex dashboard   # Open Convex dashboard
npx convex logs        # View logs
```

## Key Files

| File | Purpose |
|------|---------|
| `convex/actions/extractPdf.ts` | Main extraction action (Claude API) |
| `src/hooks/useStreamingExtraction.ts` | Frontend extraction hook |
| `src/lib/schema.ts` | Zod validation schemas |
| `convex/schema.ts` | Database schema |

## Project Structure

```
/
├── convex/           # Backend (schema, actions, functions)
├── src/
│   ├── app/         # Next.js pages & API routes
│   ├── components/  # React components
│   ├── hooks/       # Custom hooks
│   ├── lib/         # Utilities & schemas
│   └── types/       # TypeScript interfaces
├── docs/            # Documentation
├── scripts/         # Utility scripts
└── public/          # Static assets
```

## Rules

See [.claude/rules/](.claude/rules/) for coding standards:
- [convex-rules.md](.claude/rules/convex-rules.md) - Convex patterns
- [convex-ai-docs.md](.claude/rules/convex-ai-docs.md) - AI best practices

## Important Notes

- API keys in `.env.local` (never commit) and Convex dashboard
- PDF size limit: 50MB
- Cost: ~$0.20-0.30 per extraction
- Features tracked in `.local/data/features.db`
