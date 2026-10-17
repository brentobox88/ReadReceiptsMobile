// src/components/FilterSheet.tsx
import { useCallback, useMemo, useState, RefObject } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { ReceiptFilters, SortOption, CATEGORIES, DEFAULT_FILTERS } from '../utils/filters';

interface Props {
  filters: ReceiptFilters;
  onApply: (f: ReceiptFilters) => void;
  sheetRef: RefObject<BottomSheetModal | null>;
}

const SORTS: { key: SortOption; label: string }[] = [
  { key: 'date_desc',    label: 'Newest' },
  { key: 'date_asc',     label: 'Oldest' },
  { key: 'amount_desc',  label: 'Highest amount' },
  { key: 'amount_asc',   label: 'Lowest amount' },
  { key: 'merchant_asc', label: 'Merchant A-Z' },
];

export function FilterSheet({ filters, onApply, sheetRef }: Props) {
  const snapPoints = useMemo(() => [500], []);
  const [draft, setDraft] = useState<ReceiptFilters>(filters);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#ccc' }}
    >
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>Filters</Text>

        <Text style={styles.label}>Sort by</Text>
        <View style={styles.row}>
          {SORTS.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => setDraft({ ...draft, sort: s.key })}
              style={[styles.chip, draft.sort === s.key && styles.chipActive]}
            >
              <Text style={draft.sort === s.key ? styles.chipTextActive : styles.chipText}>{s.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Date range</Text>
        <View style={styles.row}>
          <DateField placeholder="From" value={draft.startDate} onChange={(v) => setDraft({ ...draft, startDate: v })} />
          <DateField placeholder="To" value={draft.endDate} onChange={(v) => setDraft({ ...draft, endDate: v })} />
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.row}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setDraft({ ...draft, category: draft.category === c ? null : c })}
              style={[styles.chip, draft.category === c && styles.chipActive]}
            >
              <Text style={draft.category === c ? styles.chipTextActive : styles.chipText}>{c}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable onPress={() => setDraft(DEFAULT_FILTERS)} style={[styles.actionBtn, styles.resetBtn]}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
          <Pressable
            onPress={() => { onApply(draft); sheetRef.current?.dismiss(); }}
            style={[styles.actionBtn, styles.applyBtn]}
          >
            <Text style={styles.applyText}>Apply</Text>
          </Pressable>
        </View>
      </ScrollView>
    </BottomSheetModal>
  );
}

function DateField({ placeholder, value, onChange }: { placeholder: string; value: string | null; onChange: (v: string | null) => void; }) {
  return (
    <Pressable
      style={styles.dateField}
      onPress={() => {
        const input = prompt(`${placeholder} (YYYY-MM-DD)`);
        if (input === null) return;
        onChange(input.trim() || null);
      }}
    >
      <Text style={value ? styles.dateText : styles.datePlaceholder}>{value || placeholder}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#f0f0f0' },
  chipActive: { backgroundColor: '#111' },
  chipText: { color: '#111' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  dateField: { flex: 1, minWidth: 120, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  dateText: { color: '#111' },
  datePlaceholder: { color: '#999' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 32 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  resetBtn: { backgroundColor: '#f0f0f0' },
  resetText: { color: '#111', fontWeight: '600' },
  applyBtn: { backgroundColor: '#111' },
  applyText: { color: '#fff', fontWeight: '600' },
});