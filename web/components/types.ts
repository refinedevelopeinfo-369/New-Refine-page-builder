// types.ts
// すべての型定義をここにまとめ、exportします。

// テクスチャのパスの型
export interface TexturePaths {
  color: string;
  normal: string;
  roughness: string;
}

// セクションデータの型
export interface SectionData {
  id: string;
  name: string;
  description?: string; // セクションの説明文（オプショナル）

  // プレビューアセット
  thumbnailUrl: string; // 静止画サムネイル（必須）
  previewVideoUrl?: string; // プレビュー動画（3秒以内推奨）

  // 縦並びプレビュー用メタデータ
  order: number; // 表示順序（0から始まる）
  minHeight?: number; // プレビュー表示時の最小高さ（px、デフォルト: 300）
  // ※ 実際の高さは動画/画像のアスペクト比に応じて自動調整されます

  // 後方互換性のため残す（非推奨）
  previewImage?: string; // @deprecated thumbnailUrlを使用してください
}

// 1つのシーンが持つデータの型
export interface SceneData {
  text: string;
  textColor: string;
  outlineColor: string;
  textures: TexturePaths;
  font: string;
  sections: SectionData[]; // 各部屋固有のセクション一覧
}

// Roomコンポーネントが受け取るpropsの型
export interface RoomProps {
  textures: TexturePaths;
}

// InteractiveTextコンポーネントが受け取るpropsの型
export interface InteractiveTextProps {
  text: string;
  font: string;
  textColor: string;
  outlineColor: string;
  disabled?: boolean; // ホバーアニメーションを無効化するかどうか（スクロール中など）
}
