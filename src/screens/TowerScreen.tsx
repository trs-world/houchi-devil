import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { getFloorInfo, getPartyPower } from '@/models/game';

export default function TowerScreen() {
  const { currentFloor, maxReachedFloor, demons, demonLordUpgrades, resources, touch } =
    useGameStore();

  const floorInfo = getFloorInfo(currentFloor);
  const partyPower = getPartyPower(demons, demonLordUpgrades);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tower of Demonlord</Text>
      <Text style={styles.subtitle}>The Demon Lord slumbers on the throne...</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Current Floor</Text>
        <Text style={styles.value}>{currentFloor}</Text>
        <Text style={styles.label}>Max Reached</Text>
        <Text style={styles.value}>{maxReachedFloor}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Floor Difficulty</Text>
        <Text style={styles.value}>{floorInfo.difficulty.toLocaleString()}</Text>

        <Text style={styles.label}>Party Power</Text>
        <Text style={[styles.value, partyPower >= floorInfo.difficulty && styles.valueGood]}>
          {Math.floor(partyPower).toLocaleString()}
        </Text>

        <Text style={styles.small}>
          Rewards: {floorInfo.baseRewardSouls} souls, {floorInfo.baseRewardGems} gems
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Resources</Text>
        <Text style={styles.value}>Souls: {resources.souls.toLocaleString()}</Text>
        <Text style={styles.value}>Gems: {resources.gems.toLocaleString()}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={touch}>
        <Text style={styles.buttonText}>Sync Idle Progress</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>The party climbs the tower even when you are away.</Text>
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
    fontSize: 24,
    fontWeight: '700',
    color: '#FDE7FF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#b4a0c8',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#120a1f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2c1744',
  },
  label: {
    fontSize: 12,
    color: '#c7b7dd',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  valueGood: {
    color: '#8fff9b',
  },
  small: {
    fontSize: 12,
    color: '#8f7cad',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#e945ff',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  buttonText: {
    color: '#1b071f',
    fontWeight: '700',
    fontSize: 16,
  },
  hint: {
    marginTop: 12,
    fontSize: 12,
    color: '#7b6c93',
    textAlign: 'center',
  },
});
