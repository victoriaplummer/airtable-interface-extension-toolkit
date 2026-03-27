# Airtable Extension Toolkit

Build [Airtable Custom Interface Extensions](https://airtable.com/developers/interface-extensions) faster with AI. This toolkit gives Claude (or any AI coding assistant) everything it needs to write working extension code — plus reusable helpers and components to get you started.

## What's in the box

### AI Skill (`skill/SKILL.md`)

A comprehensive reference that teaches AI how to build Airtable Interface Extensions correctly. Covers the entire SDK — reading data, writing data, custom properties, dark mode, every field type, styling with Tailwind or MUI, and 14 common mistakes to avoid.

Upload it to your AI tool of choice and describe what you want to build:

> *"Build me a dashboard that shows tasks grouped by status with a bar chart of completion rates"*

### Reusable Helpers (`src/`)

Drop-in utilities for patterns every extension needs:

- **`fields.js`** — Safe field access, writable-field detection, select choice extraction with Airtable colors
- **`colors.js`** — Full Airtable color system mapped to both Tailwind classes and raw RGB values
- **`components/`** — Badge, LinkedRecordPills, EditableText, InlineFieldEdit, AttachmentPreview, Markdown renderer
- **`tailwind/airtable-preset.js`** — Complete Tailwind CSS preset with Airtable's design tokens

### Cursor Rules (`interface-extensions.mdc`)

Cursor-compatible rules file that guides the AI when editing extension code.

## Getting started

### With Claude Projects (claude.ai)

1. Upload `skill/SKILL.md` to **Project Knowledge**
2. Describe the interface you want
3. Claude writes working code using the SDK patterns

### With Claude Code (CLI)

```bash
cp skill/SKILL.md your-project/.claude/skills/airtable-extensions/SKILL.md
```

### With Cursor

```bash
mkdir -p your-project/.cursor/rules
cp interface-extensions.mdc your-project/.cursor/rules/
```

### Using the helpers

Copy `src/` into your extension project. Then use the helpers in `index.js`

See [`examples/basic-usage.js`](examples/basic-usage.js) for a complete working extension.

## Acknowledgments

- Built from [Airtable's official documentation](https://airtable.com/developers/interface-extensions) and example repos
- Tailwind discovery via [@nabong04](https://github.com/nabong04)'s [airtable-geocoded-locations-map](https://github.com/nabong04/airtable-geocoded-locations-map)
- MUI confirmed via Airtable's [sliding-bar-chart](https://github.com/Airtable/interface-extensions-sliding-bar-chart) example

## Contributing

PRs welcome. The goal is to make building Airtable Interface Extensions as accessible as possible.

## License

MIT
