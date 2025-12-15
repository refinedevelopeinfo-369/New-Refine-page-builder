// SectionSelection.tsx
// セクション選択画面のUIコンポーネント (Gadget連携版)

import React, { useState } from "react";
import { useGlobalAction, useFindMany } from "@gadgetinc/react"; // Gadgetフックを追加
import { api } from "../api"; // Gadget APIをインポート
import type { SectionData } from "./types";
import { VerticalSectionPreview } from "./VerticalSectionPreview";
import { MagicButton } from "./MagicButton";
import { GlowButton } from "./GlowButton";

interface SectionSelectionProps {
  sections: SectionData[];
  selectedSectionId: string | null;
  onSectionClick: (sectionId: string) => void;
  onBack: () => void;
}

export function SectionSelection({
  sections,
  selectedSectionId,
  onSectionClick,
  onBack
}: SectionSelectionProps) {
  // ホバー中のセクションを管理
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  // 一括追加用の選択状態
  const [checkedSectionIds, setCheckedSectionIds] = useState<Set<string>>(new Set());
  // 一括処理中のローディング状態
  const [isBulkInstalling, setIsBulkInstalling] = useState(false);

  // ---------------------------------------------------------
  // 1. Gadgetから「インストール済みリスト」を取得 (リアルタイム同期)
  // ---------------------------------------------------------
  const [{ data: installationsData }] = useFindMany(api.installation, {
    select: {
      section: { slug: true } // セクションのslugだけ取ってくる
    }
  });

  // ---------------------------------------------------------
  // 2. Gadgetの「インストールアクション」を使う準備
  // ---------------------------------------------------------
 const [{ fetching: isInstalling, error: installError }, install] = useGlobalAction(api.installSection);

  // チェックボックスのトグル処理
  const handleToggleCheck = (sectionId: string) => {
    setCheckedSectionIds((prev) => {
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
  const handleBulkAdd = async () => {
    const selectedIds = Array.from(checkedSectionIds);
    if (selectedIds.length === 0) return;

    if (!confirm(`${selectedIds.length}件のセクションをインストールしますか？`)) {
      return;
    }

    setIsBulkInstalling(true);
    let successCount = 0;
    let failCount = 0;

    // 選択されたセクションを順番にインストール
    for (const slug of selectedIds) {
      try {
        // Gadgetのアクションを実行
        await install({ sectionSlug: slug });
        successCount++;
        // 成功したらチェックを外す
        setCheckedSectionIds(prev => {
          const next = new Set(prev);
          next.delete(slug);
          return next;
        });
      } catch (error: any) {
        console.error(`Failed to install ${slug}:`, error);
        failCount++;
      }
    }

    setIsBulkInstalling(false);

    // 結果表示
    if (failCount === 0) {
      alert(`完了！ ${successCount}件のセクションを追加しました。\nテーマエディタを確認してください。`);
    } else {
      alert(`${successCount}件成功、${failCount}件失敗しました。\n(既に同名のファイルが存在する可能性があります)`);
    }
  };

  // インストール済みかどうかを判定する関数
  const isInstalled = (sectionId: string): boolean => {
    if (!installationsData) return false;
    // Gadgetから取得したデータ内に、このsectionId(slug)が含まれているかチェック
    return installationsData.some((inst) => inst.section?.slug === sectionId);
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
        paddingTop: "5rem",
        gap: "2rem",
      }}
    >
      {/* 戻るボタン */}
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

      {/* 左側: セクション選択リスト */}
      <div style={{ width: "40%", display: "flex", flexDirection: "column" }}>
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

          {/* セクションリスト */}
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
              const installed = isInstalled(section.id); // Gadgetのデータで判定

              return (
                <div key={section.id} style={{ position: "relative" }}>
                  <GlowButton
                    text={section.name}
                    onClick={() => handleToggleCheck(section.id)}
                    onMouseEnter={() => setHoveredSectionId(section.id)}
                    onMouseLeave={() => setHoveredSectionId(null)}
                    isSelected={isSelected}
                    isHovered={isHovered}
                    isChecked={isChecked}
                    showCheckbox={true}
                  />
                  {/* インストール済みバッジ */}
                  {installed && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        background: "linear-gradient(135deg, #4ade80, #22c55e)",
                        color: "#000",
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 8px rgba(74, 222, 128, 0.4)",
                        zIndex: 10,
                      }}
                    >
                      Installed
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* 一括追加ボタン */}
          <div style={{ marginTop: "1.5rem" }}>
            <MagicButton
              text={
                isBulkInstalling
                  ? "インストール中..."
                  : checkedSectionIds.size > 0
                    ? `✓ 選択したセクションを追加 (${checkedSectionIds.size}件)`
                    : "セクションを選択してください"
              }
              onClick={handleBulkAdd}
              visible={true}
              size="medium"
              style={{
                width: "100%",
                opacity: checkedSectionIds.size > 0 && !isBulkInstalling ? 1 : 0.5,
                pointerEvents: checkedSectionIds.size > 0 && !isBulkInstalling ? "auto" : "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* 右側: プレビュー画面 */}
      <div style={{ width: "60%", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "16px",
            padding: "2rem",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
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
          <VerticalSectionPreview
            sections={sections}
            hoveredSectionId={hoveredSectionId}
          />
        </div>
      </div>
    </div>
  );
}