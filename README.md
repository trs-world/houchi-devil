# Tower of Demonlord

シンプルで拡張しやすい放置系 RPG (Expo + TypeScript + Zustand) プロジェクト。

- プレイヤーは魔王。
- 手下のデーモンが自動で塔を登り、フロアを攻略する。
- プレイヤーは **パーティ編成 / デーモン育成 / 魔王パッシブ強化** のみを管理。

この README は、後から自分や別の開発者（＋この AI）が状況を思い出せるようにまとめています。

---

## 1. 技術スタック

- **Expo SDK**: 54
- **React**: 19.1.0
- **React Native**: 0.81.5
- **言語**: TypeScript
- **状態管理**: Zustand
- **永続化**: AsyncStorage
- **ナビゲーション**: React Navigation (Bottom Tabs)
- **ビルド設定**: Babel (`babel-preset-expo` + `babel-plugin-module-resolver`)

### 主な依存関係

`package.json` より（バージョンは将来的に変わる可能性あり）:

- `expo` `^54.0.0`
- `react` `19.1.0`
- `react-native` `0.81.5`
- `expo-asset` `~12.0.10`
- `expo-status-bar` `~3.0.8`
- `react-native-safe-area-context` `~5.6.0`
- `react-native-screens` `~4.16.0`
- `@react-navigation/native`, `@react-navigation/bottom-tabs`
- `zustand`
- `@react-native-async-storage/async-storage`
- devDeps: `typescript`, `eslint`, `eslint-config-universe`, `@types/react`, `babel-preset-expo`, `babel-plugin-module-resolver` など

---

## 2. セットアップ & 実行方法

### 2-1. 依存インストール

```bash
# プロジェクトルート (houchi-devil) で
npm install
```

### 2-2. 開発サーバー起動

```bash
# Metro キャッシュをクリアしたいとき
npx expo start -c

# 通常起動
npx expo start
```

その後、ブラウザの Expo DevTools から:

- Android エミュレータで起動
- iOS シミュレータで起動 (macOS の場合)
- 実機の Expo Go アプリで QR コードを読み取る

> ※ Expo Go は **SDK 54 対応版** である必要あり。

---

## 3. ディレクトリ構成 (概要)

```text
houchi-devil/
  App.tsx                # ルートコンポーネント (タブナビ + ゲームループ)
  app.json               # Expo 設定
  babel.config.js        # Babel 設定 (preset: expo, module-resolver)
  package.json
  tsconfig.json
  README.md
  src/
    models/
      game.ts            # データモデル & バランス用ヘルパー
    store/
      gameStore.ts       # Zustand ストア + AsyncStorage 永続化 + 放置ロジック
    hooks/
      useGameLoop.ts     # 1秒ごとの進行 & 復帰時のオフライン計算
    screens/
      TowerScreen.tsx    # 塔画面 (現在階層・難易度・報酬・リソース)
      DemonsScreen.tsx   # デーモン一覧 & レベルアップ & パーティ編成
      UpgradesScreen.tsx # 魔王パッシブ強化 (ソウル・ジェム倍率など)
      SettingsScreen.tsx # Idle Sync / Reset Game など
```

---

## 4. ゲームロジック概要

### 4-1. データモデル (`src/models/game.ts`)

- `DemonRole` : `'attacker' | 'tank' | 'support' | 'farmer'`
- `Demon` : 悪魔 1 体の情報（レベル、基礎ステ、ロール、レアリティ、パーティ参加フラグ）
- `Floor` : 階層ごとの難易度 & 基礎報酬
- `DemonLordUpgrades` : 魔王のパッシブ倍率
- `Resources` : `souls`, `gems`
- `GameState` : ゲーム全体の状態

主なヘルパー:

- `getDemonPower(demon, upgrades)` : 1 体の戦力計算
- `getPartyPower(demons, upgrades)` : パーティ合計戦力
- `getFloorInfo(floorNumber)` : 難易度 & 基礎報酬の自動生成
- `getFloorRewards(floor, upgrades)` : 魔王バフを乗せた実際の報酬
- `createDefaultDemons()` : 初期デーモン 4 体を生成
- `createInitialGameState()` : ゲーム開始時の状態を生成

