// GlowButton.tsx
// セクションリスト用の発光ボタンコンポーネント
//
// 【機能】
// - シンプルな発光エフェクト（box-shadow）
// - ホバー/選択時に発光が強くなる
// - パフォーマンス重視の軽量実装
//
// 【使用例】
// <GlowButton
//   text="Hero Section"
//   onClick={handleClick}
//   isSelected={true}
//   isHovered={false}
// />

import React from "react";

interface GlowButtonProps {
  text: string;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isSelected?: boolean;  // 選択状態（プレビュー用）
  isHovered?: boolean;   // ホバー状態
  isChecked?: boolean;   // チェックボックスの状態（一括追加用）
  showCheckbox?: boolean; // チェックボックスを表示するか
}

/**
 * セクションリスト用の発光ボタンコンポーネント
 *
 * @param text - ボタンに表示するテキスト
 * @param onClick - クリック時に実行される関数
 * @param onMouseEnter - マウスエンター時の処理
 * @param onMouseLeave - マウスリーブ時の処理
 * @param isSelected - 選択状態（プレビュー用、発光が強くなる）
 * @param isHovered - ホバー状態（発光が強くなる）
 * @param isChecked - チェックボックスの状態（一括追加用、緑系発光）
 * @param showCheckbox - チェックボックスを表示するか（省略時はfalse）
 *
 * @remarks
 * - 通常時: 弱い発光（box-shadow: 10px, opacity: 0.2）
 * - ホバー時: 中程度の発光（box-shadow: 20px, opacity: 0.5）
 * - 選択時: 強い発光（box-shadow: 25px, opacity: 0.6）+ 境界線強調
 * - チェック時: 緑系の強い発光（box-shadow: 25px, rgba(100, 255, 150, 0.6)）
 * - showCheckbox=true の場合、左側にチェックボックスを表示
 * - CSS transition で滑らかなアニメーション
 * - パフォーマンス重視（requestAnimationFrame 不使用）
 */
export function GlowButton({
  text,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isSelected = false,
  isHovered = false,
  isChecked = false,
  showCheckbox = false,
}: GlowButtonProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        // 基本スタイル
        padding: "1.5rem 2rem",
        fontSize: "1.25rem",
        fontWeight: "600",
        color: "#ffffff",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        width: "100%",

        // 半透明背景（チェック時は少し明るく）
        background:
          isChecked || isSelected || isHovered
            ? "rgba(255, 255, 255, 0.2)"
            : "rgba(255, 255, 255, 0.1)",

        // 境界線（選択時またはチェック時は太く）
        border: isSelected || isChecked
          ? "2px solid rgba(255, 255, 255, 0.5)"
          : "1px solid rgba(255, 255, 255, 0.2)",

        borderRadius: "12px",
        backdropFilter: "blur(10px)",
        cursor: "pointer",

        // 発光エフェクト（チェック時は緑系）
        boxShadow: isChecked
          ? "0 0 25px rgba(100, 255, 150, 0.6)"
          : isSelected
          ? "0 0 25px rgba(255, 255, 255, 0.6)"
          : isHovered
          ? "0 0 20px rgba(255, 255, 255, 0.5)"
          : "0 0 10px rgba(255, 255, 255, 0.2)",

        // アニメーション
        transition: "all 0.3s ease",
        transform: isHovered ? "translateX(10px)" : "translateX(0)",
      }}
    >
      {/* チェックボックス */}
      {showCheckbox && (
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            border: "2px solid rgba(255, 255, 255, 0.6)",
            background: isChecked
              ? "linear-gradient(135deg, #00ff7f, #4db8ff)"
              : "rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.3s ease",
          }}
        >
          {isChecked && (
            <span style={{ color: "#ffffff", fontSize: "16px", fontWeight: "bold" }}>
              ✓
            </span>
          )}
        </div>
      )}

      {/* テキスト */}
      <span style={{ flex: 1 }}>{text}</span>
    </button>
  );
}
