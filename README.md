# airtable-extension-toolkit

Reusable helpers and React components for building [Airtable Interface Extensions](https://airtable.com/developers/extensions). Handles the patterns every extension needs — safe field access, dynamic select colors from schema, inline editing, linked record pills, and Airtable's full design token system.

## Installation

Copy the `src/` folder into your extension project, or install via npm:

```bash
npm install airtable-extension-toolkit
```

## Quick Start

```jsx
import { getFieldString, getSelectChoices, Badge, EditableSection } from 'airtable-extension-toolkit';

// Read a field safely (returns '' if field is missing)
const status = getFieldString(record, 'fldXXX');

// Read select field colors from Airtable schema — never hardcode these
const statusChoices = getSelectChoices(campaignsTable, 'fldXXX');
const match = statusChoices.find(c => c.name === status);
<Badge text={status} colors={match?.styles} />

// Click-to-edit text field (automatically read-only for aiText, formula, etc.)
<EditableSection
    label="Description"
    value={description}
    onSave={isWritableTextField(table, fieldId) ? (val => updateField(record, fieldId, val)) : null}
/>
```

See [`examples/basic-usage.js`](examples/basic-usage.js) for a complete working extension.

## Claude Code Skill

The `skill/SKILL.md` file is a Claude Code skill that teaches AI how to build Airtable Interface Extensions correctly. To install:

```bash
cp skill/SKILL.md your-project/.claude/skills/airtable-extensions/SKILL.md
```

Claude Code will automatically pick it up when working in your project.

---

## API Reference

### Field Helpers (`fields.js`)

#### `getField(record, fieldId) → any | null`

Safe wrapper around `record.getCellValue()`. Returns `null` if the field is missing, not exposed, or throws. Use for linked records, attachments, selects — anywhere you need the raw object.

#### `getFieldString(record, fieldId) → string`

Safe wrapper around `record.getCellValueAsString()`. Returns `''` on error. Use for text, dates, numbers — anything rendered as plain text.

#### `isWritableTextField(table, fieldId) → boolean`

Returns `true` if the field is a writable text type (`singleLineText`, `multilineText`, `richText`, `email`, `url`, `phoneNumber`). Returns `false` for `aiText`, formulas, lookups, and other computed types. Use to gate inline editing.

#### `getFieldMeta(table, fieldId) → {choices: string[], type: string|null}`

Reads field metadata from the table schema. `choices` is populated for single/multi select fields. Use to build dynamic dropdown UIs.

#### `getSelectChoices(table, fieldId, options?) → Array<{name, styles}>`

Reads select field choices with their Airtable colors resolved to style values.

```jsx
const choices = getSelectChoices(table, fieldId);
// → [{name: 'Draft', styles: {bg: '...', text: '...', header: '...', dot: '...', border: '...', dropActive: '...'}}, ...]

// Raw RGB mode for non-Tailwind projects:
const choices = getSelectChoices(table, fieldId, { mode: 'raw' });
// → [{name: 'Draft', styles: {bg: 'rgb(209, 226, 255)', text: 'rgb(13, 82, 172)', ...}}, ...]
```

---

### Color System (`colors.js`)

Airtable select options have a `color` property like `'blueBright'`, `'greenLight2'`, etc. This module maps those to usable styles.

#### `airtableColorStyles(color) → {bg, text, header, dot, border, dropActive}`

Returns Tailwind class strings. Requires the [Airtable Tailwind preset](#tailwind-preset).

```jsx
const styles = airtableColorStyles('blueBright');
// → {bg: 'bg-blue-blueLight2 dark:bg-blue-blueDark1/30', text: 'text-blue-blueDark1 dark:text-blue-blueLight1', ...}
```

#### `airtableColorValues(color) → {bg, text, header, dot, border, dropActive}`

Returns raw RGB strings. Use with inline styles or non-Tailwind projects.

```jsx
const styles = airtableColorValues('blueBright');
// → {bg: 'rgb(209, 226, 255)', text: 'rgb(13, 82, 172)', ...}
```

#### `createColorResolver(mode) → function`

Factory for custom output modes. `mode` is `'tailwind'` (default), `'raw'`, or `'both'`.

```jsx
const resolve = createColorResolver('both');
const styles = resolve('greenLight2');
// → {bg: {class: 'bg-green-greenLight2 ...', value: 'rgb(207, 245, 209)'}, ...}
```

#### Exports: `AT_COLOR_FAMILY`, `AT_COLORS_RAW`, `TAILWIND_STYLES`

Raw data tables if you need to build your own resolver.

---

### Components

#### `<Badge text colors className />`

Colored status pill.

| Prop | Type | Description |
|------|------|-------------|
| `text` | string | Badge label |
| `colors` | `{bg, text}` | From `airtableColorStyles()` or `getSelectChoices().styles` |

#### `<LinkedRecordPills value records onExpand className />`

Clickable linked record chips matching Airtable's native style.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `Array<{id, name}>` | Raw `getCellValue()` result from a linked record field |
| `records` | `Array<Record>` | Loaded records from the linked table |
| `onExpand` | `(record) => void` | Called when pill is clicked. Pass `expandRecord` from the Airtable SDK. |

```jsx
import { expandRecord } from '@airtable/blocks/interface/ui';
<LinkedRecordPills value={brandLinks} records={brands} onExpand={expandRecord} />
```

#### `<LinkedSection label value records onExpand />`

Label + `LinkedRecordPills` wrapper. Returns null if value is empty.

#### `<EditableText value onSave multiline placeholder hideWhenEmpty renderDisplay />`

Core click-to-edit primitive. When `onSave` is null, renders as read-only.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | string | | Current value |
| `onSave` | `(val) => void` | null | Save callback. Null = read-only. |
| `multiline` | boolean | false | Textarea vs input |
| `placeholder` | string | 'Click to edit' | Empty state text |
| `hideWhenEmpty` | boolean | false | Return null when empty |
| `renderDisplay` | `(val) => ReactNode` | | Custom display renderer |
| `rows` | number | 4 | Textarea rows |

#### `<EditableSection label value onSave labelStyle placeholder renderDisplay />`

Labeled wrapper around `EditableText`. Includes presets:

- **`<FormSection />`** — `labelStyle="default"` (small gray label)
- **`<BibleSection />`** — `labelStyle="uppercase"` (uppercase tracking label)
- **`<AIOutputSection />`** — `labelStyle="heading"` (semibold heading label, 8-row textarea)

#### `<InlineFieldEdit label value fieldMeta onSave disabled />`

Smart field editor — dropdown for select fields, click-to-edit text for text fields.

| Prop | Type | Description |
|------|------|-------------|
| `fieldMeta` | `{choices, type}` | From `getFieldMeta()` |
| `onSave` | `(val) => void` | Receives the raw string value |

#### `<AttachmentPreview attachments className index />`

Renders a thumbnail from an Airtable attachment field.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attachments` | Array | | From `getCellValue()` on an attachment field |
| `index` | number | 0 | Which attachment to show |

#### `<Markdown className>{children}</Markdown>`

Zero-dependency Markdown renderer. Falls back to plain whitespace-pre-wrap text if content doesn't contain Markdown syntax. Supports headings, bold/italic, lists, blockquotes, code blocks, and links.

---

### Tailwind Preset

The toolkit includes a complete Tailwind CSS preset with Airtable's design tokens (colors, typography, spacing, shadows, border-radius). Required for any component that uses Tailwind class names.

```js
// tailwind.config.js
const airtablePreset = require('airtable-extension-toolkit/tailwind/airtable-preset');

module.exports = {
    presets: [airtablePreset],
    content: ['./frontend/**/*.{js,jsx}'],
    // your overrides...
};
```

If you're not using Tailwind, use the `'raw'` color mode to get RGB values for inline styles:

```jsx
const choices = getSelectChoices(table, fieldId, { mode: 'raw' });
<div style={{ backgroundColor: choices[0].styles.bg, color: choices[0].styles.text }}>
    {choices[0].name}
</div>
```

---

## Airtable Color Families

The 10 Airtable color families and their token names:

| Family | Tokens |
|--------|--------|
| blue | `blueBright`, `blueLight1`, `blueLight2`, `blueDark1` |
| cyan | `cyanBright`, `cyanLight1`, `cyanLight2`, `cyanDark1` |
| teal | `tealBright`, `tealLight1`, `tealLight2`, `tealDark1` |
| green | `greenBright`, `greenLight1`, `greenLight2`, `greenDark1` |
| yellow | `yellowBright`, `yellowLight1`, `yellowLight2`, `yellowDark1` |
| orange | `orangeBright`, `orangeLight1`, `orangeLight2`, `orangeDark1` |
| red | `redBright`, `redLight1`, `redLight2`, `redDark1` |
| pink | `pinkBright`, `pinkLight1`, `pinkLight2`, `pinkDark1` |
| purple | `purpleBright`, `purpleLight1`, `purpleLight2`, `purpleDark1` |
| gray | `grayBright`, `grayLight1`, `grayLight2`, `grayDark1` |

All tokens within a family resolve to the same style bundle. For example, `blueBright` and `blueLight2` both produce blue-family styles.

---

## Writable vs Read-Only Field Types

`isWritableTextField()` returns `true` for:

| Type | Write format |
|------|-------------|
| `singleLineText` | `string` |
| `multilineText` | `string` |
| `richText` | `string` (Markdown) |
| `email` | `string` |
| `url` | `string` |
| `phoneNumber` | `string` |

Returns `false` for `aiText`, `formula`, `rollup`, `count`, `lookup`, `autoNumber`, `createdTime`, `lastModifiedTime`, `createdBy`, `lastModifiedBy`, `button`, `externalSyncSource`, and all other computed types.

For select fields, use `{name: 'Option'}` as the write value, not a plain string.

---

## License

MIT
