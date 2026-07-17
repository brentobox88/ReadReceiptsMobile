// src/components/CategorySelector.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Category {
  id: string;
  label: string;
  icon: string;
}

const CATEGORIES: Category[] = [
  { id: 'food', label: 'Food & Dining', icon: 'restaurant' },
  { id: 'transport', label: 'Transport', icon: 'car' },
  { id: 'shopping', label: 'Shopping', icon: 'cart' },
  { id: 'utilities', label: 'Utilities', icon: 'flash' },
  { id: 'entertainment', label: 'Entertainment', icon: 'film' },
  { id: 'health', label: 'Health', icon: 'medkit' },
  { id: 'education', label: 'Education', icon: 'book' },
  { id: 'travel', label: 'Travel', icon: 'airplane' },
  { id: 'office', label: 'Office', icon: 'business' },
  { id: 'other', label: 'Other', icon: 'cube' },
];

interface CategorySelectorProps {
  visible: boolean;
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string) => void;
  onClose: () => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  visible,
  selectedCategory,
  onSelectCategory,
  onClose,
}) => {
  const renderCategory = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory === item.id;
    return (
      <TouchableOpacity
        style={[styles.categoryItem, isSelected && styles.categorySelected]}
        onPress={() => {
          onSelectCategory(item.id);
          onClose();
        }}
      >
        <View style={styles.categoryContent}>
          <Text style={styles.categoryIcon}>{item.icon}</Text>
          <Text style={styles.categoryLabel}>{item.label}</Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Category</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  list: {
    padding: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginVertical: 4,
  },
  categorySelected: {
    backgroundColor: '#E8F5E9',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
    textAlign: 'center',
  },
  categoryLabel: {
    fontSize: 16,
    color: '#333',
  },
});

export default CategorySelector;
