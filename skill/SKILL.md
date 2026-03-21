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

There is NO Airtable UI component library. No `<Button>`, `<Input>`, `<Select>` from Airtable. You use plain React + your own CSS. The only provided component is `<CellRenderer>`.

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
| **Headless UI** | `@radix-ui/react-*` | Accessible primitives (dialogs, dropdowns, tooltips) without styling opinions. |
| **Icons** | `lucide-react` or `react-icons` | No Airtable icon library is provided. |
| **CSS framework** | Plain CSS with `prefers-color-scheme` | See below for why Tailwind is difficult. |

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

### Why Tailwind/shadcn is difficult

The blocks CLI controls the webpack config and doesn't expose it. Tailwind requires PostCSS configuration. Additionally, Tailwind's `dark:` class approach conflicts with Airtable's `prefers-color-scheme` system. If you want Tailwind, you'd need to use the CDN play build via `loadCSSFromURLAsync` — but this is heavyweight and lacks dark mode integration.

### Design tokens from Airtable

Use the built-in `colors` and `colorUtils` to match Airtable's palette:

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

```tsx
const field = table.getFieldByName('Status');  // throws if not found
const field2 = table.getFieldByNameIfExists('X'); // null if not found
// Also: getFieldById, getFieldByIdIfExists, getField(idOrName), getFieldIfExists(idOrName)

field.type    // FieldType enum value, e.g. 'singleSelect'
field.name    // string
field.options // field-specific options (see FieldType reference)
field.config  // { type, options } — useful for type narrowing
field.isComputed    // true for formula, rollup, autoNumber, etc.
field.isPrimaryField
field.description   // string | null
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

// Expand a record to its detail view
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
| `interface-extensions-heatmap` | — | Data visualization |
| `interface-extensions-sliding-bar-chart` | — | Charting |

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

## Linked Record Pill Pattern

Linked record fields should **always** render as clickable pills, not plain text. This matches Airtable's native UX and helps users understand data relationships at a glance.

### The component

```tsx
// Shared component — export from your main entry file.
// `value` = raw getCellValue() result: Array<{id, name}>
// `records` = loaded records from the linked table (for expandRecord lookup)
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
                            <ExternalLinkIcon />
                        </button>
                    );
                }
                // Fallback — record not in loaded data (table not connected)
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

### Usage

Use `getField()` (raw cell value) instead of `getFieldString()` for linked record fields:

```tsx
// ✅ Linked record — use getField + LinkedRecordPills
const campaignLinks = getField(record, FIELDS.CAMPAIGN_BRIEF);
<LinkedRecordPills value={campaignLinks} records={data.campaigns} />

// ❌ Don't flatten to string for linked records
const campaign = getFieldString(record, FIELDS.CAMPAIGN_BRIEF);
<span>{campaign}</span>
```

### Rules

1. **Always use pills for linked records.** Plain text loses the relationship context that Airtable users expect.
2. **Use `getField()` not `getFieldString()`** — you need the raw `[{id, name}]` array for both rendering and record lookup.
3. **Pass the loaded records array** for the linked table so pills can call `expandRecord()`. If records aren't available, the pill renders as a static (non-clickable) badge.
4. **Always `e.stopPropagation()`** on click — pills are often nested inside other clickable elements (cards, accordions).
5. **Graceful fallback** — if the linked table isn't loaded or the record isn't found, show a plain gray pill with just the name.

---

## Inline Field Editing Pattern

When exposing editable fields in your UI, **always read field options from the schema** — never hardcode dropdown values. This ensures the UI stays in sync when options are renamed, reordered, or added in Airtable.

### Reading field metadata

```tsx
// Get field choices and type from the table schema
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

// Usage — memoize per table (field schema is stable within a render)
const statusMeta = useMemo(() => getFieldMeta(contentTable, FIELDS.STATUS), [contentTable]);
const approvedByMeta = useMemo(() => getFieldMeta(contentTable, FIELDS.APPROVED_BY), [contentTable]);
```

### Smart inline editor component

Render a dropdown for fields with choices (single select, multi-select), a click-to-edit text input for text fields:

