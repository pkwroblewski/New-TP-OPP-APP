// Default Clerk domain - can be overridden via CLERK_JWT_ISSUER_DOMAIN env var
const DEFAULT_CLERK_DOMAIN = "https://optimum-quail-30.clerk.accounts.dev";

// Use environment variable if available, otherwise fall back to default
// This allows different domains for dev/staging/production environments
const clerkDomain = process.env.CLERK_JWT_ISSUER_DOMAIN || DEFAULT_CLERK_DOMAIN;

export default {
  providers: [
    {
      domain: clerkDomain,
      applicationID: "convex",
    },
  ],
};
