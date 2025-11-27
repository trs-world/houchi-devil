export type DemonRole = 'attacker' | 'tank' | 'support' | 'farmer';

export interface Demon {
  id: string;
  name: string;
  level: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  role: DemonRole;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isInParty: boolean;
}

export interface Floor {
  floorNumber: number;
  difficulty: number; // required total power
  baseRewardSouls: number;
  baseRewardGems: number;
}

export interface DemonLordUpgrades {
  attackMultiplier: number;
  defenseMultiplier: number;
  soulGainMultiplier: number;
  gemGainMultiplier: number;
}

export interface Resources {
  souls: number;
  gems: number;
}

export interface GameState {
  demons: Demon[];
  currentFloor: number;
  maxReachedFloor: number;
  resources: Resources;
  demonLordUpgrades: DemonLordUpgrades;
  lastActiveAt: number | null; // timestamp for idle progress
}

export const BASE_FLOOR_CLEAR_TIME_MS = 10000; // 10s per floor when strong enough

export function getDemonPower(demon: Demon, upgrades: DemonLordUpgrades): number {
  const attack = demon.baseAttack * (1 + demon.level * 0.12) * upgrades.attackMultiplier;
  const defense = demon.baseDefense * (1 + demon.level * 0.1) * upgrades.defenseMultiplier;
  const speed = demon.baseSpeed * (1 + demon.level * 0.08);

  const roleBonus =
    demon.role === 'attacker'
      ? 1.2
      : demon.role === 'tank'
      ? 1.1
      : demon.role === 'support'
      ? 1.05
      : 1.0;

  const rarityBonus =
    demon.rarity === 'legendary'
      ? 2
      : demon.rarity === 'epic'
      ? 1.6
      : demon.rarity === 'rare'
      ? 1.25
      : 1.0;

  return (attack * 1.2 + defense * 0.8 + speed) * roleBonus * rarityBonus;
}

export function getPartyPower(demons: Demon[], upgrades: DemonLordUpgrades): number {
  return demons.filter((d) => d.isInParty).reduce((sum, d) => sum + getDemonPower(d, upgrades), 0);
}

export function getFloorInfo(floorNumber: number): Floor {
  const difficultyBase = 50;
  const difficultyGrowth = 1.18;
  const difficulty = Math.floor(difficultyBase * Math.pow(difficultyGrowth, floorNumber - 1));

  const baseRewardSouls = floorNumber * 10;
  const baseRewardGems = 1 + Math.floor(floorNumber / 5);

  return {
    floorNumber,
    difficulty,
    baseRewardSouls,
    baseRewardGems,
  };
}

export function getFloorRewards(
  floor: Floor,
  upgrades: DemonLordUpgrades,
): Resources {
  return {
    souls: Math.floor(floor.baseRewardSouls * upgrades.soulGainMultiplier),
    gems: Math.floor(floor.baseRewardGems * upgrades.gemGainMultiplier),
  };
}

export function createDefaultDemons(): Demon[] {
  return [
    {
      id: 'imp-attacker',
      name: 'Crimson Imp',
      level: 1,
      baseAttack: 12,
      baseDefense: 5,
      baseSpeed: 8,
      role: 'attacker',
      rarity: 'common',
      isInParty: true,
    },
    {
      id: 'orc-tank',
      name: 'Gate Orc',
      level: 1,
      baseAttack: 8,
      baseDefense: 14,
      baseSpeed: 5,
      role: 'tank',
      rarity: 'common',
      isInParty: true,
    },
    {
      id: 'witch-support',
      name: 'Void Witch',
      level: 1,
      baseAttack: 10,
      baseDefense: 7,
      baseSpeed: 9,
      role: 'support',
      rarity: 'rare',
      isInParty: true,
    },
    {
      id: 'goblin-farmer',
      name: 'Greedy Goblin',
      level: 1,
      baseAttack: 6,
      baseDefense: 4,
      baseSpeed: 12,
      role: 'farmer',
      rarity: 'common',
      isInParty: false,
    },
  ];
}

export function createInitialGameState(): GameState {
  return {
    demons: createDefaultDemons(),
    currentFloor: 1,
    maxReachedFloor: 1,
    resources: {
      souls: 0,
      gems: 0,
    },
    demonLordUpgrades: {
      attackMultiplier: 1,
      defenseMultiplier: 1,
      soulGainMultiplier: 1,
      gemGainMultiplier: 1,
    },
    lastActiveAt: Date.now(),
  };
}
