import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BASE_FLOOR_CLEAR_TIME_MS,
  GameState,
  Resources,
  createInitialGameState,
  getFloorInfo,
  getFloorRewards,
  getPartyPower,
} from '@/models/game';

export interface GameStore extends GameState {
  levelUpDemon: (id: string) => void;
  togglePartyStatus: (id: string) => void;
  buyUpgrade: (type: keyof GameState['demonLordUpgrades']) => void;
  processTime: (elapsedMs: number) => void;
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
        set((state) => ({
          ...state,
          demons: state.demons.map((d) =>
            d.id === id ? { ...d, isInParty: !d.isInParty } : d,
          ),
        }));
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

      processTime: (elapsedMs: number) => {
        if (elapsedMs <= 0) return;

        set((state) => {
          let { currentFloor, maxReachedFloor, resources } = state;
          const startFloor = currentFloor;
          const partyPower = getPartyPower(state.demons, state.demonLordUpgrades);

          if (partyPower <= 0) {
            return {
              ...state,
              lastActiveAt: Date.now(),
            };
          }

          let remainingMs = elapsedMs;
          let safety = 0;

          while (remainingMs >= BASE_FLOOR_CLEAR_TIME_MS && safety < 1000) {
            const floorInfo = getFloorInfo(currentFloor);
            if (partyPower < floorInfo.difficulty) break;

            remainingMs -= BASE_FLOOR_CLEAR_TIME_MS;
            const rewards = getFloorRewards(floorInfo, state.demonLordUpgrades);
            resources = applyRewards(resources, rewards);
            currentFloor += 1;
            if (currentFloor > maxReachedFloor) {
              maxReachedFloor = currentFloor;
            }
            safety += 1;
          }

          if (currentFloor === startFloor && remainingMs === elapsedMs) {
            return {
              ...state,
              lastActiveAt: Date.now(),
            };
          }

          return {
            ...state,
            currentFloor,
            maxReachedFloor,
            resources,
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
            get().processTime(elapsed);
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
        lastActiveAt: state.lastActiveAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const now = Date.now();
        if (state.lastActiveAt != null) {
          const elapsed = now - state.lastActiveAt;
          if (elapsed > 0) {
            // After rehydrate, run offline progress once
            useGameStore.getState().processTime(elapsed);
          }
        }
        useGameStore.setState({ lastActiveAt: now });
      },
    },
  ),
);
