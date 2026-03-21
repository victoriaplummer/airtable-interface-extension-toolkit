// Field access helpers for Airtable Interface Extensions.
// Wraps the SDK's getCellValue/getCellValueAsString with safe error handling,
// and provides schema inspection utilities.

import { airtableColorStyles, airtableColorValues } from './colors';

// ── Safe field access ────────────────────────────────────────────────────────────

/**
 * Safely read a cell's raw value. Returns null if field is missing or throws.
 * Use for linked records, attachments, selects — anything where you need the object shape.
 */
export function getField(record, fieldId) {
    try {
        return record.getCellValue(fieldId);
    } catch {
        return null;
    }
}

/**
 * Safely read a cell's display string. Returns '' if field is missing or throws.
 * Use for text, dates, numbers — anything you'll render as plain text.
 */
export function getFieldString(record, fieldId) {
    try {
        return record.getCellValueAsString(fieldId);
    } catch {
        return '';
    }
}

// ── Field type checks ────────────────────────────────────────────────────────────

/** Field types that support plain string writes via updateRecordAsync. */
export const WRITABLE_TEXT_TYPES = new Set([
    'singleLineText', 'multilineText', 'richText',
    'email', 'url', 'phoneNumber',
]);

/**
 * Check if a field is a writable text type (not aiText, formula, lookup, etc.).
 * Use to gate inline editing — only allow click-to-edit for fields that accept string writes.
 */
export function isWritableTextField(table, fieldId) {
    if (!table) return false;
    try {
        const field = table.getFieldByIdIfExists(fieldId);
        return field ? WRITABLE_TEXT_TYPES.has(field.type) : false;
    } catch {
        return false;
    }
}

// ── Field metadata ───────────────────────────────────────────────────────────────

/**
 * Read field metadata from the table schema.
 * Returns {choices: string[], type: string|null}.
 * `choices` is populated for single/multi select fields — use to build dropdown UIs.
 */
export function getFieldMeta(table, fieldId) {
    if (!table) return { choices: [], type: null };
    try {
        const field = table.getFieldByIdIfExists(fieldId);
        if (!field) return { choices: [], type: null };
        const choices = field.options?.choices?.map(c => c.name) || [];
        return { choices, type: field.type };
    } catch {
        return { choices: [], type: null };
    }
}

// ── Select field choices with colors ─────────────────────────────────────────────

/**
 * Read select field choices with their Airtable colors resolved to style values.
 * @param {Table} table - Airtable table model
 * @param {string} fieldId - Field ID
 * @param {object} [options]
 * @param {'tailwind'|'raw'} [options.mode='tailwind'] - Output mode for colors
 * @returns {Array<{name: string, styles: object}>}
 */
export function getSelectChoices(table, fieldId, options = {}) {
    const { mode = 'tailwind' } = options;
    const resolve = mode === 'raw' ? airtableColorValues : airtableColorStyles;
    if (!table) return [];
    try {
        const field = table.getFieldByIdIfExists(fieldId);
        if (field && field.options && field.options.choices) {
            return field.options.choices.map(c => ({
                name: c.name,
                styles: resolve(c.color),
            }));
        }
    } catch {}
    return [];
}
