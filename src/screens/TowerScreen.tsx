import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ImageBackground } from 'react-native';
import { Video } from 'expo-av';
import { useGameStore } from '@/store/gameStore';
import { getFloorInfo, getPartyPower } from '@/models/game';

const RunnerVideo: React.FC<{ source: any }> = ({ source }) => {
  const videoRef = React.useRef<Video | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const play = async () => {
      if (!videoRef.current || cancelled) return;
      try {
        await videoRef.current.setPositionAsync(0);
        await videoRef.current.playAsync();
      } catch {
      }
    };

    play();

    return () => {
      cancelled = true;
    };
  }, [source]);

  return (
    <Video
      ref={videoRef}
      source={source}
      style={styles.runnerVideo}
      resizeMode="contain"
      isLooping
      shouldPlay
      isMuted
    />
  );
};

const RunnerSprite: React.FC<{ frames: any[]; fps?: number }> = ({ frames, fps = 6 }) => {
  const [frameIndex, setFrameIndex] = React.useState(0);

  React.useEffect(() => {
    if (!frames || frames.length === 0) return;

    const intervalMs = 1000 / fps;
    const id = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, intervalMs);

    return () => {
      clearInterval(id);
    };
  }, [frames, fps]);

  if (!frames || frames.length === 0) return null;

  return (
    <Image
      source={frames[frameIndex]}
      style={styles.runnerVideo}
      resizeMode="contain"
    />
  );
};

export default function TowerScreen() {
  const { currentFloor, maxReachedFloor, demons, demonLordUpgrades, resources, touch } =
    useGameStore();

  const floorInfo = getFloorInfo(currentFloor);
  const partyPower = getPartyPower(demons, demonLordUpgrades);
  const progress = Math.max(0, Math.min(1, partyPower / floorInfo.difficulty || 0));

  const movingVideoById: Record<string, any> = React.useMemo(
    () => ({
      // Crimson-imp はスプライトで表現するため、動画は他キャラのみで使用
      'orc-tank': require('../../assets/moving/Gate-Orc.mp4'),
      'witch-support': require('../../assets/moving/Void-Witch.mp4'),
      'goblin-farmer': require('../../assets/moving/Greedy-Goblin.mp4'),
    }),
    [],
  );

  const movingSpritesById: Record<string, any[]> = React.useMemo(
    () => ({
      'imp-attacker': [
        require('../../assets/moving/Crimson-imp-1.png'),
        require('../../assets/moving/Crimson-imp-2.png'),
        require('../../assets/moving/Crimson-imp-3.png'),
        require('../../assets/moving/Crimson-imp-4.png'),
      ],
      'orc-tank': [
        require('../../assets/moving/Gate-Orc-1.png'),
        require('../../assets/moving/Gate-Orc-2.png'),
        require('../../assets/moving/Gate-Orc-3.png'),
        require('../../assets/moving/Gate-Orc-4.png'),
      ],
      'witch-support': [
        require('../../assets/moving/Void-Witch-1.png'),
        require('../../assets/moving/Void-Witch-2.png'),
        require('../../assets/moving/Void-Witch-3.png'),
        require('../../assets/moving/Void-Witch-4.png'),
      ],
      'goblin-farmer': [
        require('../../assets/moving/Greedy-Goblin-1.png'),
        require('../../assets/moving/Greedy-Goblin-2.png'),
        require('../../assets/moving/Greedy-Goblin-3.png'),
        require('../../assets/moving/Greedy-Goblin-4.png'),
      ],
    }),
    [],
  );

  const partyMovingDemons = React.useMemo(
    () =>
      demons
        .filter((d) =>
          d.isInParty && (movingVideoById[d.id] || movingSpritesById[d.id]),
        )
        .slice(0, 4),
    [demons, movingVideoById, movingSpritesById],
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Tower of Demonlord</Text>
      <Text style={styles.subtitle}>The Demon Lord slumbers on the throne...</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Current Floor</Text>
        <Text style={styles.value}>{currentFloor}</Text>
        <Text style={styles.label}>Max Reached</Text>
        <Text style={styles.value}>{maxReachedFloor}</Text>
      </View>

      <View style={styles.battleCard}>
        <Text style={styles.label}>Expedition</Text>
        <View style={styles.battleRow}>
          <View style={styles.partyIcon}>
            <Image
              source={require('../../assets/party.png')}
              style={styles.partyImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, progress * 100)}%` },
              ]}
            />
          </View>

          <Image
            source={require('../../assets/silhouette.png')}
            style={styles.bossImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.small}>
          {Math.floor(progress * 100)}% ready to clash with the floor boss.
        </Text>
      </View>

      <View style={styles.runnerCard}>
        <ImageBackground
          source={require('../../assets/moving/background.png')}
          style={styles.runnerTrack}
          imageStyle={styles.runnerBackground}
        >
          {partyMovingDemons.length > 0 && (
            <View style={styles.runnerRow}>
              {partyMovingDemons.map((demon) => (
                <View key={demon.id} style={styles.runnerVideoContainer}>
                  {movingSpritesById[demon.id] ? (
                    <RunnerSprite frames={movingSpritesById[demon.id]} />
                  ) : (
                    <RunnerVideo source={movingVideoById[demon.id]} />
                  )}
                </View>
              ))}
            </View>
          )}
        </ImageBackground>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05030A',
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  runnerCard: {
    backgroundColor: '#120a1f',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2c1744',
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
  battleCard: {
    backgroundColor: '#120a1f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3b204f',
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
  battleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  partyIcon: {
    marginRight: 12,
  },
  partyImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  runnerTrack: {
    marginTop: 5,
    height: 80,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  runnerBackground: {
    borderRadius: 18,
  },
  runnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  runnerVideoContainer: {
    width: 64,
    height: 64,
    marginLeft: 4,
    marginRight: 4,
  },
  runnerVideo: {
    width: '100%',
    height: '100%',
  },
  goblinRunnerImage: {
    transform: [{ scale: 0.3 }],
  },
  progressBar: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#2a183d',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#e945ff',
  },
  bossImage: {
    width: 68,
    height: 68,
    marginLeft: 12,
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
