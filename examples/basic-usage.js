/**
 * Basic usage example — shows how to use the toolkit in an Airtable Interface Extension.
 *
 * This is a simplified version of a campaign detail view. It demonstrates:
 *   - Safe field access with getField/getFieldString
 *   - Dynamic select field colors from Airtable schema
 *   - Inline editing with isWritableTextField gating
 *   - Linked record pills
 *   - Attachment previews
 */

import React, { useMemo, useCallback, useState } from 'react';
import { initializeBlock, useBase, useRecords, useCustomProperties, expandRecord } from '@airtable/blocks/interface/ui';
import {
    getField,
    getFieldString,
    getSelectChoices,
    isWritableTextField,
    EditableSection,
    LinkedRecordPills,
    LinkedSection,
    Badge,
    AttachmentPreview,
} from 'airtable-extension-toolkit';

// Field IDs — replace with your own
const FIELDS = {
    NAME: 'fldXXXXXXXXXXXXXXX',
    STATUS: 'fldXXXXXXXXXXXXXXX',
    DESCRIPTION: 'fldXXXXXXXXXXXXXXX',
    BRANDS: 'fldXXXXXXXXXXXXXXX',
    IMAGE: 'fldXXXXXXXXXXXXXXX',
};

function getCustomProperties(base) {
    return [
        { key: 'campaignsTable', label: 'Campaigns', type: 'table', defaultValue: base.tables[0] },
        { key: 'brandsTable', label: 'Brands', type: 'table', defaultValue: null },
    ];
}

function App() {
    const { customPropertyValueByKey } = useCustomProperties(getCustomProperties);
    const campaignsTable = customPropertyValueByKey.campaignsTable;
    const brandsTable = customPropertyValueByKey.brandsTable;
    const campaigns = useRecords(campaignsTable);
    const brands = useRecords(brandsTable);
    const [saving, setSaving] = useState(false);

    // Read status options dynamically from Airtable field schema
    const statusChoices = useMemo(
        () => getSelectChoices(campaignsTable, FIELDS.STATUS),
        [campaignsTable]
    );

    // Generic field updater with permission checks
    const updateField = useCallback(async (record, fieldId, value) => {
        if (!campaignsTable) return;
        const check = campaignsTable.checkPermissionsForUpdateRecord(record, { [fieldId]: undefined });
        if (!check.hasPermission) {
            alert(check.reasonDisplayString);
            return;
        }
        setSaving(true);
        try {
            await campaignsTable.updateRecordAsync(record, { [fieldId]: value });
        } catch (err) {
            alert('Failed to save: ' + err.message);
        } finally {
            setSaving(false);
        }
    }, [campaignsTable]);

    if (!campaigns) return <div>Loading...</div>;

    const record = campaigns[0];
    if (!record) return <div>No records found.</div>;

    const name = getFieldString(record, FIELDS.NAME);
    const status = getFieldString(record, FIELDS.STATUS);
    const description = getFieldString(record, FIELDS.DESCRIPTION);
    const brandLinks = getField(record, FIELDS.BRANDS);
    const image = getField(record, FIELDS.IMAGE);
    const statusStyle = statusChoices.find(c => c.name === status)?.styles;

    return (
        <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <h1>{name}</h1>
                <Badge text={status} colors={statusStyle} />
            </div>

            <AttachmentPreview attachments={image} className="w-full max-h-64 mb-4" />

            <LinkedSection
                label="Brands"
                value={brandLinks}
                records={brands}
                onExpand={expandRecord}
            />

            <EditableSection
                label="Description"
                value={description}
                onSave={
                    isWritableTextField(campaignsTable, FIELDS.DESCRIPTION)
                        ? (val => updateField(record, FIELDS.DESCRIPTION, val || null))
                        : null
                }
                disabled={saving}
            />
        </div>
    );
}

initializeBlock({ interface: () => <App /> });
