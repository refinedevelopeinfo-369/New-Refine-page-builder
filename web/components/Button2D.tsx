// Button2D.tsx
// 2D HTMLボタンコンポーネント（MagicButtonのラッパー）
//
// 【機能】
// - MagicButtonコンポーネントを使用して幻想的なエフェクトを追加
// - ボタン自体の発光エフェクト
// - 光る玉がボタンの周りを周回
// - visible プロパティでフェードイン/アウト制御
//
// 【使用例】
// <Button2D
//   text="セクションを選択"
//   onClick={handleClick}
//   visible={true}
// />

import React from "react";
import { MagicButton } from "./MagicButton";

interface Button2DProps {
  text: string;
  onClick: () => void;
  visible: boolean; // フェードイン/アウト制御用
}

/**
 * 2D HTMLボタンコンポーネント
 *
 * @param text - ボタンに表示するテキスト
 * @param onClick - クリック時に実行される関数
 * @param visible - ボタンの表示/非表示（フェードアニメーション用）
 *
 * @remarks
 * - MagicButtonコンポーネントを使用
 * - ボタン自体の発光エフェクト + 光る玉の周回エフェクト
 * - visible プロパティで opacity を制御してフェードイン/アウト
 * - ホバー時にエフェクト強化
 */
export function Button2D({ text, onClick, visible }: Button2DProps) {
  return <MagicButton text={text} onClick={onClick} visible={visible} />;
}
