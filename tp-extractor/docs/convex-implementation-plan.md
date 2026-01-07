# Convex Implementation Plan for TP Extractor

> **First-time Convex user guide** - Keep this file as a reference!

---

## What is Convex?

Convex is a backend-as-a-service that gives you:
- **Database** - NoSQL document store with TypeScript types
- **Functions** - Serverless functions (queries, mutations, actions)
- **Auth** - Built-in authentication
- **Real-time** - Automatic live updates

**Why we chose it:** Easier than Supabase for this project - no SQL, auto-generated types, simpler mental model.

---

## Project Goals

| Feature | Description |
|---------|-------------|
| User Auth | Team login (2-10 users) |
| Save Extractions | Store extraction results in database |
| History | View past 30 days of extractions |
| Auto-cleanup | Delete old extractions automatically |

---

## Phase 1: Convex Setup

### Step 1: Create Convex Account
1. Go to https://convex.dev
2. Sign up (GitHub recommended)

### Step 2: Initialize Convex in Project

```bash
cd tp-extractor

# Initialize Convex (first time links your account)
npx convex dev
```

**Answer the prompts:**
- What would you like to configure? → **New Project**
- Project Name? → **tp-extractor** (pre-filled usually)
- Use cloud or local? → **cloud deployment**

Then press `Ctrl+C` to stop the process.

### Step 3: Install Convex Package

```bash
npm add convex
```

### Step 4: Create convex.json (CRITICAL!)

Create `convex.json` in project root (same level as `package.json`):

```json
{
  "$schema": "https://raw.githubusercontent.com/get-convex/convex-backend/refs/heads/main/npm-packages/convex/schemas/convex.schema.json",
  "codegen": {
    "staticApi": true,
    "staticDataModel": true
  }
}
```

> **Why?** This prevents TypeScript errors like "implicitly has type 'any'" when using AI to generate code. Add this early!

### Step 5: Create Schema

Create `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  extractions: defineTable({
    userId: v.string(),
    companyName: v.optional(v.string()),
    rcsNumber: v.optional(v.string()),
    financialYearStart: v.optional(v.string()),
    financialYearEnd: v.optional(v.string()),
    currency: v.string(),
    tpScore: v.union(v.literal("A"), v.literal("B"), v.literal("C")),
    totalAssets: v.optional(v.number()),
    totalIcExposure: v.optional(v.number()),
    flagsCount: v.number(),
    extractionData: v.any(), // Full JSON extraction result
    extractionCostUsd: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_creation", ["_creationTime"]),
});
```

### Step 6: Create Functions

Create `convex/extractions.ts`:

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List user's extractions (last 30 days)
export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    return await ctx.db
      .query("extractions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.gte(q.field("_creationTime"), thirtyDaysAgo))
      .order("desc")
      .collect();
  },
});

// Save a new extraction
export const save = mutation({
  args: {
    companyName: v.optional(v.string()),
    rcsNumber: v.optional(v.string()),
    financialYearStart: v.optional(v.string()),
    financialYearEnd: v.optional(v.string()),
    currency: v.string(),
    tpScore: v.union(v.literal("A"), v.literal("B"), v.literal("C")),
    totalAssets: v.optional(v.number()),
    totalIcExposure: v.optional(v.number()),
    flagsCount: v.number(),
    extractionData: v.any(),
    extractionCostUsd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db.insert("extractions", {
      userId: identity.subject,
      ...args,
    });
  },
});

