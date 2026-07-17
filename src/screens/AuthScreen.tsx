// src/screens/AuthScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// TEMPORARY: Mock auth for development
const mockSignIn = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    user: {
      uid: 'mock-user-123',
      displayName: 'Test User',
      email: 'test@readreceipts.com',
      photoURL: null,
    }
  };
};

interface AuthScreenProps {
  onAuthSuccess?: (user: any) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const result = await mockSignIn();
      
      // Call the onAuthSuccess callback first
      if (onAuthSuccess) {
        onAuthSuccess(result.user);
      }
      
      // Show welcome alert
      Alert.alert('Welcome!', 'Welcome ' + result.user.displayName + '!');
      
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'An error occurred.');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="receipt" size={60} color="#4CAF50" />
        </View>
        <Text style={styles.title}>ReadReceipts</Text>
        <Text style={styles.subtitle}>Scan, manage, and export your receipts</Text>
        <View style={styles.mockBadge}>
          <Text style={styles.mockBadgeText}>⚡ Dev Mode - Mock Auth</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="logo-google" size={24} color="#fff" />
            <Text style={styles.buttonText}>Sign in with Google (Mock)</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.termsText}>
        By signing in, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  mockBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  mockBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  termsText: {
    marginTop: 16,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default AuthScreen;
