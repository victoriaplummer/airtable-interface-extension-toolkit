import React, {useState, useMemo} from 'react';

/**
 * Renders linked record values as clickable pills that open the record detail.
 * Matches Airtable's native linked record chip styling.
 *
 * Props:
 *   value          - Raw getCellValue() result: Array<{id, name}>
 *   records        - Loaded records from the linked table (for onExpand lookup)
 *   onExpand       - Called with the full record when a pill is clicked.
 *                    Pass Airtable's `expandRecord` function, or your own handler.
 *                    If null, pills are not clickable.
 *   className      - Wrapper className
 *   pillClassName  - Override clickable pill classes
 *   fallbackClassName - Override non-clickable pill classes
 */
export default function LinkedRecordPills({
    value,
    records,
    onExpand,
    className = '',
    pillClassName,
    fallbackClassName,
}) {
    if (!value || !Array.isArray(value) || value.length === 0) return null;

    const defaultPill = 'inline-flex items-center px-2 py-0.5 rounded bg-cyan-cyanLight2 text-cyan-cyanDark1 dark:bg-cyan-cyanDark1/20 dark:text-cyan-cyanLight1 text-xs hover:bg-cyan-cyanLight1 dark:hover:bg-cyan-cyanDark1/30 transition-colors cursor-pointer';
    const defaultFallback = 'inline-flex items-center px-2 py-0.5 rounded bg-gray-gray100 text-gray-gray500 dark:bg-gray-gray700 dark:text-gray-gray300 text-xs';

    return (
        <span className={`flex flex-wrap gap-1 justify-start ${className}`}>
            {value.map(link => {
                const fullRecord = records?.find(r => r.id === link.id);
                if (fullRecord && onExpand) {
                    return (
                        <button
                            key={link.id}
                            onClick={e => { e.stopPropagation(); onExpand(fullRecord); }}
                            className={pillClassName || defaultPill}
                        >
                            {link.name}
                        </button>
                    );
                }
                return (
                    <span key={link.id} className={fallbackClassName || defaultFallback}>
                        {link.name}
                    </span>
                );
            })}
        </span>
    );
}

/**
 * Labeled wrapper around LinkedRecordPills.
 * Shows a label above the pills, or nothing if the value is empty.
 */
export function LinkedSection({ label, value, records, onExpand }) {
    if (!value || !Array.isArray(value) || value.length === 0) return null;
    return (
        <div>
            <label className="block text-xs font-medium text-gray-gray400 mb-1">{label}</label>
            <LinkedRecordPills value={value} records={records} onExpand={onExpand} />
        </div>
    );
}

/**
 * LinkedRecordPills with an inline "+" button that opens a searchable dropdown
 * to add new linked records. Handles the append pattern automatically.
 *
 * Props:
 *   value          - Raw getCellValue() result: Array<{id, name}>
 *   records        - Loaded records from the linked table (for pill rendering/expand)
 *   allRecords     - All records in the linked table (for the dropdown options).
 *                    Usually the same as `records`. Pass separately if `records` is filtered.
 *   onExpand       - Called with the full record when a pill is clicked.
 *   onAdd          - Called with (recordId) when a record is selected from the dropdown.
 *                    The caller is responsible for the actual update (append pattern).
 *                    If null, the "+" button is not shown.
 *   className      - Wrapper className
 *   pillClassName  - Override clickable pill classes
 *   fallbackClassName - Override non-clickable pill classes
 */
export function LinkedPillsWithAdd({
    value,
    records,
    allRecords,
    onExpand,
    onAdd,
    className = '',
    pillClassName,
    fallbackClassName,
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const linkedIds = useMemo(() => new Set((value || []).map(v => v.id)), [value]);
    const available = useMemo(() => {
        if (!allRecords) return [];
        return allRecords.filter(r => !linkedIds.has(r.id));
    }, [allRecords, linkedIds]);
    const filtered = useMemo(() => {
        if (!search) return available;
        const q = search.toLowerCase();
        return available.filter(r => r.name.toLowerCase().includes(q));
    }, [available, search]);

    return (
        <span className={`flex flex-wrap gap-1 items-center ${className}`}>
            <LinkedRecordPills
                value={value}
                records={records}
                onExpand={onExpand}
                pillClassName={pillClassName}
                fallbackClassName={fallbackClassName}
            />
            {onAdd && (
                <span className="relative">
                    <button
                        onClick={() => { setOpen(!open); setSearch(''); }}
                        className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-gray75 dark:bg-gray-gray700 text-gray-gray400 hover:bg-blue-blueLight2 hover:text-blue-blueDark1 dark:hover:bg-blue-blueDark1/20 dark:hover:text-blue-blueLight1 text-xs transition-colors"
                        title="Add"
                    >
                        +
                    </button>
                    {open && (
                        <div className="absolute top-full left-0 mt-1 z-50 w-52 bg-white dark:bg-gray-gray800 rounded-lg border border-gray-gray100 dark:border-gray-gray700 shadow-lg overflow-hidden">
                            <div className="p-1.5">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search..."
                                    autoFocus
                                    className="w-full text-xs bg-gray-gray25 dark:bg-gray-gray700 rounded px-2 py-1 border border-gray-gray100 dark:border-gray-gray600 focus:outline-none focus:border-blue-blue"
                                />
                            </div>
                            <div className="max-h-40 overflow-y-auto">
                                {filtered.length === 0 ? (
                                    <div className="px-3 py-2 text-xs text-gray-gray400">No options</div>
                                ) : (
                                    filtered.map(r => (
                                        <button
                                            key={r.id}
                                            onClick={() => { onAdd(r.id); setOpen(false); }}
                                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-blueLight3 dark:hover:bg-blue-blueDark1/10 transition-colors truncate"
                                        >
                                            {r.name}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </span>
            )}
        </span>
    );
}
