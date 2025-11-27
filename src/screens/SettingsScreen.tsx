import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useGameStore } from '@/store/gameStore';

export default function SettingsScreen() {
  const resetGame = useGameStore((s) => s.resetGame);
  const touch = useGameStore((s) => s.touch);

  const handleReset = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all progress? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetGame(),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Tower of Demonlord v1.0.0</Text>

      <View style={styles.card}>
        <Text style={styles.heading}>Idle Sync</Text>
        <Text style={styles.text}>
          If something looks out of sync, you can manually trigger an idle progress check.
        </Text>
        <TouchableOpacity style={styles.buttonSecondary} onPress={touch}>
          <Text style={styles.buttonSecondaryText}>Sync Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Danger Zone</Text>
        <Text style={styles.text}>
          This will wipe all demons, floors, and resources, and start from the beginning.
        </Text>
        <TouchableOpacity style={styles.buttonDanger} onPress={handleReset}>
          <Text style={styles.buttonDangerText}>Reset Game</Text>
        </TouchableOpacity>
      </View>
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
  card: {
    backgroundColor: '#120a1f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#241133',
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
  },
  text: {
    fontSize: 13,
    color: '#c7b7dd',
    marginBottom: 10,
  },
  buttonSecondary: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#2a163d',
  },
  buttonSecondaryText: {
    color: '#fef5ff',
    fontWeight: '600',
  },
  buttonDanger: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#b3261e',
    marginTop: 4,
  },
  buttonDangerText: {
    color: '#fff1f0',
    fontWeight: '700',
  },
});
