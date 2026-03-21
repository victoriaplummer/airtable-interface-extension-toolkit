# Airtable Custom Interface Extensions — AI Reference

A reference document that lets you co-build [Airtable Custom Interface Extensions](https://airtable.com/developers/interface-extensions) with Claude (or any AI coding assistant). Describe what you want, get working code.

## Why this exists

Airtable's Custom Interface Extensions let you build dashboards, forms, charts, and interactive tools that live right inside your Airtable workspace. They're incredibly powerful — but they require React code, which puts them out of reach for most Airtable builders.

This document bridges the gap. Upload one file to Claude Projects and you can describe interfaces in plain English — *"show my tasks in a kanban board grouped by status"* — and get working extension code back.

## What's inside

**`SKILL.md`** teaches your AI assistant the entire Interface Extensions SDK:

- **Getting started** — project scaffold, CLI setup, how to run and release
- **Reading data** — tables, records, fields, multi-table patterns with configurable properties
- **Writing data** — creating, updating, deleting records with proper permission handling
- **Styling** — Tailwind CSS with Airtable design tokens, plain CSS, dark mode support
- **Builder settings** — configurable properties so your team can customize without touching code
- **Charts & visualizations** — D3, Recharts, and other npm packages that work out of the box
- **Every field type** — read/write formats for all 25+ Airtable field types (selects, linked records, attachments, dates, checkboxes, etc.)
- **Limits & best practices** — batch sizes, rate limits, common pitfalls to avoid
- **Official examples** — all 8 Airtable example repos with what each demonstrates

## How to use

### Claude Projects (claude.ai)

1. Open your Claude Project
2. Go to **Project Knowledge**
3. Upload `SKILL.md`
4. Start describing the interface you want to build

### Claude Code (CLI)

Copy `SKILL.md` into your project's `.claude/` directory:

```bash
mkdir -p .claude
cp SKILL.md .claude/airtable-interface-extensions.md
```

Claude Code will automatically include it as context.

### Cursor

This repo includes a Cursor rules file at `.cursor/rules/interface-extensions.mdc`. Copy the `.cursor` directory into your extension project:

```bash
cp -r .cursor/ your-extension-project/.cursor/
```

Cursor will automatically apply the rules when editing files in your extension.

### Other AI tools

The document is model-agnostic markdown. Add it to any system prompt, RAG pipeline, or knowledge base where you want an AI to write Airtable Interface Extension code.

## Sources

Built from the **official Airtable documentation**:

| Source | What was extracted |
|--------|--------------------|
| [Getting Started Guide](https://airtable.com/developers/interface-extensions/guides/getting-started) | CLI setup, prerequisites |
| [Hello World Tutorial](https://airtable.com/developers/interface-extensions/guides/hello-world-tutorial) | Project scaffold, development mode |
| [Read Data Guide](https://airtable.com/developers/interface-extensions/guides/read-data-from-airtable) | Reading tables, records, multi-table patterns |
| [Write Data Guide](https://airtable.com/developers/interface-extensions/guides/write-back-to-airtable) | CRUD operations, permissions, batch limits, linked records |
| [Custom Properties Guide](https://airtable.com/developers/interface-extensions/guides/builders-custom-properties) | Builder-configurable settings |
| [Dark Mode Guide](https://airtable.com/developers/interface-extensions/guides/dark-mode) | CSS and JS approaches |
| [Full API Reference](https://airtable.com/developers/interface-extensions/api) | All models, hooks, components, utils, field types |
| [Airtable GitHub org](https://github.com/orgs/Airtable/repositories) | 8 example extension repos, source code patterns |

## Acknowledgments

- Airtable's [word-cloud extension](https://github.com/Airtable/interface-extensions-word-cloud-typescript) was used to confirm npm package compatibility (D3), CSS patterns, and dark mode implementation.
- The Tailwind CSS setup guide was made possible by [@nabong04](https://github.com/nabong04)'s [airtable-geocoded-locations-map](https://github.com/nabong04/airtable-geocoded-locations-map) — a community-built extension with a complete Airtable design token mapping for Tailwind.

## Contributing

Found an error or want to add a pattern? PRs welcome. The goal is to keep this as the single best reference for building Airtable Interface Extensions with AI.

## License

MIT
