// MagicButton.tsx
// 幻想的なエフェクト付きボタンコンポーネント
//
// 【機能】
// - ボタン自体の発光エフェクト（box-shadow + CSS脈動アニメーション）
// - 光る玉がボタンの周りを周回（ParticleOrbitコンポーネント使用）
// - ホバー時にエフェクト強化
//
// 【使用例】
// <MagicButton
//   text="セクションを選択"
//   onClick={handleClick}
//   visible={true}
// />

import React, { useState } from "react";
import { ParticleOrbit } from "./ParticleOrbit";

interface MagicButtonProps {
  text: string;
  onClick: () => void;
  visible?: boolean;        // フェードイン/アウト制御用
  style?: React.CSSProperties; // 追加のスタイル
  size?: "small" | "medium" | "large"; // ボタンのサイズ（省略時はmedium）
  particleScale?: number;   // 玉のサイズ倍率（省略時は1.0）
}

/**
 * 幻想的なエフェクト付きボタンコンポーネント
 *
 * @param text - ボタンに表示するテキスト
 * @param onClick - クリック時に実行される関数
 * @param visible - ボタンの表示/非表示（フェードアニメーション用）
 * @param style - 追加のスタイル（position等）
 * @param size - ボタンのサイズ（"small" | "medium" | "large"、省略時は"medium"）
 * @param particleScale - 玉のサイズ倍率（省略時は1.0、2.0で2倍、0.5で半分）
 *
 * @remarks
 * - ボタン自体の発光エフェクト:
 *   - 通常時: box-shadow 20px（脈動アニメーション）
 *   - ホバー時: box-shadow 30px（1.5倍に強化）
 * - 光る玉のエフェクト:
 *   - 5個の玉がランダムな楕円軌道で周回
 *   - ホバー時に速度1.2倍
 *   - 奥行き演出（サイズ・明るさ・ぼかしが変化）
 *   - particleScale で玉のサイズを調整可能
 * - prefers-reduced-motion 対応
 * - サイズバリエーション:
 *   - small: padding 0.75rem 1.5rem, fontSize 0.875rem
 *   - medium: padding 1.5rem 3rem, fontSize 1.25rem（デフォルト）
 *   - large: padding 2rem 4rem, fontSize 1.5rem
 */
export function MagicButton({
  text,
  onClick,
  visible = true,
  style = {},
  size = "medium",
  particleScale = 1.0,
}: MagicButtonProps) {
  const [hovered, setHovered] = useState(false);

  // サイズに応じたpadding/fontSizeの設定
  const sizeStyles = {
    small: {
      padding: "0.75rem 1.5rem",
      fontSize: "0.875rem",
    },
    medium: {
      padding: "1.5rem 3rem",
      fontSize: "1.25rem",
    },
    large: {
      padding: "2rem 4rem",
      fontSize: "1.5rem",
    },
  };

  // prefers-reduced-motion 対応
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        ...style,
      }}
    >
      {/* 光る玉のエフェクト */}
      {!prefersReducedMotion && <ParticleOrbit hovered={hovered} scale={particleScale} />}

      {/* ボタン本体 */}
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          // 基本スタイル
          position: "relative",
          zIndex: 1, // 玉よりも下に配置
          padding: sizeStyles[size].padding,
          fontSize: sizeStyles[size].fontSize,
          fontWeight: "600",
          color: "#ffffff",

          // 半透明背景
          background: hovered
            ? "rgba(255, 255, 255, 0.2)"
            : "rgba(255, 255, 255, 0.1)",
          border: hovered
            ? "1px solid rgba(255, 255, 255, 0.4)"
            : "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "12px",
          backdropFilter: "blur(10px)",

          // カーソル
          cursor: "pointer",

          // 発光エフェクト
          boxShadow: hovered
            ? "0 0 30px rgba(255, 255, 255, 0.6)"
            : "0 0 20px rgba(255, 255, 255, 0.4)",

          // アニメーション
          transition: "all 0.3s ease",
          transform: hovered ? "translateY(-5px)" : "translateY(0)",

          // フェードイン/アウト
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",

          // CSS脈動アニメーション
          animation: prefersReducedMotion
            ? "none"
            : "magicButtonPulse 3s ease-in-out infinite",
        }}
      >
        {text}
      </button>

      {/* CSS Keyframes をインラインスタイルで挿入 */}
      <style>
        {`
          @keyframes magicButtonPulse {
            0%, 100% {
              box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
            }
            50% {
              box-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            @keyframes magicButtonPulse {
              0%, 100% {
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
              }
            }
          }
        `}
      </style>
    </div>
  );
}
