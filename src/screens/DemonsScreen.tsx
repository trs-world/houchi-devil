import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { Demon } from '@/models/game';

function getRarityColor(rarity: Demon['rarity']): string {
  switch (rarity) {
    case 'legendary':
      return '#ffd700';
    case 'epic':
      return '#c77dff';
    case 'rare':
      return '#4dabf7';
    default:
      return '#e0e0e0';
  }
}

const demonImages: Record<string, any> = {
  'imp-attacker': require('../../assets/Crimson-imp.png'),
  'orc-tank': require('../../assets/Gate-Orc.png'),
  'witch-support': require('../../assets/Void-Witch.png'),
  'goblin-farmer': require('../../assets/Greedy-Goblin.png'),
  'hell-hound-attacker': require('../../assets/Hell-Hound.png'),
  'void-eye-support': require('../../assets/Void-Eye.png'),
  'stone-golem-tank': require('../../assets/Stone-Golem.png'),
  'litch-support': require('../../assets/Litch.png'),
};

export default function DemonsScreen() {
  const demons = useGameStore((s) => s.demons);
  const resources = useGameStore((s) => s.resources);
  const levelUpDemon = useGameStore((s) => s.levelUpDemon);
  const togglePartyStatus = useGameStore((s) => s.togglePartyStatus);

  const [rarityFilter, setRarityFilter] = useState<
    'all' | 'common' | 'rare' | 'epic' | 'legendary'
  >('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredDemons =
    rarityFilter === 'all'
      ? demons
      : demons.filter((demon) => demon.rarity === rarityFilter);

  const renderItem = ({ item }: { item: Demon }) => {
    const soulCost = Math.floor(10 * Math.pow(1.35, item.level - 1));
    const inParty = item.isInParty;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.demonHeaderLeft}>
            <Image
              source={demonImages[item.id]}
              style={styles.demonImage}
              resizeMode="contain"
            />
            <Text style={styles.demonName}>{item.name}</Text>
          </View>
          <Text style={[styles.rarity, { color: getRarityColor(item.rarity) }]}>
            {item.rarity.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.stat}>Lv. {item.level}</Text>
        <Text style={styles.stat}>Role: {item.role}</Text>
        <Text style={styles.stat}>
          ATK {item.baseAttack} | DEF {item.baseDefense} | SPD {item.baseSpeed}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.button,
              resources.souls < soulCost && styles.buttonDisabled,
            ]}
            disabled={resources.souls < soulCost}
            onPress={() => levelUpDemon(item.id)}
          >
            <Text style={styles.buttonText}>Level Up ({soulCost} Souls)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              inParty ? styles.buttonSecondary : styles.buttonPrimary,
            ]}
            onPress={() => togglePartyStatus(item.id)}
          >
            <Text style={styles.buttonText}>{inParty ? 'Remove' : 'Add'} to Party</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demons & Party</Text>
      <Text style={styles.subtitle}>
        Spend souls to strengthen your minions and choose who joins the expedition.
      </Text>

      <View style={styles.topRow}>
        <View style={styles.resourcesColumn}>
          <Text style={styles.resource}>Souls: {resources.souls.toLocaleString()}</Text>
          <Text style={styles.resource}>Gems: {resources.gems.toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setIsFilterOpen((prev) => !prev)}
        >
          <Text style={styles.filterButtonText}>
            Filter{rarityFilter !== 'all' ? `: ${rarityFilter.toUpperCase()}` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {isFilterOpen && (
        <View style={styles.filterRow}>
          {[
            { key: 'all', label: 'All' },
            { key: 'common', label: 'Common' },
            { key: 'rare', label: 'Rare' },
            { key: 'epic', label: 'Epic' },
            { key: 'legendary', label: 'Legendary' },
          ].map((f) => {
            const isActive = rarityFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setRarityFilter(f.key as any)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <FlatList
        data={filteredDemons}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05030A',
    paddingHorizontal: 16,
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  resourcesColumn: {
    flexDirection: 'column',
    flex: 1,
  },
  resource: {
    fontSize: 13,
    color: '#e7dbff',
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 32,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3b203f',
    backgroundColor: '#120a1f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    color: '#fef5ff',
    fontSize: 12,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 6,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3b203f',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#120a1f',
  },
  filterChipActive: {
    backgroundColor: '#5f3dd9',
    borderColor: '#a78bfa',
  },
  filterChipText: {
    fontSize: 11,
    color: '#c7b7dd',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fef5ff',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#120a1f',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#241133',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  demonHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  demonImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 8,
  },
  rarity: {
    fontSize: 12,
    fontWeight: '700',
  },
  stat: {
    fontSize: 13,
    color: '#c7b7dd',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a163d',
  },
  buttonPrimary: {
    backgroundColor: '#5f3dd9',
  },
  buttonSecondary: {
    backgroundColor: '#8f2b5a',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fef5ff',
    fontSize: 12,
    fontWeight: '600',
  },
});
