"use client";

import { ReactNode, useMemo } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

// Validate environment variable at runtime
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("NEXT_PUBLIC_CONVEX_URL is not set");
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Create client inside component to ensure env vars are available
  const convex = useMemo(() => {
    if (!CONVEX_URL) {
      throw new Error(
        "Missing NEXT_PUBLIC_CONVEX_URL environment variable. " +
        "Please check your Vercel environment settings."
      );
    }
    return new ConvexReactClient(CONVEX_URL);
  }, []);

  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "#0f172a",
          colorInputBackground: "#1e293b",
          colorInputText: "#f1f5f9",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
