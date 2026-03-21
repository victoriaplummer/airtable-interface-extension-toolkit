import React, { useState } from 'react';

/**
 * Core click-to-edit primitive for text fields.
 *
 * When `onSave` is provided, clicking the display content opens an editor.
 * When `onSave` is null/undefined, the component is read-only.
 *
 * Props:
 *   value        - Current field value (string)
 *   onSave       - Callback with new value. If null, component is read-only.
 *   disabled     - Grays out and prevents editing
 *   multiline    - Use textarea instead of input
 *   placeholder  - Shown when value is empty (default: 'Click to edit')
 *   className    - Applied to the display container
 *   inputClassName - Override edit-mode input/textarea classes
 *   rows         - Textarea rows (default: 4)
 *   hideWhenEmpty - Return null when value is empty and not editing
 *   renderDisplay - Custom display renderer: (value) => ReactNode
 */
export default function EditableText({
    value,
    onSave,
    disabled,
    multiline,
    placeholder = 'Click to edit',
    className = '',
    inputClassName,
    rows = 4,
    hideWhenEmpty = false,
    renderDisplay,
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value || '');

    const commit = () => {
        setEditing(false);
        if (draft !== (value || '') && onSave) onSave(draft);
    };

    if (hideWhenEmpty && !value && !editing) return null;

    if (editing && onSave) {
        const defaultInputClass = multiline
            ? 'w-full text-sm bg-white dark:bg-gray-gray800 rounded-md p-2 border border-blue-blue focus:outline-none focus:ring-2 focus:ring-blue-blue/30 resize-y'
            : 'w-full text-sm bg-white dark:bg-gray-gray800 rounded-md px-2 py-1 border border-blue-blue focus:outline-none focus:ring-2 focus:ring-blue-blue/30';

        return multiline ? (
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
                className={inputClassName || defaultInputClass}
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
                className={inputClassName || defaultInputClass}
            />
        );
    }

    const canEdit = !!onSave;
    const editProps = canEdit ? {
        onClick: () => { setDraft(value || ''); setEditing(true); },
        className: `cursor-text rounded-md p-1 -m-1 hover:bg-gray-gray25 dark:hover:bg-gray-gray700/50 transition-colors ${className}`,
    } : {
        className: className,
    };

    if (value) {
        return (
            <div {...editProps}>
                {renderDisplay ? renderDisplay(value) : value}
            </div>
        );
    }

    return (
        <div {...editProps}>
            <span className="text-gray-gray300 dark:text-gray-gray500 italic text-sm">
                {canEdit ? placeholder : ''}
            </span>
        </div>
    );
}