// Get single extraction by ID
export const get = query({
  args: { id: v.id("extractions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Delete an extraction
export const remove = mutation({
  args: { id: v.id("extractions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const extraction = await ctx.db.get(args.id);
    if (!extraction || extraction.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
  },
});
```

### Step 7: Start Dev Server

```bash
# Terminal 1: Convex dev server
npx convex dev

# Terminal 2: Next.js dev server
npm run dev
```

> **Keep both running while developing!**

---

## Phase 2: Auth Integration (Using Clerk)

> **Note:** The old `npx convex auth` command was removed. We now use **Clerk** for authentication.

### Step 1: Create Clerk Account

1. Go to https://clerk.com
2. Sign up for free account
3. Create a new application
4. Choose "Email" as sign-in method (simplest for small team)

### Step 2: Get Clerk Keys

From your Clerk Dashboard → API Keys, copy:
- **Publishable Key** (starts with `pk_test_` or `pk_live_`)
- **Secret Key** (starts with `sk_test_` or `sk_live_`)
- **JWT Issuer Domain** (from JWT Templates → Convex template)

### Step 3: Add Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE
CLERK_JWT_ISSUER_DOMAIN=https://YOUR_CLERK_DOMAIN.clerk.accounts.dev
```

### Step 4: Set Convex Environment Variable

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://YOUR_CLERK_DOMAIN.clerk.accounts.dev"
```

### Step 5: Install Clerk

```bash
npm install @clerk/nextjs
```

### Step 6: Create Auth Config

Create `convex/auth.config.ts`:

```typescript
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
```

### Step 7: Create Middleware

Create `src/middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### Step 8: Create Convex Provider

Create `src/components/convex-provider.tsx`:

```typescript
"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

### Step 9: Wrap App with Provider

Update `src/app/layout.tsx`:

```typescript
import { ConvexClientProvider } from "@/components/convex-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

### Step 10: Create Sign-in/Sign-up Pages

Create `src/app/sign-in/[[...sign-in]]/page.tsx`:

```typescript
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <SignIn />
    </div>
  );
}
```

Create `src/app/sign-up/[[...sign-up]]/page.tsx`:

```typescript
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <SignUp />
    </div>
  );
}
```

---

## Phase 3: App Integration

### Saving Extractions

In your extraction completion handler:

```typescript
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// Inside component
const saveExtraction = useMutation(api.extractions.save);

// After extraction completes
await saveExtraction({
  companyName: result.metadata.company_name,
  rcsNumber: result.metadata.rcs_number,
  tpScore: result.tp_analysis.overall_tp_opportunity_score,
  extractionData: result,
  // ... other fields
});
```

### History Page

Create `src/app/history/page.tsx`:

```typescript
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function HistoryPage() {
  const extractions = useQuery(api.extractions.list);

  if (!extractions) return <div>Loading...</div>;

  return (
    <div>
      <h1>Extraction History</h1>
      {extractions.map((extraction) => (
        <div key={extraction._id}>
          {extraction.companyName} - Score {extraction.tpScore}
        </div>
      ))}
    </div>
  );
}
```

---

## Phase 4: Deploy

### Step 1: Deploy Convex Backend

```bash
npx convex deploy
```

This pushes your functions and schema to production.

### Step 2: Set Production Environment Variables

```bash
npx convex env set ANTHROPIC_API_KEY "your-key-here" --prod
```

### Step 3: Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_CONVEX_URL` (from Convex dashboard)
   - `ANTHROPIC_API_KEY`
4. Deploy!

---

## Convex Commands Cheat Sheet

| What | Command |
|------|---------|
| Start dev server | `npx convex dev` |
| Deploy to production | `npx convex deploy` |
| Open dashboard | `npx convex dashboard` |
| View logs | `npx convex logs` |
| Set env variable (dev) | `npx convex env set KEY "value"` |
| Set env variable (prod) | `npx convex env set KEY "value" --prod` |
| View all env vars | `npx convex env list` |
| View table data | `npx convex data extractions` |
| Test a function | `npx convex run extractions:list` |
| Export backup | `npx convex export --path backup.zip` |
| Import data | `npx convex import --table users data.json` |

---

## Common Errors & Fixes

### Error: "implicitly has type 'any'"
**Fix:** Add `convex.json` with `staticApi: true` (see Phase 1, Step 4)

### Error: "Did you forget to run..."
**Fix:** Run `npx convex deploy`

### Error: "Not authenticated"
**Fix:** User not logged in. Check auth provider setup.

### Functions not updating
**Fix:** Make sure `npx convex dev` is running

---

## Useful Links

- Convex Docs: https://docs.convex.dev
- Convex AI Docs: https://docs.convex.dev/ai
- Convex Dashboard: https://dashboard.convex.dev
- AI Rules File: https://convex.link/convex_rules.txt

---

## File Structure After Implementation

```
tp-extractor/
├── convex/
│   ├── _generated/          # Auto-generated (don't edit)
│   ├── schema.ts            # Database schema
│   ├── extractions.ts       # Query/mutation functions
│   └── auth.config.ts       # Auth configuration
├── src/
│   ├── app/
│   │   ├── login/page.tsx   # Login page
│   │   ├── history/page.tsx # Extraction history
│   │   └── page.tsx         # Main extraction page
│   └── components/
│       └── convex-provider.tsx
├── convex.json              # Codegen config (IMPORTANT!)
└── .env.local               # NEXT_PUBLIC_CONVEX_URL
```

---

## Cost Estimate

| Service | Free Tier | Expected Cost |
|---------|-----------|---------------|
| Convex | 1GB storage, unlimited reads | $0 |
| Vercel | 100GB bandwidth | $0 |
| Claude API | Pay-per-use (~$0.25/extraction) | ~$25/mo |

---

*Created: January 2026 | First-time Convex implementation guide*
