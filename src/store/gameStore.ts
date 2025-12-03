import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
  BASE_FLOOR_CLEAR_TIME_MS,
  OFFLINE_FLOOR_CLEAR_TIME_MS,
  GameState,
  Resources,
  createInitialGameState,
  createDefaultDemons,
  getFloorInfo,
  getFloorRewards,
  getPartyPower,
} from '@/models/game';

export interface GameStore extends GameState {
  levelUpDemon: (id: string) => void;
  togglePartyStatus: (id: string) => void;
  buyUpgrade: (type: keyof GameState['demonLordUpgrades']) => void;
  processTime: (elapsedMs: number, mode?: 'online' | 'offline') => void;
  touch: () => void;
  resetGame: () => void;
}

const SOUL_COST_BASE = 10;
const SOUL_COST_GROWTH = 1.35;

const GEM_UPGRADE_BASE_COST = 20;
const GEM_UPGRADE_GROWTH = 2.0;

function getDemonLevelCost(level: number): number {
  return Math.floor(SOUL_COST_BASE * Math.pow(SOUL_COST_GROWTH, level - 1));
}

function getUpgradeCost(multiplier: number): number {
  const steps = (multiplier - 1) / 0.05;
  return Math.floor(GEM_UPGRADE_BASE_COST * Math.pow(GEM_UPGRADE_GROWTH, steps));
}

function applyRewards(resources: Resources, rewards: Resources): Resources {
  return {
    souls: resources.souls + rewards.souls,
    gems: resources.gems + rewards.gems,
  };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...createInitialGameState(),

      levelUpDemon: (id: string) => {
        set((state) => {
          const demon = state.demons.find((d) => d.id === id);
          if (!demon) return state;

          const cost = getDemonLevelCost(demon.level);
          if (state.resources.souls < cost) return state;

          return {
            ...state,
            demons: state.demons.map((d) =>
              d.id === id ? { ...d, level: d.level + 1 } : d,
            ),
            resources: {
              ...state.resources,
              souls: state.resources.souls - cost,
            },
          };
        });
      },

      togglePartyStatus: (id: string) => {
        set((state) => {
          const target = state.demons.find((d) => d.id === id);
          if (!target) return state;

          // Enforce maximum party size of 4 when trying to add a demon
          if (!target.isInParty) {
            const partyCount = state.demons.filter((d) => d.isInParty).length;
            if (partyCount >= 4) {
              return state;
            }
          }

          return {
            ...state,
            demons: state.demons.map((d) =>
              d.id === id ? { ...d, isInParty: !d.isInParty } : d,
            ),
          };
        });
      },

      buyUpgrade: (type) => {
        set((state) => {
          const current = state.demonLordUpgrades[type];
          const cost = getUpgradeCost(current);
          if (state.resources.gems < cost) return state;

          return {
            ...state,
            demonLordUpgrades: {
              ...state.demonLordUpgrades,
              [type]: +(current + 0.05).toFixed(2),
            },
            resources: {
              ...state.resources,
              gems: state.resources.gems - cost,
            },
          };
        });
      },

      processTime: (elapsedMs: number, mode: 'online' | 'offline' = 'online') => {
        if (elapsedMs <= 0) return;

        set((state) => {
          let { currentFloor, maxReachedFloor, resources, pendingBattleMs } = state;
          const startFloor = currentFloor;
          const partyPower = getPartyPower(state.demons, state.demonLordUpgrades);

          const clearTimeMs = mode === 'offline' ? OFFLINE_FLOOR_CLEAR_TIME_MS : BASE_FLOOR_CLEAR_TIME_MS;

          let remainingMs = pendingBattleMs + elapsedMs;
          let safety = 0;

          while (remainingMs >= clearTimeMs && safety < 1000) {
            const floorInfo = getFloorInfo(currentFloor);
            const baseRewards = getFloorRewards(floorInfo, state.demonLordUpgrades);

            remainingMs -= clearTimeMs;

            if (partyPower >= floorInfo.difficulty) {
              // 勝てる場合: フロアを進めてフル報酬
              resources = applyRewards(resources, baseRewards);
              currentFloor += 1;
              if (currentFloor > maxReachedFloor) {
                maxReachedFloor = currentFloor;
              }
            } else if (partyPower > 0) {
              // 勝てない場合: 30%効率で報酬のみ獲得（フロアは進まない）
              const scaledRewards: Resources = {
                souls: Math.floor(baseRewards.souls * 0.3),
                gems: Math.floor(baseRewards.gems * 0.3),
              };
              resources = applyRewards(resources, scaledRewards);
            }

            safety += 1;
          }

          return {
            ...state,
            currentFloor,
            maxReachedFloor,
            resources,
            pendingBattleMs: remainingMs,
            lastActiveAt: Date.now(),
          };
        });
      },

      touch: () => {
        const now = Date.now();
        const last = get().lastActiveAt;
        if (last != null) {
          const elapsed = now - last;
          if (elapsed > 0) {
            get().processTime(elapsed, 'offline');
            return;
          }
        }
        set({ lastActiveAt: now });
      },

      resetGame: () => {
        set(createInitialGameState());
      },
    }),
    {
      name: 'tower-of-demonlord-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        demons: state.demons,
        currentFloor: state.currentFloor,
        maxReachedFloor: state.maxReachedFloor,
        resources: state.resources,
        demonLordUpgrades: state.demonLordUpgrades,
        pendingBattleMs: state.pendingBattleMs,
        lastActiveAt: state.lastActiveAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Merge newly added demons into existing saves based on id
        const defaultDemons = createDefaultDemons();
        const existingIds = new Set(state.demons.map((d) => d.id));
        const missingDemons = defaultDemons.filter((d) => !existingIds.has(d.id));
        if (missingDemons.length > 0) {
          useGameStore.setState((prev) => ({
            ...prev,
            demons: [...prev.demons, ...missingDemons],
          }));
        }
        const now = Date.now();
        if (state.lastActiveAt != null) {
          const elapsed = now - state.lastActiveAt;
          if (elapsed > 0) {
            // After rehydrate, run offline progress once (offline speed)
            const beforeResources = state.resources;
            useGameStore.getState().processTime(elapsed, 'offline');

            // Only notify if the player was away for at least 1 minute
            if (elapsed >= 300000) {
              const afterResources = useGameStore.getState().resources;
              const gainedSouls = Math.max(0, afterResources.souls - beforeResources.souls);
              const gainedGems = Math.max(0, afterResources.gems - beforeResources.gems);

              if (gainedSouls > 0 || gainedGems > 0) {
                Notifications.scheduleNotificationAsync({
                  content: {
                    title: 'Your demons brought you rewards.',
                    body: `While you were away, your demons have been working for you.\nSouls: ${gainedSouls}\nGems: ${gainedGems}`,
                  },
                  trigger: null,
                }).catch(() => {
                  // ignore notification errors
                });
              }
            }
          }
        }
        useGameStore.setState({ lastActiveAt: now });
      },
    },
  ),
);
