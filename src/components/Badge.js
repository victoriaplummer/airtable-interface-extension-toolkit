import React from 'react';

/**
 * Colored badge for status pills and tags.
 *
 * Props:
 *   text      - Badge label
 *   colors    - {bg, text} from airtableColorStyles() or getSelectChoices().styles
 *   className - Additional classes
 */
export default function Badge({ text, colors, className = '' }) {
    const c = colors || { bg: 'bg-gray-gray100', text: 'text-gray-gray500' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${c.bg} ${c.text} ${className}`}>
            {text}
        </span>
    );
}
