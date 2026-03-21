// airtable-extension-toolkit
// Reusable helpers and components for Airtable Interface Extensions.

// ── Color system ─────────────────────────────────────────────────────────────────
export {
    AT_COLOR_FAMILY,
    AT_COLORS_RAW,
    TAILWIND_STYLES,
    airtableColorStyles,
    airtableColorValues,
    createColorResolver,
} from './colors';

// ── Field helpers ────────────────────────────────────────────────────────────────
export {
    getField,
    getFieldString,
    isWritableTextField,
    getFieldMeta,
    getSelectChoices,
    WRITABLE_TEXT_TYPES,
} from './fields';

// ── Components ───────────────────────────────────────────────────────────────────
export { default as EditableText } from './components/EditableText';
export { default as EditableSection, FormSection, BibleSection, AIOutputSection } from './components/EditableSection';
export { default as InlineFieldEdit, InlineTextInput } from './components/InlineFieldEdit';
export { default as LinkedRecordPills, LinkedSection } from './components/LinkedRecordPills';
export { default as Badge } from './components/Badge';
export { default as AttachmentPreview } from './components/AttachmentPreview';
export { default as Markdown, looksLikeMarkdown } from './components/Markdown';
