# AI Code Generation with Convex

## Why Convex Works Well with AI

Convex is designed around a small set of composable abstractions with strong guarantees that result in code that is not only faster to write, but easier to read and maintain, whether written by a team member or an LLM. Key features make sure you get bug-free AI generated code:

1. **Queries are Just TypeScript** - Your database queries are pure TypeScript functions with end-to-end type safety and IDE support. This means AI can generate database code using the large training set of TypeScript code without switching to SQL.

2. **Less Code for the Same Work** - Since so much infrastructure and boilerplate is automatically managed by Convex there is less code to write, and thus less code to get wrong.

3. **Automatic Reactivity** - The reactive system automatically tracks data dependencies and updates your UI. AI doesn't need to manually manage subscriptions, WebSocket connections, or complex state synchronization—Convex handles all of this automatically.

4. **Transactional Guarantees** - Queries are read-only and mutations run in transactions. These constraints make it nearly impossible for AI to write code that could corrupt your data or leave your app in an inconsistent state.

Together, these features mean AI can focus on your business logic while Convex's guarantees prevent common failure modes.

## Convex AI Rules

AI code generation is most effective when you provide it with a set of rules to follow.

The main rules file for Convex is available at:
- [convex_rules.txt](https://convex.link/convex_rules.txt)

For this project, the rules are located in:
- [.claude/rules/convex-rules.md](./convex-rules.md)

## Using Convex with Background Agents

Remote cloud-based coding agents like Jules, Devin, Codex, and Cursor background agents can use Convex deployments when the CLI is in Agent Mode. This limits the permissions necessary for these remote dev environments while letting agents run codegen, iterate on code, run tests, run one-off functions.

A good setup script for background agents:

```bash
npm i
CONVEX_AGENT_MODE=anonymous npx convex dev --once
```

or with bun:

```bash
bun i
CONVEX_AGENT_MODE=anonymous bun x convex dev --once
```

This command requires "full" internet access to download the binary.

## Convex MCP Server

You can set up a Convex MCP server to give your AI coding agent access to your Convex deployment to query and optimize your project.

See: https://docs.convex.dev/ai/convex-mcp-server

## Resources

- **Convex Chef** (prompt builder): https://chef.convex.dev
- **LLM Leaderboard** (model performance): https://convex.dev/llm-leaderboard
- **Convex Evals** (contribute to improving AI rules): https://github.com/get-convex/convex-evals
- **Convex AI Docs**: https://docs.convex.dev/ai
