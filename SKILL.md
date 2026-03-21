---
name: Airtable Custom Interface Extensions
description: Complete SDK reference for building Airtable Interface Extensions — models, hooks, components, field types, write patterns, and common pitfalls.
whenToUse: When building, modifying, or debugging Airtable Custom Interface Extensions using the @airtable/blocks/interface SDK.
---

# Airtable Custom Interface Extensions — SDK Reference

You are building Airtable Interface Extensions. These are React components that run inside Airtable Interfaces. They use a specific SDK (`@airtable/blocks/interface`) — NOT the older Blocks SDK or the REST API.

## Quick Start Scaffold

```tsx
import {initializeBlock} from '@airtable/blocks/interface/ui';
import React from 'react';

function App() {
    return <div>Hello world</div>;
}

// Entry point — this is NOT ReactDOM.render
initializeBlock({interface: () => <App />});
```

**CLI setup**: `npm install -g @airtable/blocks-cli` → `block init NONE/blkXXX --template=<template-url> my-extension` → `cd my-extension` → `block run`

**Requires**: Node 22+, PAT token with `block:manage` scope configured via `block set-api-key`.

---

## Import Map

Everything comes from two paths:

```tsx
// Models & types
import {FieldType} from '@airtable/blocks/interface/models';

// Hooks, components, utils — everything UI
import {
    useBase, useRecords, useCustomProperties, useGlobalConfig,
    useSynced, useSession, useRunInfo, useColorScheme, useWatchable,
    CellRenderer, expandRecord, initializeBlock,
    colors, colorUtils,
    loadCSSFromString, loadCSSFromURLAsync, loadScriptFromURLAsync,
} from '@airtable/blocks/interface/ui';
```

