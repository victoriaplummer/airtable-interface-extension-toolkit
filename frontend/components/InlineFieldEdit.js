import React, { useState } from 'react';

/**
 * Smart inline field editor — automatically renders a dropdown for select fields
 * or a click-to-edit text input for text fields.
 *
 * Props:
 *   label     - Field label
 *   value     - Current string value
 *   fieldMeta - From getFieldMeta(): {choices: string[], type: string|null}
 *   onSave    - Callback with new value
 *   disabled  - Prevents editing
 */
export default function InlineFieldEdit({ label, value, fieldMeta, onSave, disabled }) {
    const hasChoices = fieldMeta.choices.length > 0;

    if (hasChoices) {
        return (
            <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-gray400">{label}</label>
                <select
                    value={value}
                    onChange={e => onSave(e.target.value)}
                    disabled={disabled}
                    className="text-xs border border-gray-gray200 dark:border-gray-gray600 rounded-md px-2 py-1 bg-white dark:bg-gray-gray700 disabled:opacity-50"
                >
                    <option value="">—</option>
                    {fieldMeta.choices.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        );
    }

    return <InlineTextInput label={label} value={value} onSave={onSave} disabled={disabled} />;
}

/**
 * Inline click-to-edit text input. Shows a dashed-border button when not editing,
 * an input with blue border when editing.
 */
export function InlineTextInput({ label, value, onSave, disabled }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    const commit = () => {
        setEditing(false);
        if (draft !== value) onSave(draft);
    };

    if (editing) {
        return (
            <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-gray400">{label}</label>
                <input
                    type="text"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onBlur={commit}
                    onKeyDown={e => {
                        if (e.key === 'Enter') commit();
                        if (e.key === 'Escape') { setDraft(value); setEditing(false); }
                    }}
                    autoFocus
                    disabled={disabled}
                    className="text-xs border border-blue-blue rounded-md px-2 py-1 bg-white dark:bg-gray-gray700 focus:outline-none focus:ring-2 focus:ring-blue-blue/30 w-32"
                />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-gray400">{label}</label>
            <button
                onClick={() => { setDraft(value); setEditing(true); }}
                disabled={disabled}
                className="text-xs px-2 py-1 rounded-md border border-dashed border-gray-gray200 dark:border-gray-gray600 text-gray-gray500 dark:text-gray-gray400 hover:border-blue-blue hover:text-blue-blue transition-colors disabled:opacity-50 min-w-[80px] text-left"
            >
                {value || 'Click to edit'}
            </button>
        </div>
    );
}
