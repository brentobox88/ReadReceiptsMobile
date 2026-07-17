// src/config/categories.ts
export const CATEGORIES = [
  { id: 'food', label: '🍔 Food & Dining', icon: 'restaurant' },
  { id: 'transport', label: '🚗 Transport', icon: 'car' },
  { id: 'shopping', label: '🛍️ Shopping', icon: 'cart' },
  { id: 'utilities', label: '💡 Utilities', icon: 'flash' },
  { id: 'entertainment', label: '🎬 Entertainment', icon: 'film' },
  { id: 'health', label: '🏥 Health', icon: 'medkit' },
  { id: 'education', label: '📚 Education', icon: 'book' },
  { id: 'travel', label: '✈️ Travel', icon: 'airplane' },
  { id: 'office', label: '🏢 Office', icon: 'business' },
  { id: 'other', label: '📦 Other', icon: 'cube' },
];

export const getCategoryById = (id: string) => {
  return CATEGORIES.find(c => c.id === id);
};

export const getCategoryLabel = (id: string) => {
  const category = getCategoryById(id);
  return category ? category.label : '📦 Other';
};