There is NO Airtable-provided UI component library beyond `<CellRenderer>`. For buttons, inputs, selects, dialogs, etc., use a third-party library like **MUI** (Material UI — used in Airtable's own sliding-bar-chart example) or plain HTML/React elements. See the Styling & External Libraries section for options.

### Old Blocks SDK vs New Interface Extensions SDK

Claude's training data contains extensive examples from the **old** `@airtable/blocks` SDK. Do NOT use those patterns. Key differences:

| Old Blocks SDK (`@airtable/blocks/ui`) | New Interface Extensions (`@airtable/blocks/interface/ui`) |
|---|---|
| `<Button>`, `<Input>`, `<Box>`, `<FormField>`, `<Select>`, `<Dialog>`, `<Tooltip>`, `<Icon>`, etc. | **None of these exist.** Only `<CellRenderer>`. Use plain HTML/React. |
| `import {useBase} from '@airtable/blocks/ui'` | `import {useBase} from '@airtable/blocks/interface/ui'` |
| `initializeBlock(() => <App />)` | `initializeBlock({interface: () => <App />})` |
| `useRecords(queryResult)` with views/sorts/fields | `useRecords(table)` — table-level only, no view access |
| `cursor`, `viewport`, `useViewport` | Not available |

---

## Styling & External Libraries

### npm packages work

The blocks CLI uses webpack. Any npm package compatible with webpack works. Install via `npm install` in your extension directory.

### Recommended libraries

| Need | Recommended | Notes |
|------|-------------|-------|
| **Charts** | `recharts` (React), `d3` + `d3-cloud` | Airtable's official word-cloud example uses D3. Recharts is easier for standard charts. |
| **Date handling** | `date-fns` or `dayjs` | Lighter than moment.js. Date fields return ISO 8601 strings. |
| **Component library** | `@mui/material` (MUI) | Airtable's own sliding-bar-chart example uses MUI v7 + Emotion. Full component set (buttons, inputs, dialogs, etc.). |
| **Headless UI** | `@radix-ui/react-*` | Accessible primitives (dialogs, dropdowns, tooltips) without styling opinions. Lighter than MUI. |
| **Icons** | `@phosphor-icons/react` | Append `Icon` suffix when importing: `import {ArrowRightIcon} from '@phosphor-icons/react'`. |
| **Drag & drop** | `@dnd-kit/core` | Accessible drag-and-drop for kanban boards, sortable lists, etc. |
| **Markdown** | `marked` | Parse markdown content from rich text or long text fields. |
| **3D models** | `@google/model-viewer` | Render 3D models inline. |
| **CSS framework** | Plain CSS or **Tailwind CSS** | Tailwind is officially supported — used in Airtable's own map extension. See Tailwind section below. |

**React 19 note:** If a third-party library doesn't list React 19 as a peer dependency, use `npm install --legacy-peer-deps` to install it.

### CSS approach

Import CSS files directly — the webpack bundler handles them:

```tsx
import './style.css';
```

For external CSS:
```tsx
await loadCSSFromURLAsync('https://cdn.example.com/library.css');
```

For dynamic CSS:
```tsx
loadCSSFromString(`
    .my-card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; }
    @media (prefers-color-scheme: dark) {
        .my-card { border-color: #444; background: #2a2a2a; }
    }
`);
```

### Tailwind CSS — officially supported

Tailwind works with the blocks CLI. Airtable's own [map extension](https://github.com/Airtable/interface-extensions-map) uses this exact setup. The webpack bundler auto-detects PostCSS when the loaders are installed.

**Setup:**
```bash
npm install -D tailwindcss postcss postcss-loader css-loader style-loader autoprefixer @airtable/blocks-webpack-bundler
```

**tailwind.config.js** (at project root):
```js
module.exports = {
    // CRITICAL: must be 'media', not 'class'. Airtable controls dark mode via
    // prefers-color-scheme, not a CSS class. Using 'class' means dark: utilities
    // won't fire unless you manually add a 'dark' class wrapper — and even then
    // it won't work on first render before JS hydrates.
    darkMode: 'media',
    content: ['./frontend/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                // Map Airtable's design tokens to Tailwind utilities
                blue: {
                    DEFAULT: 'rgb(22, 110, 225)',
                    dark1: 'rgb(13, 82, 172)',
                    light1: 'rgb(160, 198, 255)',
                    light2: 'rgb(209, 226, 255)',
                },
                // Add more Airtable colors as needed — see the full token set at:
                // github.com/nabong04/airtable-geocoded-locations-map/blob/main/tailwind.config.js
            },
        },
    },
};
```

**frontend/style.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Then `import './style.css'` in your component. Use classes like `bg-blue-light2`, `text-gray-900`, etc.

**Raw CSS dark mode:** For any styles written in plain CSS (not Tailwind utilities), use `@media (prefers-color-scheme: dark)` to match Airtable's dark mode — not `.dark` parent selectors.

**References:**
- [Airtable/interface-extensions-map](https://github.com/Airtable/interface-extensions-map) — official Airtable example with Tailwind + TypeScript + Mapbox
- [nabong04/airtable-geocoded-locations-map](https://github.com/nabong04/airtable-geocoded-locations-map) — community example with full Airtable design token mapping in `tailwind.config.js`

### Design tokens from Airtable

Use the built-in `colors` and `colorUtils` to match Airtable's palette (works without Tailwind):

```tsx
import {colors, colorUtils} from '@airtable/blocks/interface/ui';

// Airtable's blue: '#2d7ff9'
const airtableBlue = colorUtils.getHexForColor(colors.BLUE);

// Check contrast for text on colored backgrounds
if (colorUtils.shouldUseLightTextOnColor(colors.BLUE_DARK_1)) {
    // use white text
}
```

Available color families: BLUE, CYAN, GRAY, GREEN, ORANGE, PINK, PURPLE, RED, TEAL, YELLOW — each with base, BRIGHT, DARK_1, LIGHT_1, LIGHT_2 variants.

---

## Reading Data

### Access the base and tables

```tsx
function App() {
    const base = useBase();
    const table = base.getTableByName('Tasks');       // throws if not found
    const table2 = base.getTableByNameIfExists('X');   // returns null if not found
    // Also: base.getTableById(), base.getTableByIdIfExists(), base.getTable(idOrName)

    // base.tables — all tables (arbitrary order)
    // base.name, base.color, base.activeCollaborators, base.workspaceId
}
```

### Read records

```tsx
function RecordList() {
    const base = useBase();
    const table = base.getTableByName('Tasks');
    const records = useRecords(table); // auto-refreshes on changes

    return (
        <ul>
            {records.map(record => (
                <li key={record.id}>
                    {record.name} {/* primary field as string */}
                    {record.getCellValue('Status')} {/* raw cell value */}
                    {record.getCellValueAsString('Due Date')} {/* formatted string */}
                </li>
            ))}
        </ul>
    );
}
```

### Read from multiple tables

Use custom properties to let builders configure which tables to use:

```tsx
function getCustomProperties(base) {
    return [
        {
            key: 'projectsTable',
            label: 'Projects Table',
            type: 'table',
            defaultValue: base.tables.find(t => t.name.toLowerCase().includes('projects')),
        },
        {
            key: 'tasksTable',
            label: 'Tasks Table',
            type: 'table',
            defaultValue: base.tables.find(t => t.name.toLowerCase().includes('tasks')),
        },
    ];
}

function MyExtension() {
    const {customPropertyValueByKey} = useCustomProperties(getCustomProperties);
    const projectsTable = customPropertyValueByKey.projectsTable;
    const tasksTable = customPropertyValueByKey.tasksTable;

    const projectRecords = useRecords(projectsTable);
    const taskRecords = useRecords(tasksTable);
    // ...
}
```

### Field access

**Always use `getFieldIfExists`** — it returns `null` instead of throwing. The throwing variants (`getField`, `getFieldByName`, `getFieldById`) will crash your extension if a field was deleted or isn't visible.

```tsx
const field = table.getFieldIfExists('Status'); // returns Field | null
if (!field) return <div>Please configure the Status field</div>;

field.type    // FieldType enum value, e.g. 'singleSelect'
field.name    // string
field.options // field-specific options (see FieldType reference)
field.config  // { type, options } — useful for type narrowing
field.isComputed    // true for formula, rollup, autoNumber, etc.
field.isPrimaryField
field.description   // string | null
```

**Best practice:** Don't hardcode field names. Use custom properties to let builders select fields (see Custom Properties section). Use `record.getCellValueAsString(field)` when you just need to display a value without handling each field type individually.

**Always use the FieldType enum for comparisons** — never compare against string literals:
```tsx
import {FieldType} from '@airtable/blocks/interface/models';

// ✅ CORRECT
if (field.type === FieldType.SINGLE_SELECT) { /* ... */ }

// ❌ WRONG — don't use string literals
if (field.type === 'singleSelect') { /* ... */ }
```

---

## Writing Data

### CRITICAL: Always check permissions first

Interface Designer can disable editing per-field. Users may have read-only access. Always check before writing:

```tsx
// Simple boolean check
if (table.hasPermissionToCreateRecord()) { /* ... */ }
if (table.hasPermissionToUpdateRecord(record, {'Status': {name: 'Done'}})) { /* ... */ }
if (table.hasPermissionToDeleteRecord(record)) { /* ... */ }

// Detailed check with reason string (for showing error messages)
const check = table.checkPermissionsForUpdateRecord(record, fields);
if (!check.hasPermission) {
    alert(check.reasonDisplayString); // e.g. "You don't have permission to edit this field"
}
```

Use `undefined` as placeholder for unknown values in permission checks:
```tsx
// "Can user update this record at all?" (unknown fields)
table.hasPermissionToUpdateRecord(record);
// "Can user update this field on some record?" (unknown record)
table.hasPermissionToUpdateRecord(undefined, {'Status': undefined});
```

### Create records

```tsx
// Single record — returns Promise<RecordId>
const newId = await table.createRecordAsync({
    'Project Name': 'New project',
    'Budget': 100,
});

// By field ID instead of name
await table.createRecordAsync({
    [nameField.id]: 'New project',
    [budgetField.id]: 100,
});

// Batch — max 50 records per call
const ids = await table.createRecordsAsync([
    {fields: {'Name': 'Record 1'}},
    {fields: {'Name': 'Record 2'}},
]);
```

### Update records

```tsx
// Single record
await table.updateRecordAsync(record, {
    'Status': {name: 'In Progress'},
    'Priority': {name: 'High'},
});

// Batch — max 50 records per call
await table.updateRecordsAsync([
    {id: record1.id, fields: {'Status': {name: 'Done'}}},
    {id: record2.id, fields: {'Status': {name: 'Done'}}},
]);
```

### Delete records

```tsx
await table.deleteRecordAsync(record);
await table.deleteRecordsAsync([record1, record2]); // max 50
```

### Batching pattern for large operations

```tsx
const BATCH_SIZE = 50;
async function batchCreate(table, recordDefs) {
    const allIds = [];
    for (let i = 0; i < recordDefs.length; i += BATCH_SIZE) {
        const batch = recordDefs.slice(i, i + BATCH_SIZE);
        // Awaiting ensures we stay under 15 writes/sec rate limit
        const ids = await table.createRecordsAsync(batch);
        allIds.push(...ids);
    }
    return allIds;
}
```

### Async behavior

All writes return Promises. Updates are applied **optimistically locally** — your extension sees changes immediately, but other users see them after the server persists. Await if you need server confirmation or if downstream fields depend on the write (e.g., formula fields).

---

## CRITICAL: Array Field Append Pattern

**Attachments, linked records, multi-select, and multi-collaborator fields OVERWRITE when updated.** You must spread the existing value to append:

```tsx
// ✅ CORRECT — append a linked record
await table.updateRecordAsync(record, {
    'Related Projects': [
        ...record.getCellValue('Related Projects'),  // keep existing
        {id: newRecordId},                            // add new
    ],
});

// ❌ WRONG — this replaces ALL linked records with just one
await table.updateRecordAsync(record, {
    'Related Projects': [{id: newRecordId}],
});

// Same pattern for attachments
await table.updateRecordAsync(record, {
    'Files': [
        ...record.getCellValue('Files'),
        {url: 'https://example.com/new-file.pdf', filename: 'new-file.pdf'},
    ],
});

// Same pattern for multi-select
await table.updateRecordAsync(record, {
    'Tags': [
        ...record.getCellValue('Tags'),
        {name: 'New Tag'},
    ],
});
```

---

## Linked Record Patterns

### Link to existing records with autocomplete

Use `fetchForeignRecordsAsync` to build search/autocomplete UI that respects selection constraints:

```tsx
const [filterString, setFilterString] = useState('');
const [availableRecords, setAvailableRecords] = useState([]);

useEffect(() => {
    const timeout = setTimeout(() => {
        record.fetchForeignRecordsAsync(linkedField, filterString)
            .then(response => setAvailableRecords(response.records));
    }, 300); // debounce
    return () => clearTimeout(timeout);
}, [record, linkedField, filterString]);
```

### Create and link in one write

Pass `{name: 'New Record'}` (no `id`) to create a new record in the linked table AND link it:

```tsx
await table.updateRecordAsync(record, {
    'Linked Field': [{name: 'New linked record'}],
});

// Create multiple and link
await table.updateRecordAsync(record, {
    'Linked Field': [
        ...record.getCellValue('Linked Field'),
        {name: 'First new record'},
        {name: 'Second new record'},
    ],
});
```

---

## Linked Record Pill Pattern

Linked record fields should **always** render as clickable pills, not plain text. This matches Airtable's native UX and helps users understand data relationships at a glance.

```tsx
export function LinkedRecordPills({value, records, className = ''}) {
    if (!value || !Array.isArray(value) || value.length === 0) return null;
    return (
        <span className={`inline-flex flex-wrap gap-1 ${className}`}>
            {value.map(link => {
                const fullRecord = records?.find(r => r.id === link.id);
                if (fullRecord) {
                    return (
                        <button
                            key={link.id}
                            onClick={e => { e.stopPropagation(); expandRecord(fullRecord); }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                                bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer transition-colors"
                            title={`Open ${link.name}`}
                        >
                            {link.name}
                        </button>
                    );
                }
                return (
                    <span key={link.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        {link.name}
                    </span>
                );
            })}
        </span>
    );
}
```

**Rules:**
1. **Always use pills for linked records.** Plain text loses the relationship context Airtable users expect.
2. **Use raw `getCellValue()` not `getCellValueAsString()`** -- you need the `[{id, name}]` array for rendering and record lookup.
3. **Pass the loaded records array** for the linked table so pills can call `expandRecord()`. If records aren't available, render as a static gray pill.
4. **Always `e.stopPropagation()`** on click -- pills are often nested inside other clickable elements.

### Inline Add — `LinkedPillsWithAdd`

Extend pills with a `+` button that opens a searchable dropdown to link additional records without leaving the extension. The dropdown filters out already-linked records and supports type-ahead search.

```tsx
import {LinkedPillsWithAdd} from './components/LinkedRecordPills';

// Helper: append a linked record (respects the array overwrite pattern)
const appendLinkedRecord = useCallback(async (record, fieldId, newId) => {
    const existing = record.getCellValue(fieldId) || [];
    await table.updateRecordAsync(record, {
        [fieldId]: [...existing.map(link => ({id: link.id})), {id: newId}],
    });
}, [table]);

// In render:
<LinkedPillsWithAdd
    value={record.getCellValue(FIELDS.BRANDS)}
    records={brands}
    allRecords={brands}
    onExpand={expandRecord}
    onAdd={id => appendLinkedRecord(record, FIELDS.BRANDS, id)}
/>
```

**Props:**
- `value` — raw `getCellValue()` result (`[{id, name}]`)
- `records` — loaded records for pill rendering and expand
- `allRecords` — all records in the linked table for dropdown options (usually same as `records`)
- `onExpand` — called with full record on pill click (pass `expandRecord`)
- `onAdd` — called with `recordId` on selection. Caller handles the update. If null, `+` button hidden.

**Rules:**
1. **Always use the append pattern in `onAdd`.** Linked record fields overwrite — spread existing values.
2. **Filter already-linked records out** — `LinkedPillsWithAdd` does this automatically using the `value` prop.
3. **Permission-check before writing** — wrap `onAdd` handler with `checkPermissionsForUpdateRecord`.

---

## Inline Field Editing Pattern

When exposing editable fields, **always read field options from the schema** -- never hardcode dropdown values.

### Reading field metadata

```tsx
function getFieldMeta(table, fieldId) {
    if (!table) return {choices: [], type: null};
    try {
        const field = table.getFieldByIdIfExists(fieldId);
        if (!field) return {choices: [], type: null};
        const choices = field.options?.choices?.map(c => c.name) || [];
        return {choices, type: field.type};
    } catch {}
    return {choices: [], type: null};
}

// Memoize per table
const statusMeta = useMemo(() => getFieldMeta(contentTable, FIELDS.STATUS), [contentTable]);
```

### Smart inline editor

Render a dropdown for select fields, click-to-edit text for text fields:

```tsx
function InlineFieldEdit({label, value, fieldMeta, onSave, disabled}) {
    if (fieldMeta.choices.length > 0) {
        return (
            <div>
                <label>{label}</label>
                <select value={value} onChange={e => onSave(e.target.value)} disabled={disabled}>
                    <option value="">--</option>
                    {fieldMeta.choices.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        );
    }
    return <input value={value} onChange={e => onSave(e.target.value)} disabled={disabled} />;
}
```

### Write values by field type

```tsx
// Single select -> {name: 'Option'} or null to clear
onSave={val => updateField(record, FIELDS.STATUS, val ? {name: val} : null)}

// Text field -> plain string or null
onSave={val => updateField(record, FIELDS.NOTES, val || null)}

// Number -> number or null
onSave={val => updateField(record, FIELDS.SCORE, val ? Number(val) : null)}
```

**Rules:**
1. **Never hardcode select options.** Always use `field.options.choices` from the schema.
2. **Always permission-check before writing.** Use `table.checkPermissionsForUpdateRecord()`.
3. **Memoize field metadata.** `useMemo(() => getFieldMeta(...), [table])` -- field schema doesn't change within a render cycle.
4. **Handle missing fields gracefully.** `getFieldByIdIfExists` returns null if the field isn't exposed. Degrade to read-only or hidden.

---

## Custom Properties for Builders

Custom properties appear in the Interface Designer sidebar. Builders configure them without code.

**The `getCustomProperties` function MUST have a stable identity** — define it at the top level of the file or wrap in `useCallback`. Do NOT define it inline inside a component.

```tsx
// ✅ CORRECT — top-level function
function getCustomProperties(base) {
    const table = base.tables[0];
    return [
        // String input
        {key: 'title', label: 'Chart Title', type: 'string', defaultValue: 'My Chart'},

        // Boolean toggle
        {key: 'showLegend', label: 'Show Legend', type: 'boolean', defaultValue: true},

        // Enum dropdown
        {
            key: 'color', label: 'Color', type: 'enum',
            possibleValues: [
                {value: 'red', label: 'Red'},
                {value: 'blue', label: 'Blue'},
            ],
            defaultValue: 'red',
        },

        // Table picker
        {key: 'dataTable', label: 'Data Table', type: 'table', defaultValue: table},

        // Field picker (with filter)
        {
            key: 'xAxis', label: 'X-axis Field', type: 'field', table,
            shouldFieldBeAllowed: (field) => field.config.type === FieldType.NUMBER,
        },
    ];
}

function MyExtension() {
    const {customPropertyValueByKey, errorState} = useCustomProperties(getCustomProperties);
    const title = customPropertyValueByKey.title;       // string
    const showLegend = customPropertyValueByKey.showLegend; // boolean
    const dataTable = customPropertyValueByKey.dataTable;   // Table model
    const xAxisField = customPropertyValueByKey.xAxis;      // Field model
}
```

### API keys and credentials

Use string custom properties for third-party API keys — never hardcode them:

```tsx
{key: 'mapboxApiKey', label: 'Mapbox API Key', type: 'string', defaultValue: ''},
```

### Show config instructions only when unset

Only show "please configure this extension" UI when custom properties are missing values:

```tsx
function MyExtension() {
    const {customPropertyValueByKey} = useCustomProperties(getCustomProperties);
    const table = customPropertyValueByKey.dataTable;
    const apiKey = customPropertyValueByKey.mapboxApiKey;

    if (!table || !apiKey) {
        return <div>Open the properties panel to configure this extension.</div>;
    }
    // ... render extension
}
```

---

## GlobalConfig (Persistent Key-Value Storage)

For extension-internal state that persists across sessions. Syncs in real-time to all users.

```tsx
function Settings() {
    const globalConfig = useGlobalConfig();
    const savedFilter = globalConfig.get('filter');         // read
    const nested = globalConfig.get(['settings', 'theme']); // nested path

    const save = async () => {
        if (globalConfig.hasPermissionToSet('filter', 'active')) {
            await globalConfig.setAsync('filter', 'active');
        }
    };

    // Batch set
    const saveBatch = async () => {
        await globalConfig.setPathsAsync([
            {path: ['settings', 'theme'], value: 'dark'},
            {path: ['settings', 'pageSize'], value: 25},
        ]);
    };
}
```

**Limits**: 150kB max size, 1000 keys max, 50 paths per `setPathsAsync` call.

### useSynced — shorthand for GlobalConfig binding

```tsx
function FilterInput() {
    const [value, setValue, canSetValue] = useSynced('filterKey');
    return <input value={value ?? ''} onChange={e => setValue(e.target.value)} disabled={!canSetValue} />;
}
```

---

## Dark Mode

### CSS approach (preferred)

`prefers-color-scheme` automatically matches the user's **Airtable** appearance setting (not their OS setting):

```css
.my-extension {
    background: #ffffff;
    color: #333333;
}

@media (prefers-color-scheme: dark) {
    .my-extension {
        background: #1a1a2e;
        color: #e0e0e0;
    }
}
```

### JavaScript approach (fallback)

```tsx
import {useColorScheme} from '@airtable/blocks/interface/ui';

function App() {
    const colorScheme = useColorScheme(); // 'light' | 'dark'
    const isDark = colorScheme === 'dark';
    return <div style={{color: isDark ? '#fff' : '#000'}}>...</div>;
}
```

---

## CellRenderer Component

The only provided UI component. Renders a cell value exactly as Airtable would:

```tsx
<CellRenderer field={statusField} record={record} />
<CellRenderer field={statusField} cellValue={{name: 'Done', color: 'greenBright'}} />
```

Props: `field` (required), `record` or `cellValue` (one required), `shouldWrap` (default true), `className`, `style`, `cellClassName`, `cellStyle`, `renderInvalidCellValue`.

---

## Other Hooks & Utils

```tsx
// Session — current user info
const session = useSession();
session.currentUser // {id, email, name, profilePicUrl} | null (if public share)

// Run info — edit mode detection
const runInfo = useRunInfo();
runInfo.isDevelopmentMode       // boolean
runInfo.isPageElementInEditMode // boolean — useful for showing config UI

// Expand a record to its detail view — PREFERRED over custom popovers/detail panes
// Use this as the default way to show record detail (click row → expand)
expandRecord(record); // opens Airtable's native record detail modal
// Check first: table.hasPermissionToExpandRecords()

// Colors
colorUtils.getHexForColor(colors.BLUE);    // '#2d7ff9'
colorUtils.getRgbForColor(colors.RED);     // {r: 239, g: 48, b: 97}
colorUtils.shouldUseLightTextOnColor(colors.BLUE_DARK_1); // true

// Load external resources
await loadCSSFromURLAsync('https://cdn.example.com/styles.css');
loadCSSFromString('.my-class { color: red; }');
await loadScriptFromURLAsync('https://cdn.example.com/chart-lib.js');
```

---

## FieldType Cell Value Reference

Import: `import {FieldType} from '@airtable/blocks/interface/models';`

### Text fields
| Type | Read | Write |
|------|------|-------|
| `SINGLE_LINE_TEXT` | `string` | `string` |
| `MULTILINE_TEXT` | `string` (may contain mention tokens) | `string` |
| `RICH_TEXT` | `string` (markdown formatted) | `string` (markdown) |
| `EMAIL` | `string` | `string` |
| `URL` | `string` | `string` |
| `PHONE_NUMBER` | `string` | `string` |

### Number fields
| Type | Read | Write | Notes |
|------|------|-------|-------|
| `NUMBER` | `number` | `number` | `options.precision` (0-8) |
| `CURRENCY` | `number` | `number` | `options.symbol`, `options.precision` (0-7) |
| `PERCENT` | `number` | `number` | 0.5 = 50%, 1 = 100% |
| `RATING` | `number` | `number` | `options.max` (1-10), `options.icon`, `options.color` |
| `DURATION` | `number` (seconds) | `number` | |
| `AUTO_NUMBER` | `number` | n/a (computed) | |

### Date fields
| Type | Read | Write |
|------|------|-------|
| `DATE` | ISO 8601 `string` | `Date \| string` |
| `DATE_TIME` | ISO 8601 `string` | `Date \| string` |
| `CREATED_TIME` | ISO 8601 `string` | n/a (computed) |
| `LAST_MODIFIED_TIME` | ISO 8601 `string` | n/a (computed) |

For `DATE_TIME` with a non-UTC timezone: ambiguous strings like `"2020-09-05T07:00:00"` are interpreted in the field's timezone. Include zone offset for explicit control: `"2020-09-05T07:00:00-07:00"`.

### Select fields
```tsx
// SINGLE_SELECT
// Read:  {id: string, name: string, color?: Color}
// Write: {id: string} | {name: string}
record.getCellValue('Status') // → {id: 'selXXX', name: 'Done', color: 'greenBright'}

// MULTIPLE_SELECTS
// Read:  Array<{id, name, color?}>
// Write: Array<{id} | {name}>    ⚠️ OVERWRITES — spread to append
```

### Checkbox
```tsx
// CHECKBOX
// Read:  true | null    (NOT false — unchecked is null)
// Write: boolean | null
```

### Linked records
```tsx
// MULTIPLE_RECORD_LINKS
// Read:  Array<{id: RecordId, name: string}>
// Write: Array<{id: RecordId, name?: string} | {name: string}>
//        ⚠️ OVERWRITES — spread to append
//        {name: 'X'} without id creates a NEW record in linked table
```

### Attachments
```tsx
// MULTIPLE_ATTACHMENTS
// Read: Array<{id, url, filename, size?, type?, thumbnails?}>
// Write: Array<{url: string, filename?: string} | existingAttachmentObject>
//        ⚠️ OVERWRITES — spread to append
//        New attachments: {url: '...', filename: '...'}
//        Existing: pass the full object from getCellValue (cannot modify properties)
```

### Collaborator fields
```tsx
// SINGLE_COLLABORATOR
// Read:  {id, email, name?, profilePicUrl?}
// Write: {id: string}

// MULTIPLE_COLLABORATORS
// Read:  Array<{id, email, name?, profilePicUrl?}>
// Write: Array<{id: string}>    ⚠️ OVERWRITES — spread to append

// CREATED_BY / LAST_MODIFIED_BY — same read format, not writable
```

### Computed fields (read-only)
```tsx
// FORMULA — read: any (check options.result.type for actual type)
// ROLLUP — read: any (check options.result.type)
// COUNT — read: number
// MULTIPLE_LOOKUP_VALUES — read: Array<{linkedRecordId, value}>
// AUTO_NUMBER — read: number
// CREATED_TIME, LAST_MODIFIED_TIME, CREATED_BY, LAST_MODIFIED_BY
```

### Other fields
```tsx
// BARCODE — read: {text: string, type?: string}, write: n/a
// BUTTON — read: {label: string, url: string | null}, write: n/a
// AI_TEXT — read: {state, value, isStale, errorType?}, write: n/a
// EXTERNAL_SYNC_SOURCE — read: {id, name, color?}, write: n/a
```

---

## Constraints & Limits

| Constraint | Value |
|-----------|-------|
| Records per batch operation | **50 max** |
| Write rate limit | **15 writes/sec** (global across all tables) |
| Individual write payload | **1.9MB max** |
| GlobalConfig size | **150kB max** |
| GlobalConfig keys | **1000 max** |
| GlobalConfig paths per `setPathsAsync` | **50 max** |

Consecutive `updateRecordAsync` calls to the **same table** within a short period are automatically merged into one request (avoiding rate limits). Only reliable for small updates.

---

## Official Example Extensions

Airtable provides these example repos at `github.com/Airtable/`:

| Repo | Language | What it demonstrates |
|------|----------|---------------------|
| `interface-extensions-hello-world` | JS | Minimal scaffold |
| `interface-extensions-hello-world-typescript` | TS | TypeScript scaffold |
| `interface-extensions-embed` | JS/TS/CSS | Inbox layout + iframe embeds, custom properties for table/field selection, CSS styling |
| `interface-extensions-word-cloud-typescript` | TS | **D3 + d3-cloud npm packages**, `useColorScheme` for dark mode palettes, `useCustomProperties` with field filtering, `expandRecord`, `useMemo`/`useCallback` patterns |
| `interface-extensions-map` | TS | **Tailwind CSS + Mapbox + TypeScript**, custom properties for API keys and field selection, dark mode, `expandRecord`, localStorage for view state |
| `interface-extensions-heatmap` | — | Data visualization |
| `interface-extensions-sliding-bar-chart` | JS | **MUI (Material UI) v7 + Emotion** for styled components, charting with sliders |

The **word-cloud** example is the best reference for production patterns — it shows npm package integration, dark mode with dual color palettes, D3 rendering, and custom property configuration.

---

## Release & Deployment

```bash
# Develop locally (hot reload)
block run

# Release to Airtable (builds and uploads)
block release

# Submit to Airtable Marketplace (optional)
block submit
```

Extensions are installed per-interface. A single extension can be installed as:
- **Full page** — a Custom layout in an interface
- **Dashboard element** — added via the `+` button on a Dashboard interface

During development, click the `</>  Develop` button in the properties panel to load your local version. You may need to allow self-signed certificates on first use.

---

## Performance — SDK Behaviors That Cause Timeouts

### `useRecords()` returns fresh arrays on every data change

Every time any record in a table changes, `useRecords(table)` returns a **new array reference**. This triggers re-renders in every component that receives that array as a prop or dependency. In extensions with multiple tables loaded (e.g., campaigns, products, channels, content units), a single edit can cascade re-renders across the entire tree.

**Mitigation:** Use `React.memo` on list item components so unchanged rows skip rendering. Pass stable, derived data (like lookup Maps) instead of raw record arrays when possible.

### `getCellValue()` and `getCellValueAsString()` are not free

These are SDK method calls with overhead — they are NOT simple property lookups. Calling them 5+ times per record inside a `.map()` or `.filter()` that runs on every render adds up fast, especially with hundreds of records.

**Mitigation:** For filtering/sorting, memoize the derived list with `useMemo`. For display, extract row components so field reads only happen for visible rows.

### Linked record fields return stubs, not full records

`getCellValue('Linked Field')` returns `[{id, name}]` — lightweight stubs, not full record objects. To render clickable pills that can call `expandRecord()`, you must resolve each stub against the loaded records from the linked table. Naive resolution with `records.find(r => r.id === link.id)` is O(n) per link — with many links across many rows, this becomes O(rows × links × records).

**Mitigation:** Pre-build a `Map` keyed by record ID for each linked table, then resolve with `map.get(link.id)` for O(1) lookups:

```tsx
const recordMap = useMemo(() => {
    const map = new Map();
    if (records) records.forEach(r => map.set(r.id, r));
    return map;
}, [records]);

// In render: recordMap.get(link.id) instead of records.find(...)
```

### AI text fields (`AI_TEXT`) are read-only

`aiText` fields are generated by Airtable AI automations. Attempting to write to them throws: `"invalid cell value — <root>.0 must be an object"`. Before exposing inline editing on a text field, check `field.type` — only `singleLineText`, `multilineText`, `richText`, `email`, `url`, and `phoneNumber` are writable.

---

## Common Mistakes to Avoid

1. **Importing from wrong package.** Use `@airtable/blocks/interface/ui` and `@airtable/blocks/interface/models`. NOT `@airtable/blocks/ui` (that's the old Blocks SDK).

2. **Trying to import UI components from `@airtable/blocks`.** There is no `<Button>`, `<Input>`, `<Box>`, `<FormField>` from Airtable. Interface Extensions only provide `<CellRenderer>`. Use a third-party library like MUI (`@mui/material`) or plain HTML/React elements.

3. **Forgetting permission checks before writes.** Always call `hasPermissionTo*` or `checkPermissionsFor*` before any create/update/delete. The interface designer may have disabled editing.

4. **Overwriting array fields instead of appending.** Linked records, attachments, multi-select, multi-collaborator all OVERWRITE. Always spread existing value: `[...record.getCellValue('Field'), newItem]`.

5. **Defining getCustomProperties inline.** The function passed to `useCustomProperties()` must be stable — define at top level or use `useCallback`. Defining inline causes infinite re-renders.

6. **Assuming checkbox false is `false`.** Unchecked checkboxes return `null`, not `false`. Writing `false` works but reading will give `null`.

7. **Not awaiting between batches.** Without `await` between batch calls, you'll exceed the 15 writes/sec rate limit and crash the extension.

8. **Using `ReactDOM.render` instead of `initializeBlock`.** The entry point is `initializeBlock({interface: () => <App />})`.

9. **Ignoring dark mode.** Use `@media (prefers-color-scheme: dark)` in CSS. This matches Airtable's appearance setting automatically.

10. **Expecting view-level access.** Interface Extensions don't expose views. Data access is table-level via `useRecords(table)`. The records returned are scoped to what Interface Designer has configured.

11. **Comparing field.type against string literals.** Always use the `FieldType` enum: `field.type === FieldType.SINGLE_SELECT`, never `field.type === 'singleSelect'`.

12. **Hardcoding field names or table names.** Use custom properties so builders can configure which fields/tables the extension uses. Names change if users rename them; IDs are stable but custom properties are best.

13. **Not filling the container.** Extensions should use the full width and height of their container by default. Use `position: fixed; inset: 0` or `width: 100%; height: 100vh` on the root element. The extension can scroll if content overflows.

14. **Using throwing field/table getters.** Prefer `getFieldIfExists()` and `getTableByIdIfExists()` over `getField()`, `getFieldByName()`, `getFieldById()` — the throwing variants crash if a field was deleted or isn't visible.

---

## Debug Panel Pattern

Interface Extensions only expose tables and fields that the builder has explicitly added as data sources. This is the #1 cause of "field not found" / blank data issues. A debug panel controlled by a custom property toggle is essential during development.

### Setup: boolean custom property

```tsx
{key: 'showDebug', label: 'Show Debug Panel', type: 'boolean', defaultValue: false},
```

Then gate rendering:
```tsx
const showDebug = customPropertyValueByKey.showDebug;
{showDebug && <DebugPanel base={base} tables={tables} data={data} />}
```

### What the debug panel should show

For each table your extension uses:

1. **Resolution status** -- is the table resolved from custom properties? If not, the builder hasn't picked it yet.
2. **Record count** -- confirms data is loading (`0` vs `null` distinguishes "empty table" from "not connected").
3. **Available fields** -- `table.fields.map(f => ({id: f.id, name: f.name, type: f.type}))`. Fields NOT in this list will silently return `null`/throw from `getCellValue`.
4. **Missing field validation** -- compare your expected field ID map against `table.fields`. Highlight missing IDs so the builder knows which fields to add as data sources.
5. **Write permissions** -- `table.hasPermissionToCreateRecord()`.
6. **Sample record probe** -- for the first record, try `getCellValueAsString(fieldId)` for every expected field. Catch errors and display them.

### Key insight

The Interface SDK silently fails for unconfigured fields -- `getCellValue` throws, `getCellValueAsString` may throw or return empty. The debug panel makes this visible. **Always include one during development**, then hide it behind the boolean toggle for production.
