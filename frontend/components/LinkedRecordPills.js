import React from 'react';

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
