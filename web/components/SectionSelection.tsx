// SectionSelection.tsx
// セクション選択画面のUIコンポーネント
//
// 【レイアウト】
// - 左側（40%）: セクションリスト + チェックボックス + 一括追加ボタン + プレート背景
// - 右側（60%）: プレビュー画面 + プレート背景
// - プレート背景: rgba(255, 255, 255, 0.05) で半透明
//
// 【機能】
// - チェックボックスで複数セクションを選択可能
// - 選択中のセクションをハイライト表示（緑系の発光）
// - ホバー中のセクションもプレビュー画面に表示
// - リスト下部に一括追加ボタン（選択件数を表示）
// - 選択がない場合はボタンを非活性化
// - プレビュー画像の表示（プレースホルダーまたは実際の画像）

import React, { useState } from "react";
import type { SectionData } from "./types";
import { VerticalSectionPreview } from "./VerticalSectionPreview";
import { MagicButton } from "./MagicButton";
import { GlowButton } from "./GlowButton";

interface SectionSelectionProps {
  sections: SectionData[];
  selectedSectionId: string | null; // 選択中のセクションID
  onSectionClick: (sectionId: string) => void;
  onBack: () => void;
}

/**
 * セクション選択画面コンポーネント
 *
 * @param sections - 表示するセクションのリスト
 * @param selectedSectionId - 選択中のセクションID（プレビュー用）
 * @param onSectionClick - セクションがクリックされた時の処理（プレビュー用、現在は未使用）
 * @param onBack - 戻るボタンがクリックされた時の処理
 *
 * @remarks
 * - 左右2カラムレイアウト（4:6比率）
 * - 左側: チェックボックス付きセクションリスト + 一括追加ボタン
 * - 右側: プレビュー画面
 * - チェックされたセクションは緑系の発光（box-shadow: rgba(100, 255, 150, 0.6)）
 * - ホバー中のセクションもプレビューに表示される
 * - 一括追加ボタンは選択件数を表示し、選択がない場合は非活性化
 * - プレビュー優先度: 選択中 > ホバー中 > 最初のセクション
 */
export function SectionSelection({
  sections,
  selectedSectionId,
  onSectionClick,
  onBack
}: SectionSelectionProps) {
  // ホバー中のセクションを管理（プレビュー表示用）
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

  // 一括追加用の選択状態を管理
  const [checkedSectionIds, setCheckedSectionIds] = useState<Set<string>>(new Set());

  // チェックボックスのトグル処理
  const handleToggleCheck = (sectionId: string) => {
    setCheckedSectionIds((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // 一括追加ボタンのクリック処理
  const handleBulkAdd = () => {
    const selectedIds = Array.from(checkedSectionIds);
    console.log('追加するセクション:', selectedIds);
    // TODO: Shopify API連携（Phase 3で実装）
    alert(`${selectedIds.length}件のセクションを追加します:\n${selectedIds.join(', ')}`);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        pointerEvents: "all",
        zIndex: 1000,
        padding: "2rem",
        paddingTop: "5rem", // 戻るボタンとのかぶりを防ぐため上部に余白を追加
        gap: "2rem",
      }}
    >
      {/* 戻るボタン（幻想的なエフェクト付き） */}
      <MagicButton
        text="← 戻る"
        onClick={onBack}
        visible={true}
        size="small"
        particleScale={1.5}
        style={{
          position: "absolute",
          top: "1.5rem",
          left: "2rem",
          zIndex: 1001,
        }}
      />

      {/* 左側: セクション選択リスト (40%) */}
      <div style={{ width: "40%", display: "flex", flexDirection: "column" }}>
        {/* プレート背景 */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "16px",
            padding: "2rem",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#ffffff",
              marginBottom: "2rem",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
            }}
          >
            セクションを選択
          </h2>

          {/* セクションボタンのリスト */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              overflowY: "auto",
              flex: 1,
            }}
          >
            {sections.map((section) => {
              const isSelected = section.id === selectedSectionId;
              const isHovered = section.id === hoveredSectionId;
              const isChecked = checkedSectionIds.has(section.id);

              return (
                <GlowButton
                  key={section.id}
                  text={section.name}
                  onClick={() => handleToggleCheck(section.id)}
                  onMouseEnter={() => setHoveredSectionId(section.id)}
                  onMouseLeave={() => setHoveredSectionId(null)}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  isChecked={isChecked}
                  showCheckbox={true}
                />
              );
            })}
          </div>

          {/* 一括追加ボタン */}
          <div style={{ marginTop: "1.5rem" }}>
            <MagicButton
              text={
                checkedSectionIds.size > 0
                  ? `✓ 選択したセクションを追加 (${checkedSectionIds.size}件)`
                  : "セクションを選択してください"
              }
              onClick={handleBulkAdd}
              visible={true}
              size="medium"
              style={{
                width: "100%",
                opacity: checkedSectionIds.size > 0 ? 1 : 0.5,
                pointerEvents: checkedSectionIds.size > 0 ? "auto" : "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* 右側: 縦スクロールプレビュー (60%) */}
      <div style={{ width: "60%", display: "flex", flexDirection: "column" }}>
        {/* プレート背景 */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "16px",
            padding: "2rem",
            flex: 1, // 残りスペースを使用（固定高さではない）
            minHeight: 0, // flex の子要素が縮小可能に
            display: "flex",
            flexDirection: "column",
            overflow: "hidden", // スクロールエリアの外にはみ出さないように
          }}
        >
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1.5rem",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
            }}
          >
            ページプレビュー
          </h3>

          {/* 縦スクロールプレビューコンポーネント */}
          <VerticalSectionPreview
            sections={sections}
            hoveredSectionId={hoveredSectionId}
          />
        </div>
      </div>
    </div>
  );
}
