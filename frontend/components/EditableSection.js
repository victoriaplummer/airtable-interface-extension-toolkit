import React, { useState } from 'react';

/**
 * Labeled click-to-edit section for text and long text fields.
 * Wraps the click-to-edit pattern with a label and optional Markdown display.
 *
 * Presets:
 *   FormSection    = labelStyle 'default'
 *   BibleSection   = labelStyle 'uppercase', markdown display
 *   AIOutputSection = labelStyle 'heading', markdown display, placeholder for empty
 *
 * Props:
 *   label          - Section label text
 *   value          - Current field value
 *   onSave         - Callback with new value. Null = read-only.
 *   disabled       - Prevents editing
 *   multiline      - Use textarea (default: true)
 *   labelStyle     - 'default' | 'uppercase' | 'heading'
 *   placeholder    - Shown when empty (default: 'Click to edit')
 *   rows           - Textarea rows (default: 4)
 *   renderDisplay  - Custom display renderer. If not provided, renders plain whitespace-pre-wrap.
 */
export default function EditableSection({
    label,
    value,
    onSave,
    disabled,
    multiline = true,
    labelStyle = 'default',
    placeholder = 'Click to edit',
    rows = 4,
    renderDisplay,
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value || '');

    const commit = () => {
        setEditing(false);
        if (draft !== (value || '') && onSave) onSave(draft);
    };

    const labelClasses = {
        default: 'block text-xs font-medium text-gray-gray400 mb-0.5',
        uppercase: 'text-sm font-semibold text-gray-gray400 uppercase tracking-wide mb-1',
        heading: 'text-sm font-semibold text-gray-gray500 mb-2',
    };

    const labelEl = <label className={labelClasses[labelStyle] || labelClasses.default}>{label}</label>;

    if (editing && onSave) {
        return (
            <div>
                {labelEl}
                {multiline ? (
                    <textarea
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onBlur={commit}
                        onKeyDown={e => {
                            if (e.key === 'Escape') { setDraft(value || ''); setEditing(false); }
                        }}
                        autoFocus
                        disabled={disabled}
                        rows={rows}
                        className="w-full text-sm bg-white dark:bg-gray-gray800 rounded-md p-2 border border-blue-blue focus:outline-none focus:ring-2 focus:ring-blue-blue/30 resize-y"
                    />
                ) : (
                    <input
                        type="text"
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onBlur={commit}
                        onKeyDown={e => {
                            if (e.key === 'Enter') commit();
                            if (e.key === 'Escape') { setDraft(value || ''); setEditing(false); }
                        }}
                        autoFocus
                        disabled={disabled}
                        className="w-full text-sm bg-white dark:bg-gray-gray800 rounded-md px-2 py-1 border border-blue-blue focus:outline-none focus:ring-2 focus:ring-blue-blue/30"
                    />
                )}
            </div>
        );
    }

    const canEdit = !!onSave;
    const containerClass = canEdit
        ? 'cursor-text rounded-md p-1 -m-1 hover:bg-gray-gray25 dark:hover:bg-gray-gray700/50 transition-colors'
        : '';

    if (value) {
        return (
            <div>
                {labelEl}
                <div
                    onClick={canEdit ? () => { setDraft(value); setEditing(true); } : undefined}
                    className={containerClass}
                >
                    {renderDisplay ? renderDisplay(value) : (
                        <div className="text-sm whitespace-pre-wrap">{value}</div>
                    )}
                </div>
            </div>
        );
    }

    if (!canEdit) return null;

    return (
        <div>
            {labelEl}
            <div
                onClick={() => { setDraft(''); setEditing(true); }}
                className={containerClass}
            >
                <span className="text-sm text-gray-gray300 dark:text-gray-gray500 italic">{placeholder}</span>
            </div>
        </div>
    );
}

// ── Convenience presets ──────────────────────────────────────────────────────────

export function FormSection(props) {
    return <EditableSection labelStyle="default" {...props} />;
}

export function BibleSection(props) {
    return <EditableSection labelStyle="uppercase" {...props} />;
}

export function AIOutputSection({ placeholder: emptyPlaceholder, ...props }) {
    return <EditableSection labelStyle="heading" placeholder={emptyPlaceholder} rows={8} {...props} />;
}
