// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const ProfileScreen = () => {
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [receiptCount, setReceiptCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [userName, setUserName] = useState('Receipt User');
  const [userEmail, setUserEmail] = useState('user@receipts.app');

  const API_URL = 'http://192.168.2.242:8000';

  // Mock user data for development
  useEffect(() => {
    // In production, this would come from Firebase auth
    setUserName('Test User');
    setUserEmail('test@readreceipts.com');
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(API_URL + '/receipts');
      const data = await response.json();
      if (data.receipts) {
        setReceiptCount(data.receipts.length);
        const total = data.receipts.reduce((sum: number, r: any) => sum + (r.total_amount || 0), 0);
        setTotalSpent(total);
        const avg = data.receipts.reduce((sum: number, r: any) => sum + (r.confidence_score || 0), 0) / data.receipts.length || 0;
        setAvgConfidence(Math.round(avg * 100));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Signed Out', 'You have been signed out.');
          }
        }
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Data',
      'Are you sure you want to clear all receipt data? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => Alert.alert('Cleared', 'All data has been cleared.') },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About ReadReceipts',
      'ReadReceipts v2.0\n\nPowered by Google Document AI\nYour receipt scanning and management solution.\n\nScan, organize, and export your receipts with ease.'
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color="#4CAF50" />
        </View>
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.email}>{userEmail}</Text>
        <View style={styles.mockBadge}>
          <Text style={styles.mockBadgeText}>⚡ Dev Mode</Text>
        </View>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{receiptCount}</Text>
          <Text style={styles.statLabel}>Total Receipts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}></Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{avgConfidence}%</Text>
          <Text style={styles.statLabel}>Avg Confidence</Text>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={24} color="#666" />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="cloud-outline" size={24} color="#666" />
            <Text style={styles.settingText}>Auto Backup</Text>
          </View>
          <Switch
            value={autoBackup}
            onValueChange={setAutoBackup}
            trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
          />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>

        <TouchableOpacity style={styles.actionItem} onPress={() => Alert.alert('Export All', 'Exporting all receipts...')}>
          <Ionicons name="download-outline" size={24} color="#4CAF50" />
          <Text style={styles.actionText}>Export All Receipts</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" style={styles.actionArrow} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={handleClearData}>
          <Ionicons name="trash-outline" size={24} color="#F44336" />
          <Text style={[styles.actionText, styles.dangerText]}>Clear All Data</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" style={styles.actionArrow} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={handleAbout}>
          <Ionicons name="information-circle-outline" size={24} color="#4CAF50" />
          <Text style={styles.actionText}>About</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" style={styles.actionArrow} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionItem, styles.signOutItem]} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
          <Text style={[styles.actionText, styles.dangerText]}>Sign Out</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" style={styles.actionArrow} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>ReadReceipts v2.0</Text>
        <Text style={styles.footerSubtext}>Powered by Google Document AI</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  mockBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 6,
  },
  mockBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  signOutItem: {
    borderBottomWidth: 0,
  },
  actionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  dangerText: {
    color: '#F44336',
  },
  actionArrow: {
    marginLeft: 'auto',
  },
  footer: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#bbb',
    marginTop: 2,
  },
});

export default ProfileScreen;






