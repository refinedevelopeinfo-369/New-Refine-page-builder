// SettingsPanel.tsx
// アプリ設定画面のコンポーネント
//
// 【機能】
// - インストール済みセクションの一覧表示
// - 個別セクションの更新・削除
// - 全セクションの一括削除（アプリ削除準備）
// - 更新可能なセクションのバッジ表示

import React, { useState } from "react";
import { useSectionManager, InstalledSection } from "../hooks/useSectionManager";
import { MagicButton } from "./MagicButton";

interface SettingsPanelProps {
  onClose: () => void;
}

/**
 * 設定パネルコンポーネント
 *
 * @param onClose - パネルを閉じる時の処理
 *
 * @remarks
 * - インストール済みセクションの管理
 * - アプリ削除前の全ファイル削除機能
 * - 各セクションの更新・削除操作
 */
export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const {
    installations,
    isLoading,
    error,
    updateSection,
    updateAllSections,
    uninstallSection,
    cleanupAll,
    clearError,
    fetchInstallations,
  } = useSectionManager();

  // 確認ダイアログの状態
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);
  const [cleanupDryRunResult, setCleanupDryRunResult] = useState<number | null>(null);

  // 更新可能なセクション数
  const updatableCount = installations.filter((inst) => inst.hasUpdate).length;

  // 全セクション削除の確認
  const handleCleanupClick = async () => {
    // ドライランで削除対象数を確認
    const result = await cleanupAll(undefined, true);
    setCleanupDryRunResult(result.count);
    setShowCleanupConfirm(true);
  };

  // 全セクション削除の実行
  const handleCleanupConfirm = async () => {
    setShowCleanupConfirm(false);
    setCleanupDryRunResult(null);

    const result = await cleanupAll();
    if (result.success) {
      alert(`${result.count}件のセクションを削除しました。\nアプリをアンインストールする準備が整いました。`);
    } else {
      alert("削除に失敗しました。詳細はエラーメッセージを確認してください。");
    }
  };

  // 個別セクションの更新
  const handleUpdate = async (sectionSlug: string) => {
    const success = await updateSection(sectionSlug);
    if (success) {
      alert(`セクション "${sectionSlug}" を更新しました。`);
    }
  };

  // 個別セクションの削除
  const handleUninstall = async (sectionSlug: string, sectionName: string) => {
    if (!confirm(`セクション "${sectionName}" を削除しますか？\nテーマから該当ファイルが削除されます。`)) {
      return;
    }

    const success = await uninstallSection(sectionSlug);
    if (success) {
      alert(`セクション "${sectionName}" を削除しました。`);
    }
  };

  // 全セクションの一括更新
  const handleUpdateAll = async () => {
    if (updatableCount === 0) {
      alert("更新可能なセクションはありません。");
      return;
    }

    if (!confirm(`${updatableCount}件のセクションを更新しますか？`)) {
      return;
    }

    const result = await updateAllSections();
    if (result.failed.length === 0) {
      alert(`${result.success.length}件のセクションを更新しました。`);
    } else {
      alert(
        `${result.success.length}件更新、${result.failed.length}件失敗しました。\n` +
        `失敗: ${result.failed.join(", ")}`
      );
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(10px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: "rgba(30, 30, 40, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "16px",
          padding: "2rem",
          width: "90%",
          maxWidth: "800px",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#ffffff",
              margin: 0,
            }}
          >
            設定
          </h2>
          <MagicButton
            text="✕ 閉じる"
            onClick={onClose}
            visible={true}
            size="small"
          />
        </div>

        {/* エラー表示 */}
        {error && (
          <div
            style={{
              background: "rgba(255, 100, 100, 0.2)",
              border: "1px solid rgba(255, 100, 100, 0.5)",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1.5rem",
              color: "#ffaaaa",
            }}
          >
            {error}
            <button
              onClick={clearError}
              style={{
                marginLeft: "1rem",
                background: "transparent",
                border: "none",
                color: "#ffaaaa",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              閉じる
            </button>
          </div>
        )}

        {/* インストール済みセクション */}
        <section style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.3rem",
                fontWeight: "600",
                color: "#ffffff",
                margin: 0,
              }}
            >
              インストール済みセクション ({installations.length}件)
            </h3>
            {updatableCount > 0 && (
              <MagicButton
                text={`全て更新 (${updatableCount}件)`}
                onClick={handleUpdateAll}
                visible={true}
                size="small"
                style={{ opacity: isLoading ? 0.5 : 1 }}
              />
            )}
          </div>

          {installations.length === 0 ? (
            <p style={{ color: "#888", fontStyle: "italic" }}>
              インストール済みのセクションはありません
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {installations.map((inst) => (
                <InstalledSectionItem
                  key={inst.id}
                  installation={inst}
                  isLoading={isLoading}
                  onUpdate={handleUpdate}
                  onUninstall={handleUninstall}
                />
              ))}
            </div>
          )}
        </section>

        {/* 危険な操作 */}
        <section
          style={{
            borderTop: "1px solid rgba(255, 100, 100, 0.3)",
            paddingTop: "1.5rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.3rem",
              fontWeight: "600",
              color: "#ff6666",
              marginBottom: "1rem",
            }}
          >
            ⚠️ 危険な操作
          </h3>

          <p
            style={{
              color: "#aaa",
              fontSize: "0.9rem",
              marginBottom: "1rem",
              lineHeight: 1.6,
            }}
          >
            アプリをアンインストールする前に、テーマに追加した全てのセクションファイルを削除できます。
            この操作は取り消せません。
          </p>

          <MagicButton
            text={
              isLoading
                ? "処理中..."
                : "🗑️ 全セクションを削除（アプリ削除準備）"
            }
            onClick={handleCleanupClick}
            visible={true}
            size="medium"
            style={{
              background: "linear-gradient(135deg, #ff4444, #cc0000)",
              opacity: isLoading || installations.length === 0 ? 0.5 : 1,
              pointerEvents: isLoading || installations.length === 0 ? "none" : "auto",
            }}
          />
        </section>

        {/* 確認ダイアログ */}
        {showCleanupConfirm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.9)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 3000,
            }}
          >
            <div
              style={{
                background: "rgba(50, 30, 30, 0.95)",
                border: "2px solid rgba(255, 100, 100, 0.5)",
                borderRadius: "16px",
                padding: "2rem",
                maxWidth: "500px",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  fontSize: "1.5rem",
                  color: "#ff6666",
                  marginBottom: "1rem",
                }}
              >
                ⚠️ 確認
              </h3>
              <p style={{ color: "#fff", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                {cleanupDryRunResult}件のセクションファイルを削除します。
                <br />
                <strong>この操作は取り消せません。</strong>
                <br />
                本当に実行しますか？
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                <MagicButton
                  text="キャンセル"
                  onClick={() => {
                    setShowCleanupConfirm(false);
                    setCleanupDryRunResult(null);
                  }}
                  visible={true}
                  size="small"
                />
                <MagicButton
                  text="削除する"
                  onClick={handleCleanupConfirm}
                  visible={true}
                  size="small"
                  style={{
                    background: "linear-gradient(135deg, #ff4444, #cc0000)",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// インストール済みセクションの行コンポーネント
function InstalledSectionItem({
  installation,
  isLoading,
  onUpdate,
  onUninstall,
}: {
  installation: InstalledSection;
  isLoading: boolean;
  onUpdate: (slug: string) => void;
  onUninstall: (slug: string, name: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "8px",
        padding: "1rem",
      }}
    >
      <div>
        <div style={{ color: "#fff", fontWeight: "600" }}>
          {installation.sectionName}
          {installation.hasUpdate && (
            <span
              style={{
                marginLeft: "0.5rem",
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                color: "#000",
                fontSize: "0.7rem",
                fontWeight: "bold",
                padding: "2px 6px",
                borderRadius: "6px",
              }}
            >
              更新あり
            </span>
          )}
        </div>
        <div style={{ color: "#888", fontSize: "0.85rem", marginTop: "0.25rem" }}>
          v{installation.installedVersion}
          {installation.hasUpdate && ` → v${installation.currentVersion}`}
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {installation.hasUpdate && (
          <button
            onClick={() => onUpdate(installation.sectionSlug)}
            disabled={isLoading}
            style={{
              background: "linear-gradient(135deg, #4ade80, #22c55e)",
              color: "#000",
              border: "none",
              borderRadius: "6px",
              padding: "0.5rem 1rem",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontWeight: "600",
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            更新
          </button>
        )}
        <button
          onClick={() => onUninstall(installation.sectionSlug, installation.sectionName)}
          disabled={isLoading}
          style={{
            background: "transparent",
            color: "#ff6666",
            border: "1px solid #ff6666",
            borderRadius: "6px",
            padding: "0.5rem 1rem",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontWeight: "600",
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          削除
        </button>
      </div>
    </div>
  );
}