### 4-2. 放置ロジック (`src/store/gameStore.ts`)

`GameStore` (Zustand) は `GameState` + 以下のアクションを持つ:

- `levelUpDemon(id)`
  - ソウルコスト: `10 * 1.35^(level - 1)`
- `togglePartyStatus(id)`
  - パーティ参加フラグのオン/オフ
- `buyUpgrade(type)`
  - 魔王バフ倍率を `+0.05` ずつ強化
  - コスト: `20 * 2^steps` (`steps = (multiplier - 1) / 0.05`)
- `processTime(elapsedMs)`
  - 経過時間ぶんの塔攻略をシミュレート
  - `BASE_FLOOR_CLEAR_TIME_MS = 10000` (10 秒)
  - パワー >= 難易度の間、10 秒ごとに 1 フロア進行 & 報酬付与
- `touch()`
  - `lastActiveAt` との差分を一気に `processTime` に渡すヘルパー
- `resetGame()`
  - ゲームを完全初期化

AsyncStorage との永続化は `persist` ミドルウェアで実装済み。`onRehydrateStorage` でアプリ復帰時のオフライン計算も行う。

### 4-3. 実行ループ (`src/hooks/useGameLoop.ts`)

- マウント時に `touch()` を1回呼び、`lastActiveAt` を初期化。
- `setInterval` (1秒) で `now - lastActiveAt` を `processTime` に流す。
- `AppState` が `active` になったタイミングでも `touch()` を呼び、バックグラウンド中の進行をまとめて反映。

> 重要: 実際の「時間の進み」は **すべて `processTime` に集約** されているので、
> オフライン報酬の仕様変更やバランス調整はここをいじればよい。

---

## 5. Babel 設定と注意点

`babel.config.js`:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@/store": "./src/store",
            "@/models": "./src/models",
            "@/screens": "./src/screens",
            "@/hooks": "./src/hooks",
          },
        },
      ],
    ],
  };
};
```

必要な devDependencies:

- `babel-preset-expo`
- `babel-plugin-module-resolver`

これらが無いと `Cannot find module 'babel-preset-expo'` / `... 'module-resolver'` のような赤画面になる。

---

## 6. Expo SDK アップグレード履歴 (メモ)

- 初期実装時は Expo SDK 52 で作成。
- 後から Expo Go 側の要求で **SDK 54 にアップグレード**。
  - `npx expo install expo@^54.0.0`
  - `npx expo install --fix` で依存を揃える
  - `react`, `react-native`, `expo-asset`, `expo-status-bar` などが自動的に 54 対応版に更新
  - 型定義の整合性のため `@types/react` を `^19.1.10` に更新

今後、SDK をさらに上げる場合は:

1. `npx expo install expo@^XX.0.0`
2. `npx expo install --fix`
3. `npx expo-doctor` で確認

という Expo 公式推奨フローに従うと安全。

---

## 7. 今後の拡張アイデア

- **コンバット要素の演出**
  - 進行中のフロアやボス名の表示
  - 攻撃ログ / クリアログ画面
- **デーモンの増加 & アンロック条件**
  - 到達階層や実績による新デーモン解放
- **速度ベースのフロア時間**
  - パーティの `speed` 合計に応じて `BASE_FLOOR_CLEAR_TIME_MS` を可変に
- **スキル / シナジー**
  - ロール組み合わせ / レアリティによる追加ボーナス

---

## 8. トラブルシューティング (よくあったもの)

- `Cannot find module 'babel-preset-expo'`
  - `npm install --save-dev babel-preset-expo`
- `Cannot find module 'babel-plugin-module-resolver'`
  - `npm install --save-dev babel-plugin-module-resolver`
- Expo SDK と依存バージョンの警告
  - `npx expo install --fix`
  - `@types/react` のような型パッケージも Expo が提示するバージョンに合わせる

---

以上。ここまで読めば、このプロジェクトの「全体像」と「どこをいじれば何が変わるか」がざっくり分かる想定です。
