import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const BUSINESSES = [
  { id: 'production', name: 'PRODUCTION', icon: 'film', color: '#4A90E2' },
  { id: 'design', name: 'DESIGN', icon: 'brush', color: '#9C27B0' },
  { id: 'general', name: 'GENERAL', icon: 'briefcase', color: '#FF9800' },
  { id: 'personal', name: 'PERSONAL', icon: 'person', color: '#4CAF50' },
];

export default function BusinessSelector({ selected, onSelect, onClose }) {
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Business</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.modalSubtitle}>Where should this receipt go?</Text>
        
        <ScrollView style={styles.businessList}>
          {BUSINESSES.map((business) => (
            <TouchableOpacity
              key={business.id}
              style={[
                styles.businessItem,
                selected === business.id && styles.businessItemSelected,
              ]}
              onPress={() => onSelect(business.id)}
            >
              <View style={[styles.businessIcon, { backgroundColor: business.color }]}>
                <Ionicons name={business.icon} size={24} color="#FFF" />
              </View>
              
              <View style={styles.businessInfo}>
                <Text style={styles.businessName}>{business.name}</Text>
                <Text style={styles.businessDescription}>
                  {business.id === 'production' && 'Film, photoshoots, production trips'}
                  {business.id === 'design' && 'Design tools, software, team expenses'}
                  {business.id === 'general' && 'Office, utilities, general business'}
                  {business.id === 'personal' && 'Personal expenses, non-deductible'}
                </Text>
              </View>
              
              {selected === business.id && (
                <Ionicons name="checkmark-circle" size={24} color={business.color} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TouchableOpacity style={styles.doneButton} onPress={onClose}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: height * 0.7,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  businessList: {
    maxHeight: 400,
  },
  businessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  businessItemSelected: {
    backgroundColor: '#F5F9FF',
  },
  businessIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  businessDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  doneButton: {
    backgroundColor: '#4A90E2',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