```tsx
function InlineFieldEdit({label, value, fieldMeta, onSave, disabled}) {
    // Select fields → dropdown populated from schema
    if (fieldMeta.choices.length > 0) {
        return (
            <div>
                <label>{label}</label>
                <select
                    value={value}
                    onChange={e => onSave(e.target.value)}
                    disabled={disabled}
                >
                    <option value="">—</option>
                    {fieldMeta.choices.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        );
    }

    // Text fields → click-to-edit input
    return <InlineTextInput label={label} value={value} onSave={onSave} disabled={disabled} />;
}
```

### Write values by field type

When saving, the value format depends on the field type:

```tsx
// Single select → {name: 'Option Name'} or null to clear
onSave={val => updateField(record, FIELDS.STATUS, val ? {name: val} : null)}

// Text field → plain string or null to clear
onSave={val => updateField(record, FIELDS.NOTES, val || null)}

// Number → number or null
onSave={val => updateField(record, FIELDS.SCORE, val ? Number(val) : null)}
```

### Rules

1. **Never hardcode select options.** Always use `field.options.choices` from the schema.
2. **Always permission-check before writing.** Use `table.checkPermissionsForUpdateRecord()`.
3. **Memoize field metadata.** `useMemo(() => getFieldMeta(...), [table])` — field schema doesn't change within a render cycle.
4. **Handle missing fields gracefully.** `getFieldByIdIfExists` returns null if the field isn't exposed in Interface Designer. The component should degrade to read-only or hidden.

---

## Debug Panel Pattern

Interface Extensions only expose tables and fields that the builder has explicitly added as data sources. This is the #1 cause of "field not found" / blank data issues. A debug panel controlled by a custom property toggle is essential during development.

### Setup: boolean custom property

```tsx
function getCustomProperties(base) {
    return [
        // ... table pickers ...
        {key: 'showDebug', label: 'Show Debug Panel', type: 'boolean', defaultValue: false},
    ];
}
```

Then gate rendering in your layout:
```tsx
const {customPropertyValueByKey} = useCustomProperties(getCustomProperties);
const showDebug = customPropertyValueByKey.showDebug;
// ...
{showDebug && <DebugPanel base={base} tables={tables} data={data} />}
```

### What the debug panel should show

For each table your extension uses, display:

1. **Resolution status** — is the table resolved from custom properties? If not, the builder hasn't picked it yet.
2. **Record count** — confirms data is actually loading (`0` vs `null` distinguishes "empty table" from "table not connected").
3. **Available fields** — `table.fields.map(f => ({id: f.id, name: f.name, type: f.type}))`. This is what the Interface Designer has exposed. Fields NOT in this list will silently return `null`/throw from `getCellValue`.
4. **Missing field validation** — compare your expected field ID map against `table.fields`. Highlight any expected IDs that aren't in the available set. This instantly tells the builder which fields to add as data sources.
5. **Write permissions** — `table.hasPermissionToCreateRecord()`. Shows whether the interface config allows writes.
6. **Sample record probe** — for the first record, try `getCellValueAsString(fieldId)` for every expected field. Catch errors and display them. This reveals field ID mismatches, permission issues, and data format surprises.

### Implementation pattern

