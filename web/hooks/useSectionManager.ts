// hooks/useSectionManager.ts
// セクションのインストール・更新・削除を管理するカスタムフック
//
// 【機能】
// - インストール済みセクションの一覧取得
// - セクションのインストール（単体・一括）
// - セクションの更新（単体・一括）
// - セクションのアンインストール（単体）
// - 全セクションの一括削除（アプリ削除準備）
// - ローディング状態とエラー状態の管理
//
// 【使用例】
// const {
//   installations,
//   isLoading,
//   error,
//   installSections,
//   uninstallSection,
//   cleanupAll
// } = useSectionManager();

import { useState, useCallback, useEffect } from "react";
import { api } from "../api";

// インストール済みセクションの型
export interface InstalledSection {
  id: string;
  sectionSlug: string;
  sectionName: string;
  installedVersion: string;
  currentVersion: string; // マスターの最新バージョン
  themeId: string;
  hasUpdate: boolean; // アップデート可能かどうか
}

// フックの戻り値の型
export interface UseSectionManagerReturn {
  // 状態
  installations: InstalledSection[];
  isLoading: boolean;
  error: string | null;

  // アクション
  fetchInstallations: () => Promise<void>;
  installSection: (sectionSlug: string, themeId?: string) => Promise<boolean>;
  installSections: (sectionSlugs: string[], themeId?: string) => Promise<{ success: string[]; failed: string[] }>;
  updateSection: (sectionSlug: string, themeId?: string) => Promise<boolean>;
  updateAllSections: (themeId?: string) => Promise<{ success: string[]; failed: string[] }>;
  uninstallSection: (sectionSlug: string, themeId?: string) => Promise<boolean>;
  cleanupAll: (themeId?: string, dryRun?: boolean) => Promise<{ success: boolean; count: number }>;
  clearError: () => void;
}

/**
 * セクション管理カスタムフック
 *
 * @returns セクション管理に必要な状態とアクション
 *
 * @remarks
 * - Gadget APIを使用してバックエンドのGlobal Actionsを呼び出す
 * - インストール状態はローカルにキャッシュし、必要に応じて再取得
 * - エラーは自動的にclearされないので、必要に応じてclearError()を呼ぶ
 */
