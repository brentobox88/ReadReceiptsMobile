import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getBatchProgress,
  getBatchReceipts,
  isBatchComplete,
  BatchProgress,
  BatchReceipt,
} from '../api/batches';

const POLL_INTERVAL_MS = 5000; // 5 seconds

const BatchProgressScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { batchId } = route.params;

  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [receipts, setReceipts] = useState<BatchReceipt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const poll = async () => {
      try {
        const [p, r] = await Promise.all([
          getBatchProgress(batchId),
          getBatchReceipts(batchId),
        ]);
        if (!isMounted.current) return;

        setProgress(p);
        setReceipts(r.receipts || []);
        setError(null);

        if (!isBatchComplete(p.status)) {
          setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (e: any) {
        if (!isMounted.current) return;
        setError(e.message || 'Could not fetch progress');
        // keep retrying
        setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    poll();

    return () => {
      isMounted.current = false;
    };
  }, [batchId]);

  const handleClose = () => {
    navigation.navigate('MainTabs', { screen: 'Receipts' });
  };

  const isDone = progress ? isBatchComplete(progress.status) : false;
  const percent = progress?.progress_percent ?? 0;
  const processed = progress?.processed_files ?? 0;
  const failed = progress?.failed_files ?? 0;
  const total = progress?.total_files ?? 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#2196F3']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {isDone ? 'Batch complete' : 'Processing receipts…'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {!progress && !error && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Starting…</Text>
          </View>
        )}

        {progress && (
          <View style={styles.progressCard}>
            <View style={styles.progressBarTrack}>
              <View
                style={[styles.progressBarFill, { width: `${percent}%` }]}
              />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{processed}</Text>
                <Text style={styles.statLabel}>Done</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{failed}</Text>
                <Text style={styles.statLabel}>Failed</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>

            {!isDone && (
              <Text style={styles.note}>
                You can leave this screen — processing continues in the background.
              </Text>
            )}
          </View>
        )}

        {receipts.length > 0 && (
          <View style={styles.receiptsList}>
            <Text style={styles.sectionTitle}>Receipts</Text>
            {receipts.map((r) => (
              <View key={r.id} style={styles.receiptRow}>
                <View style={styles.receiptStatus}>
                  {r.status === 'completed' && (
                    <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
                  )}
                  {r.status === 'processing' && (
                    <ActivityIndicator size="small" color="#2196F3" />
                  )}
                  {r.status === 'queued' && (
                    <Ionicons name="time-outline" size={22} color="#999" />
                  )}
                  {r.status === 'failed' && (
                    <Ionicons name="close-circle" size={22} color="#F44336" />
                  )}
                </View>
                <View style={styles.receiptInfo}>
                  <Text style={styles.receiptMerchant} numberOfLines={1}>
                    {r.merchant || r.filename}
                  </Text>
                  <Text style={styles.receiptMeta}>
                    {r.total ? `$${r.total.toFixed(2)}` : '—'} · {r.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </ScrollView>

      {isDone && (
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>View Receipts</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: { alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, padding: 16 },
  loadingContainer: { alignItems: 'center', marginTop: 40 },
  loadingText: { marginTop: 12, color: '#666' },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: '#4CAF50' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 4 },
  note: {
    marginTop: 16,
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  receiptsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  receiptStatus: { width: 30, alignItems: 'center' },
  receiptInfo: { flex: 1, marginLeft: 8 },
  receiptMerchant: { fontSize: 15, color: '#333' },
  receiptMeta: { fontSize: 12, color: '#999', marginTop: 2 },
  errorText: { color: '#F44336', textAlign: 'center', marginTop: 16 },
  closeButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});

export default BatchProgressScreen;