// VerticalSectionPreview.tsx
// セクションを縦に並べて表示するプレビューコンポーネント
//
// 【機能】
// - セクションをorder順に縦に並べて表示
// - ホバー時に静止画から動画に切り替え（300ms遅延で誤ホバー防止）
// - 左側リストのホバーとも連動
// - スムーズなフェードイン/アウトアニメーション

import React, { useState, useRef, useEffect } from 'react';
import type { SectionData } from './types';

interface VerticalSectionPreviewProps {
  sections: SectionData[];
  hoveredSectionId: string | null; // 左側リストでホバー中のセクションID
}

/**
 * 縦スクロール式セクションプレビューコンポーネント
 *
 * @param sections - 表示するセクションのリスト
 * @param hoveredSectionId - 左側リストでホバー中のセクションID
 *
 * @remarks
 * - セクションをorder順にソートして縦に並べる
 * - 各セクションは個別にホバー検出
 * - ホバーまたは左側リストの連動で動画再生
 */
export function VerticalSectionPreview({
  sections,
  hoveredSectionId
}: VerticalSectionPreviewProps) {
  // セクションをorder順にソート
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div style={{
      width: '100%',
      flex: 1, // 親の残りスペースを使用
      minHeight: 0, // スクロール可能にする重要な設定
      overflowY: 'auto',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      // gap削除: セクション間の間隔をなくして一体感を出す
      // padding削除: 余白をなくす
      // カスタムスクロールバー（Webkit）
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
    }}>
      {sortedSections.map((section) => (
        <SectionPreviewItem
          key={section.id}
          section={section}
          isHighlighted={section.id === hoveredSectionId}
        />
      ))}
    </div>
  );
}

/**
 * 個別セクションプレビューアイテム
 *
 * @param section - セクションデータ
 * @param isHighlighted - 左側リストでハイライト中かどうか
 *
 * @remarks
 * - 静止画をベースに表示
 * - ホバーまたはハイライト時に動画を読み込んで再生
 * - 300ms遅延で誤ホバーを防止
 * - フェードイン/アウトでスムーズに切り替え
 */
function SectionPreviewItem({
  section,
  isHighlighted
}: {
  section: SectionData;
  isHighlighted: boolean;
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 左側リストのホバー または 自身のホバーで動画を表示すべきか判定
  const shouldShowVideo = (isHighlighted || isHovering) && section.previewVideoUrl;

  // 動画表示状態の制御（300ms遅延）
  useEffect(() => {
    if (shouldShowVideo) {
      // 300ms後に動画を読み込み（誤ホバー防止）
      hoverTimerRef.current = setTimeout(() => {
        setShowVideo(true);
      }, 300);
    } else {
      // ホバー解除時は即座に動画を停止
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
      setShowVideo(false);
      setVideoLoaded(false);
    }

    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, [shouldShowVideo]);

  // 動画再生の制御
  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.warn('動画の自動再生に失敗しました:', error);
      });
    }
  }, [showVideo]);

  // 後方互換性：thumbnailUrl がない場合は previewImage を使用
  const thumbnailSrc = section.thumbnailUrl || section.previewImage || '';

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        position: 'relative',
        width: '100%',
        cursor: 'pointer',
        // 白い境界線を追加
        border: (isHovering || isHighlighted)
          ? '3px solid rgba(255, 255, 255, 0.8)'  // ホバー時は太く、より不透明
          : '1px solid rgba(255, 255, 255, 0.3)',  // 通常時は細く、半透明
        transition: 'border 0.3s ease',  // スムーズなトランジション
        boxSizing: 'border-box',  // 境界線が内側に入らないように
      }}
    >
      {/* 静止画（アスペクト比を保持） */}
      <img
        src={thumbnailSrc}
        alt={section.name}
        style={{
          width: '100%',
          height: 'auto', // アスペクト比に応じて自動調整
          display: videoLoaded ? 'none' : 'block',
        }}
      />

      {/* 動画（アスペクト比を保持） */}
      {showVideo && (
        <video
          ref={videoRef}
          src={section.previewVideoUrl}
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          style={{
            width: '100%',
            height: 'auto', // アスペクト比に応じて自動調整
            display: videoLoaded ? 'block' : 'none',
          }}
        />
      )}

      {/* セクション名のオーバーレイ（ホバー時の視覚的フィードバック） */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        padding: '0.5rem 1rem',
        background: (isHovering || isHighlighted)
          ? 'rgba(0, 0, 0, 0.9)'  // ホバー時は濃く
          : 'rgba(0, 0, 0, 0.7)',  // 通常時は薄く
        backdropFilter: 'blur(10px)',
        borderRadius: '8px',
        color: 'white',
        fontSize: '0.9rem',
        fontWeight: '600',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
        transition: 'background 0.3s ease',
      }}>
        {section.name}
      </div>

      {/* セクション説明（ホバー時のみ表示） */}
      {(isHovering || isHighlighted) && section.description && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1rem 1.5rem',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
          color: 'white',
          animation: 'fadeIn 0.3s ease',
        }}>
          <p style={{
            margin: 0,
            fontSize: '0.85rem',
            lineHeight: 1.5,
            opacity: 0.9,
          }}>
            {section.description}
          </p>
        </div>
      )}
    </div>
  );
}