export function useSectionManager(): UseSectionManagerReturn {
  const [installations, setInstallations] = useState<InstalledSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // エラーをクリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // インストール済みセクションを取得
  const fetchInstallations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Installationモデルからデータを取得
      const result = await api.installation.findMany({
        select: {
          id: true,
          themeId: true,
          installedVersion: true,
          section: {
            slug: true,
            name: true,
            version: true,
          },
        },
      });

      // フロントエンド用のデータ形式に変換
      const formattedInstallations: InstalledSection[] = result.map((inst: any) => ({
        id: inst.id,
        sectionSlug: inst.section?.slug || "",
        sectionName: inst.section?.name || "",
        installedVersion: inst.installedVersion,
        currentVersion: inst.section?.version || inst.installedVersion,
        themeId: inst.themeId,
        hasUpdate: inst.installedVersion !== inst.section?.version,
      }));

      setInstallations(formattedInstallations);
    } catch (err: any) {
      console.error("インストール一覧の取得に失敗:", err);
      setError(err.message || "インストール一覧の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初回マウント時にインストール一覧を取得
  useEffect(() => {
    fetchInstallations();
  }, [fetchInstallations]);

  // 単一セクションをインストール
  const installSection = useCallback(async (
    sectionSlug: string,
    themeId?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.installSection({
        sectionSlug,
        themeId,
      });

      if (result.success) {
        // インストール一覧を再取得
        await fetchInstallations();
        return true;
      } else {
        setError(result.message || "インストールに失敗しました");
        return false;
      }
    } catch (err: any) {
      console.error("セクションのインストールに失敗:", err);
      setError(err.message || "インストールに失敗しました");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchInstallations]);

  // 複数セクションを一括インストール
  const installSections = useCallback(async (
    sectionSlugs: string[],
    themeId?: string
  ): Promise<{ success: string[]; failed: string[] }> => {
    setIsLoading(true);
    setError(null);

    const success: string[] = [];
    const failed: string[] = [];

    // 順次インストール（並列だとAPIレート制限に引っかかる可能性がある）
    for (const slug of sectionSlugs) {
      try {
        const result = await api.installSection({
          sectionSlug: slug,
          themeId,
        });

        if (result.success) {
          success.push(slug);
        } else {
          failed.push(slug);
        }
      } catch (err: any) {
        console.error(`セクション "${slug}" のインストールに失敗:`, err);
        failed.push(slug);
      }
    }

    // インストール一覧を再取得
    await fetchInstallations();

    if (failed.length > 0) {
      setError(`${failed.length}件のインストールに失敗しました: ${failed.join(", ")}`);
    }

    setIsLoading(false);
    return { success, failed };
  }, [fetchInstallations]);

  // 単一セクションを更新
  const updateSection = useCallback(async (
    sectionSlug: string,
    themeId?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.updateSection({
        sectionSlug,
        themeId,
      });

      if (result.success) {
        // インストール一覧を再取得
        await fetchInstallations();
        return true;
      } else {
        setError(result.message || "更新に失敗しました");
        return false;
      }
    } catch (err: any) {
      console.error("セクションの更新に失敗:", err);
      setError(err.message || "更新に失敗しました");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchInstallations]);

  // 更新可能な全セクションを一括更新
  const updateAllSections = useCallback(async (
    themeId?: string
  ): Promise<{ success: string[]; failed: string[] }> => {
    setIsLoading(true);
    setError(null);

    const success: string[] = [];
    const failed: string[] = [];

    // 更新可能なセクションのみ対象
    const updatableSections = installations.filter((inst) => inst.hasUpdate);

    for (const inst of updatableSections) {
      try {
        const result = await api.updateSection({
          sectionSlug: inst.sectionSlug,
          themeId: themeId || inst.themeId,
        });

        if (result.success && result.updated) {
          success.push(inst.sectionSlug);
        } else {
          failed.push(inst.sectionSlug);
        }
      } catch (err: any) {
        console.error(`セクション "${inst.sectionSlug}" の更新に失敗:`, err);
        failed.push(inst.sectionSlug);
      }
    }

    // インストール一覧を再取得
    await fetchInstallations();

    if (failed.length > 0) {
      setError(`${failed.length}件の更新に失敗しました: ${failed.join(", ")}`);
    }

    setIsLoading(false);
    return { success, failed };
  }, [installations, fetchInstallations]);

  // 単一セクションをアンインストール
  const uninstallSection = useCallback(async (
    sectionSlug: string,
    themeId?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.uninstallSection({
        sectionSlug,
        themeId,
      });

      if (result.success) {
        // インストール一覧を再取得
        await fetchInstallations();
        return true;
      } else {
        setError(result.message || "アンインストールに失敗しました");
        return false;
      }
    } catch (err: any) {
      console.error("セクションのアンインストールに失敗:", err);
      setError(err.message || "アンインストールに失敗しました");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchInstallations]);

  // 全セクションを一括削除（アプリ削除準備）
  const cleanupAll = useCallback(async (
    themeId?: string,
    dryRun: boolean = false
  ): Promise<{ success: boolean; count: number }> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.cleanupAllSections({
        themeId,
        dryRun,
      });

      if (!dryRun) {
        // インストール一覧を再取得
        await fetchInstallations();
      }

      return {
        success: result.success,
        count: result.deletedCount || result.targetSections?.length || 0,
      };
    } catch (err: any) {
      console.error("全セクションの削除に失敗:", err);
      setError(err.message || "全セクションの削除に失敗しました");
      return { success: false, count: 0 };
    } finally {
      setIsLoading(false);
    }
  }, [fetchInstallations]);

  return {
    installations,
    isLoading,
    error,
    fetchInstallations,
    installSection,
    installSections,
    updateSection,
    updateAllSections,
    uninstallSection,
    cleanupAll,
    clearError,
  };
}
