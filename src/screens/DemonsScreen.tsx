import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
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

export default function DemonsScreen() {
  const demons = useGameStore((s) => s.demons);
  const resources = useGameStore((s) => s.resources);
  const levelUpDemon = useGameStore((s) => s.levelUpDemon);
  const togglePartyStatus = useGameStore((s) => s.togglePartyStatus);

  const renderItem = ({ item }: { item: Demon }) => {
    const soulCost = Math.floor(10 * Math.pow(1.35, item.level - 1));
    const inParty = item.isInParty;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.demonName}>{item.name}</Text>
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

      <View style={styles.resourcesRow}>
        <Text style={styles.resource}>Souls: {resources.souls.toLocaleString()}</Text>
        <Text style={styles.resource}>Gems: {resources.gems.toLocaleString()}</Text>
      </View>

      <FlatList
        data={demons}
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
  resourcesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resource: {
    fontSize: 13,
    color: '#e7dbff',
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 32,
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
  demonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
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
