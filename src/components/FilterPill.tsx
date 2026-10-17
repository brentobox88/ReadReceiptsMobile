// src/components/FilterPill.tsx
import { Pressable, Text } from 'react-native';

interface Props {
  count: number;
  onPress: () => void;
}

export function FilterPill({ count, onPress }: Props) {
  const active = count > 0;
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: active ? '#111' : 'rgba(255,255,255,0.25)',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
        Filters{active ? ` · ${count}` : ''}
      </Text>
    </Pressable>
  );
}