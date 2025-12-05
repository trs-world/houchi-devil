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
  pendingBattleMs: number;
  lastActiveAt: number | null; // timestamp for idle progress
}

export const BASE_FLOOR_CLEAR_TIME_MS = 20000; // 20s per floor when strong enough (in-app)
export const OFFLINE_FLOOR_CLEAR_TIME_MS = 40000; // 40s per floor when app is closed

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
      id: 'udindindindun-attacker',
      name: 'ウディンディンディンドゥン',
      level: 1,
      baseAttack: 15,
      baseDefense: 7,
      baseSpeed: 11,
      role: 'attacker',
      rarity: 'rare',
      isInParty: false,
    },
    {
      id: 'espresso-signora-support',
      name: 'エスプレッソ・シニョーラ',
      level: 1,
      baseAttack: 11,
      baseDefense: 9,
      baseSpeed: 12,
      role: 'support',
      rarity: 'rare',
      isInParty: false,
    },
    {
      id: 'cappucina-ballerina-attacker',
      name: 'カプチーナ・バレリーナ',
      level: 1,
      baseAttack: 16,
      baseDefense: 7,
      baseSpeed: 13,
      role: 'attacker',
      rarity: 'legendary',
      isInParty: false,
    },
    {
      id: 'cappucino-assassino-attacker',
      name: 'カプチーノ・アサシーノ',
      level: 1,
      baseAttack: 17,
      baseDefense: 6,
      baseSpeed: 12,
      role: 'attacker',
      rarity: 'epic',
      isInParty: false,
    },
    {
      id: 'karkelkar-kurukuru-support',
      name: 'カーケルカール・クルクル',
      level: 1,
      baseAttack: 10,
      baseDefense: 10,
      baseSpeed: 9,
      role: 'support',
      rarity: 'rare',
      isInParty: false,
    },
    {
      id: 'strawberry-elephant-tank',
      name: 'ストロベリーエレファント',
      level: 1,
      baseAttack: 9,
      baseDefense: 17,
      baseSpeed: 5,
      role: 'tank',
      rarity: 'legendary',
      isInParty: false,
    },
    {
      id: 'tatatata-sahool-farmer',
      name: 'タタタタ・サフール',
      level: 1,
      baseAttack: 8,
      baseDefense: 6,
      baseSpeed: 14,
      role: 'farmer',
      rarity: 'common',
      isInParty: false,
    },
    {
      id: 'tetetete-sahool-farmer',
      name: 'テテテテ・サフール',
      level: 1,
      baseAttack: 9,
      baseDefense: 6,
      baseSpeed: 13,
      role: 'farmer',
      rarity: 'rare',
      isInParty: false,
    },
    {
      id: 'tuntuntun-sahool-farmer',
      name: 'トゥントゥントゥンサフール',
      level: 1,
      baseAttack: 10,
      baseDefense: 7,
      baseSpeed: 13,
      role: 'farmer',
      rarity: 'legendary',
      isInParty: false,
    },
    {
      id: 'trarara-tralalero-attacker',
      name: 'トラララ・トララレロ',
      level: 1,
      baseAttack: 14,
      baseDefense: 8,
      baseSpeed: 11,
      role: 'attacker',
      rarity: 'epic',
      isInParty: false,
    },
    {
      id: 'bulbaroni-rurirori-support',
      name: 'ブルバロ二・ルリロリ',
      level: 1,
      baseAttack: 11,
      baseDefense: 11,
      baseSpeed: 9,
      role: 'support',
      rarity: 'common',
      isInParty: false,
    },
    {
      id: 'bulbul-patapim-attacker',
      name: 'ブルブル・パタピム',
      level: 1,
      baseAttack: 15,
      baseDefense: 7,
      baseSpeed: 10,
      role: 'attacker',
      rarity: 'common',
      isInParty: false,
    },
    {
      id: 'bott-hotspot-support',
      name: 'ボット・ホットスポット',
      level: 1,
      baseAttack: 10,
      baseDefense: 9,
      baseSpeed: 12,
      role: 'support',
      rarity: 'common',
      isInParty: false,
    },
    {
      id: 'bombardiro-kurodiro-attacker',
      name: 'ボンバルディロ・クロコディロ',
      level: 1,
      baseAttack: 16,
      baseDefense: 8,
      baseSpeed: 9,
      role: 'attacker',
      rarity: 'epic',
      isInParty: false,
    },
    {
      id: 'frigo-camelo-attacker',
      name: 'フリゴ・カメロ',
      level: 1,
      baseAttack: 13,
      baseDefense: 9,
      baseSpeed: 11,
      role: 'attacker',
      rarity: 'rare',
      isInParty: false,
    },
    {
      id: 'motor-sahool-tank',
      name: 'モーター・サフール',
      level: 1,
      baseAttack: 11,
      baseDefense: 16,
      baseSpeed: 7,
      role: 'tank',
      rarity: 'rare',
      isInParty: false,
    },
    {
      id: 'chimpanzini-bananini-attacker',
      name: 'チンパンジー二・バナニーニ',
      level: 1,
      baseAttack: 14,
      baseDefense: 8,
      baseSpeed: 12,
      role: 'attacker',
      rarity: 'common',
      isInParty: false,
    },
    {
      id: 'la-vaca-saturno-support',
      name: 'ラ・ヴァカ・サトゥルノ・サトゥルニータ',
      level: 1,
      baseAttack: 12,
      baseDefense: 12,
      baseSpeed: 8,
      role: 'support',
      rarity: 'legendary',
      isInParty: false,
    },
    {
      id: 'ririri-rarira-support',
      name: 'リリリ・ラリラ',
      level: 1,
      baseAttack: 10,
      baseDefense: 10,
      baseSpeed: 10,
      role: 'support',
      rarity: 'rare',
      isInParty: false,
    },
    {
      id: 'il-cacto-hipopotamo-tank',
      name: 'イル・カクト・ヒポポタモ',
      level: 1,
      baseAttack: 11,
      baseDefense: 18,
      baseSpeed: 6,
      role: 'tank',
      rarity: 'common',
      isInParty: false,
    },
    {
      id: 'grolbo-fruttodrillo-attacker',
      name: 'グロルボ・フルットドリロ',
      level: 1,
      baseAttack: 16,
      baseDefense: 8,
      baseSpeed: 11,
      role: 'attacker',
      rarity: 'rare',
      isInParty: false,
    },
    {
      id: 'jiraffa-celeste-viaggioagreste-support',
      name: 'ジラッファチェレステ・ヴィアッジョアグレステ',
      level: 1,
      baseAttack: 13,
      baseDefense: 11,
      baseSpeed: 9,
      role: 'support',
      rarity: 'rare',
      isInParty: false,
    },
    {
      id: 'trippi-troppi-attacker',
      name: 'トリッピ・トロッピ',
      level: 1,
      baseAttack: 15,
      baseDefense: 7,
      baseSpeed: 13,
      role: 'attacker',
      rarity: 'common',
      isInParty: false,
    },
    {
      id: 'bri-bri-bix-dix-bombix-support',
      name: 'ブリ・ブリ・ビクス・ディクス・ボンビクス',
      level: 1,
      baseAttack: 12,
      baseDefense: 12,
      baseSpeed: 10,
      role: 'support',
      rarity: 'common',
      isInParty: false,
    },
    {
      id: 'bonbonbini-guzzini-attacker',
      name: 'ボンボンビー二・グジーニ',
      level: 1,
      baseAttack: 17,
      baseDefense: 7,
      baseSpeed: 12,
      role: 'attacker',
      rarity: 'common',
      isInParty: false,
    },
    {
      id: 'rhino-toasterino-tank',
      name: 'ライノ・トーステリーノ',
      level: 1,
      baseAttack: 12,
      baseDefense: 19,
      baseSpeed: 6,
      role: 'tank',
      rarity: 'rare',
      isInParty: false,
    },
    {
      id: 'orangutini-ananassini-attacker',
      name: 'オランギュティーニ・アナナシーニ',
      level: 1,
      baseAttack: 15,
      baseDefense: 8,
      baseSpeed: 12,
      role: 'attacker',
      rarity: 'epic',
      isInParty: false,
    },
    {
      id: 'cocophant-elephant-tank',
      name: 'ココファント・エレファント',
      level: 1,
      baseAttack: 11,
      baseDefense: 18,
      baseSpeed: 5,
      role: 'tank',
      rarity: 'epic',
      isInParty: false,
    },
    {
      id: 'goriro-watermelondrillo-attacker',
      name: 'ゴリロ・ウォーターメロンドリロ',
      level: 1,
      baseAttack: 17,
      baseDefense: 9,
      baseSpeed: 10,
      role: 'attacker',
      rarity: 'rare',
      isInParty: false,
    },
    {
      id: 'sigma-boy-support',
      name: 'シグマボーイ',
      level: 1,
      baseAttack: 11,
      baseDefense: 11,
      baseSpeed: 11,
      role: 'support',
      rarity: 'common',
      isInParty: false,
    },
    {
      id: 'teaglorigre-fruttoni-attacker',
      name: 'ティーグロリーグレ・フルトーニ',
      level: 1,
      baseAttack: 16,
      baseDefense: 8,
      baseSpeed: 11,
      role: 'attacker',
      rarity: 'epic',
      isInParty: false,
    },
    {
      id: 'tracotukutul-delaperadustuz-attacker',
      name: 'トラコトゥコトゥル・デラペラドゥストゥズ',
      level: 1,
      baseAttack: 18,
      baseDefense: 7,
      baseSpeed: 10,
      role: 'attacker',
      rarity: 'legendary',
      isInParty: false,
    },
    {
      id: 'bananita-dolfinita-support',
      name: 'バナニータ・ドルフィニータ',
      level: 1,
      baseAttack: 12,
      baseDefense: 12,
      baseSpeed: 9,
      role: 'support',
      rarity: 'epic',
      isInParty: false,
    },
    {
      id: 'blueberrini-octopussini-attacker',
      name: 'ブルーベリーニ・オクトプッシーニ',
      level: 1,
      baseAttack: 15,
      baseDefense: 9,
      baseSpeed: 12,
      role: 'attacker',
      rarity: 'common',
      isInParty: false,
    },
    {
      id: 'pussini-sussini-support',
      name: 'プッシーニ・スッシーニ',
      level: 1,
      baseAttack: 11,
      baseDefense: 13,
      baseSpeed: 10,
      role: 'support',
      rarity: 'common',
      isInParty: false,
    },
    {
      id: 'rakkooni-watermelni-attacker',
      name: 'ラッコオニ・ウォーターメルニ',
      level: 1,
      baseAttack: 15,
      baseDefense: 8,
      baseSpeed: 12,
      role: 'attacker',
      rarity: 'rare',
      isInParty: false,
    },
    {
      id: 'svinino-bombondino-attacker',
      name: 'スヴィニーノ・ボンボンディーノ',
      level: 1,
      baseAttack: 16,
      baseDefense: 8,
      baseSpeed: 11,
      role: 'attacker',
      rarity: 'epic',
      isInParty: false,
    },
    {
      id: 'cococcini-mama-support',
      name: 'ココッシニ・ママ',
      level: 1,
      baseAttack: 11,
      baseDefense: 13,
      baseSpeed: 9,
      role: 'support',
      rarity: 'rare',
      isInParty: false,
    },
    {
      id: 'perochello-lemonchello-attacker',
      name: 'ペロケッロ・レモンチェッロ',
      level: 1,
      baseAttack: 17,
      baseDefense: 7,
      baseSpeed: 12,
      role: 'attacker',
      rarity: 'epic',
      isInParty: false,
    },
    {
      id: 'ballerino-lololo-attacker',
      name: 'バレリーノ・ロロロ',
      level: 1,
      baseAttack: 15,
      baseDefense: 9,
      baseSpeed: 13,
      role: 'attacker',
      rarity: 'epic',
      isInParty: false,
    },
    {
      id: 'pipistrawberry-support',
      name: 'ピピストロベリー',
      level: 1,
      baseAttack: 12,
      baseDefense: 11,
      baseSpeed: 11,
      role: 'support',
      rarity: 'rare',
      isInParty: false,
    },
    {
      id: 'spaghetti-toiletti-attacker',
      name: 'スパゲッティ・トゥアレッティ',
      level: 1,
      baseAttack: 16,
      baseDefense: 8,
      baseSpeed: 12,
      role: 'attacker',
      rarity: 'epic',
      isInParty: false,
    },
    {
      id: 'ganganzeli-torlala-support',
      name: 'ガンガンツェリ・トルララ',
      level: 1,
      baseAttack: 11,
      baseDefense: 12,
      baseSpeed: 10,
      role: 'support',
      rarity: 'rare',
      isInParty: false,
    },
    {
      id: 'shupionilo-gorvilo-attacker',
      name: 'シュピオニロ・ゴルビロ',
      level: 1,
      baseAttack: 17,
      baseDefense: 7,
      baseSpeed: 11,
      role: 'attacker',
      rarity: 'epic',
      isInParty: false,
    },
    {
      id: 'torlimelo-torlicina-support',
      name: 'トルリメロ・トルリチナ',
      level: 1,
      baseAttack: 12,
      baseDefense: 12,
      baseSpeed: 9,
      role: 'support',
      rarity: 'epic',
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
    pendingBattleMs: 0,
    lastActiveAt: Date.now(),
  };
}
