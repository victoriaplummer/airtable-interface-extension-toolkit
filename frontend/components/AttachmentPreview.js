import React from 'react';

const SAFE_IMG_SCHEMES = new Set(['http:', 'https:']);

function safeImageUrl(raw) {
    if (!raw) return null;
    try {
        const parsed = new URL(String(raw).trim(), 'https://example.invalid');
        if (parsed.origin === 'https://example.invalid') return null;
        return SAFE_IMG_SCHEMES.has(parsed.protocol) ? parsed.href : null;
    } catch {
        return null;
    }
}

/**
 * Renders a thumbnail preview of an Airtable attachment field value.
 *
 * Props:
 *   attachments - Array from getCellValue() on an attachment field
 *   className   - Image element classes (e.g. 'w-full h-full')
 *   index       - Which attachment to show (default: 0)
 */
export default function AttachmentPreview({ attachments, className = '', index = 0 }) {
    if (!attachments || attachments.length === 0) return null;
    const att = attachments[index];
    if (!att) return null;
    const url = safeImageUrl(att.thumbnails?.large?.url || att.url);
    if (!url) return null;
    return (
        <img
            src={url}
            alt={att.filename || ''}
            referrerPolicy="no-referrer"
            className={`rounded-md object-cover ${className}`}
        />
    );
}
