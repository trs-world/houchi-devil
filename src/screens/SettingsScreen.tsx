import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { Demon } from '@/models/game';

const zukanImages: Record<string, any> = {
  'Crimson Imp': require('../../assets/moving/Crimson-imp-1.png'),
  'Gate Orc': require('../../assets/moving/Gate-Orc-1.png'),
  'Void Witch': require('../../assets/moving/Void-Witch-1.png'),
  'Greedy Goblin': require('../../assets/moving/Greedy-Goblin-1.png'),
  'Hell-Hound': require('../../assets/moving/Hell-Hound-1.png'),
  'Void-Eye': require('../../assets/moving/Void-Eye-1.png'),
  'Stone-Golem': require('../../assets/moving/Stone-Golem-1.png'),
  Litch: require('../../assets/moving/Litch-1.png'),
};

export default function SettingsScreen() {
  const demons = useGameStore((s) => s.demons);

  const renderItem = ({ item }: { item: Demon }) => {
    const source = zukanImages[item.name];

    return (
      <View style={styles.gridItem}>
        {source && (
          <Image source={source} style={styles.demonImage} resizeMode="contain" />
        )}
        <Text style={styles.demonName} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>図鑑</Text>
      <Text style={styles.subtitle}>仲間になった悪魔たちを眺めることができます。</Text>

      <FlatList
        data={demons}
        keyExtractor={(item) => item.id}
        numColumns={4}
        renderItem={renderItem}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05030A',
    paddingHorizontal: 12,
    paddingTop: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FDE7FF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#b4a0c8',
    textAlign: 'center',
    marginBottom: 16,
  },
  grid: {
    paddingBottom: 24,
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  demonImage: {
    width: 56,
    height: 56,
    marginBottom: 4,
    borderRadius: 8,
  },
  demonName: {
    fontSize: 10,
    color: '#fef5ff',
    textAlign: 'center',
  },
});