```tsx
// Define your expected field maps per table
const FIELD_MAPS = {
    tasksTable: {label: 'Tasks', fields: {NAME: 'fldXXX', STATUS: 'fldYYY', ...}},
    // ...
};

function DebugPanel({base, tables, data}) {
    const [expandedTable, setExpandedTable] = useState(null);

    return (
        <div style={{margin: 16, padding: 12, background: '#fffde7', fontSize: 11, fontFamily: 'monospace', maxHeight: 400, overflow: 'auto'}}>
            <strong>Debug Panel</strong>

            {/* Base tables */}
            <div>
                <strong>Base tables ({base.tables.length}):</strong>
                {base.tables.map(t => <div key={t.id}>{t.id} = {t.name}</div>)}
            </div>

            {/* Per-table diagnostics — click to expand */}
            {Object.entries(FIELD_MAPS).map(([tableKey, {label, fields}]) => {
                const table = tables[tableKey];
                const records = data[tableKey.replace('Table', '') + 's']; // convention
                const isExpanded = expandedTable === tableKey;

                // Available field IDs on this table
                const availableIds = new Set();
                if (table) {
                    try { table.fields.forEach(f => availableIds.add(f.id)); } catch {}
                }

                const expected = Object.entries(fields);
                const missing = expected.filter(([, fid]) => !availableIds.has(fid));
                const canWrite = table ? table.hasPermissionToCreateRecord() : false;

                return (
                    <div key={tableKey}>
                        <button onClick={() => setExpandedTable(isExpanded ? null : tableKey)}>
                            {isExpanded ? '▼' : '▶'} <strong>{label}</strong>
                            {' '}{table ? `${records?.length ?? 0} records` : 'NOT RESOLVED'}
                            {missing.length > 0 && ` (${missing.length} missing fields)`}
                            {' '}{canWrite ? 'writable' : 'read-only'}
                        </button>
                        {isExpanded && (
                            <div style={{marginLeft: 16}}>
                                {/* Available fields */}
                                {table && table.fields.map(f => (
                                    <div key={f.id}>{f.id} = {f.name} ({f.type})</div>
                                ))}
                                {/* Missing fields — builder needs to add these */}
                                {missing.length > 0 && (
                                    <div style={{color: 'red'}}>
                                        Missing: {missing.map(([k, fid]) => `${k}=${fid}`).join(', ')}
                                    </div>
                                )}
                                {/* Sample probe */}
                                {records?.[0] && expected.map(([key, fid]) => {
                                    let val;
                                    try {
                                        val = records[0].getCellValueAsString(fid);
                                        val = val ? val.substring(0, 60) : '(empty)';
                                    } catch (e) {
                                        val = 'ERROR: ' + e.message;
                                    }
                                    return <div key={fid}>{key}: {val}</div>;
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
```

### Key insight

The Interface SDK silently fails for unconfigured fields — `getCellValue` throws, `getCellValueAsString` may throw or return empty. The debug panel makes this visible. **Always include one during development**, then hide it behind the boolean toggle for production.

---

## Common Mistakes to Avoid

1. **Importing from wrong package.** Use `@airtable/blocks/interface/ui` and `@airtable/blocks/interface/models`. NOT `@airtable/blocks/ui` (that's the old Blocks SDK).

2. **Trying to use Airtable UI components.** There is no `<Button>`, `<Input>`, `<Box>`, `<FormField>` etc. Those existed in the old Blocks SDK. Interface Extensions only provide `<CellRenderer>`. Use plain HTML/React elements.

3. **Forgetting permission checks before writes.** Always call `hasPermissionTo*` or `checkPermissionsFor*` before any create/update/delete. The interface designer may have disabled editing.

4. **Overwriting array fields instead of appending.** Linked records, attachments, multi-select, multi-collaborator all OVERWRITE. Always spread existing value: `[...record.getCellValue('Field'), newItem]`.

5. **Defining getCustomProperties inline.** The function passed to `useCustomProperties()` must be stable — define at top level or use `useCallback`. Defining inline causes infinite re-renders.

6. **Assuming checkbox false is `false`.** Unchecked checkboxes return `null`, not `false`. Writing `false` works but reading will give `null`.

7. **Not awaiting between batches.** Without `await` between batch calls, you'll exceed the 15 writes/sec rate limit and crash the extension.

8. **Using `ReactDOM.render` instead of `initializeBlock`.** The entry point is `initializeBlock({interface: () => <App />})`.

9. **Ignoring dark mode.** Use `@media (prefers-color-scheme: dark)` in CSS. This matches Airtable's appearance setting automatically.

10. **Expecting view-level access.** Interface Extensions don't expose views. Data access is table-level via `useRecords(table)`. The records returned are scoped to what Interface Designer has configured.

11. **Hardcoding select field options.** Never hardcode dropdown values like `['Draft', 'In Review', 'Approved']`. Always read from `table.getFieldByIdIfExists(fieldId).options.choices`. If options are renamed or added in Airtable, hardcoded values silently break.
