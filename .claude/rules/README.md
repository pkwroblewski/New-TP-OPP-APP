# Coding Rules & Guidelines

Rules and conventions for Claude Code when working on TP Extractor.

## Available Rules

| Rule File | Purpose |
|-----------|---------|
| [convex-rules.md](./convex-rules.md) | Convex function syntax, validators, queries, mutations |
| [convex-ai-docs.md](./convex-ai-docs.md) | AI code generation best practices with Convex |

## How Rules Work

Files in this directory (`.claude/rules/`) are automatically loaded by Claude Code and applied during development. They provide:

- Coding conventions and syntax patterns
- Framework-specific best practices
- Project-specific guidelines

## Adding New Rules

1. Create a new `.md` file in this directory
2. Use clear, imperative language
3. Include code examples where helpful
4. Rules should be specific and actionable

Example structure:
```markdown
# Rule Name

## Overview
Brief description of what this rule covers.

## Guidelines
- Guideline 1
- Guideline 2

## Examples
\`\`\`typescript
// Good example
const good = ...

// Bad example
const bad = ...
\`\`\`
```

## Related Documentation

- [../STATUS.md](../STATUS.md) - Current project status
- [../CHANGELOG.md](../CHANGELOG.md) - Recent changes
- [../../docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) - System architecture
