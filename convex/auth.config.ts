export default {
  providers: [
    {
      // This is the domain of your Clerk app
      // Set from environment variable
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
