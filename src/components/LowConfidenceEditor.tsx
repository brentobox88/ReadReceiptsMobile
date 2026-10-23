import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import api from '../api/api';

const FIELDS = ['merchant_name', 'total_amount', 'transaction_date', 'tax_amount'] as const;
type Field = typeof FIELDS[number];
const NUMERIC = new Set<Field>(['total_amount', 'tax_amount']);

type Receipt = {
  id: string;
  confidence_score: number;
  merchant_name?: string | null;
  total_amount?: number | null;
  transaction_date?: string | null;
  tax_amount?: number | null;
};

export default function LowConfidenceEditor({ receipt }: { receipt: Receipt }) {
  const [edits, setEdits] = useState<Partial<Record<Field, string>>>({});
  const [saving, setSaving] = useState(false);

  if ((receipt.confidence_score ?? 1) >= 0.8) return null;

  const save = async () => {
    setSaving(true);
    try {
      for (const [field, value] of Object.entries(edits)) {
        const f = field as Field;
        const original = receipt[f];
        if (original == null || String(original) === value) continue;
        const payload = NUMERIC.has(f) ? parseFloat(value) : value;
        if (NUMERIC.has(f) && isNaN(payload as number)) continue;
        await api.put(`/receipts/${receipt.id}`, { [f]: payload });
        await api.post(`/receipts/${receipt.id}/correction`, {
          field: f, original: String(original), corrected: value,
        });
      }
      setEdits({});
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Low confidence — please verify</Text>
      {FIELDS.map((f) => (
        <View key={f} style={styles.row}>
          <Text style={styles.label}>{f}</Text>
          <TextInput
            style={styles.input}
            defaultValue={String(receipt[f] ?? '')}
            onChangeText={(v) => setEdits((p) => ({ ...p, [f]: v }))}
            keyboardType={NUMERIC.has(f) ? 'decimal-pad' : 'default'}
          />
        </View>
      ))}
      <Button
        title={saving ? 'Saving…' : 'Save corrections'}
        onPress={save}
        disabled={saving || Object.keys(edits).length === 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#fff8e1', borderRadius: 8, margin: 12 },
  title: { fontWeight: '600', marginBottom: 8 },
  row: { marginBottom: 8 },
  label: { fontSize: 12, color: '#666' },
  input: { borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 4 },
});
