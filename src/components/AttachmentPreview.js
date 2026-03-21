import React from 'react';

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
    const url = att.thumbnails?.large?.url || att.url;
    if (!url) return null;
    return <img src={url} alt={att.filename || ''} className={`rounded-md object-cover ${className}`} />;
}
