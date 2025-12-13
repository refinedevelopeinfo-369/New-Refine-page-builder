// ParticleOrbit.tsx
// 光る玉の放射状展開エフェクト
//
// 【機能】
// - ホバー時にボタンから様々な方向に球が広がる
// - すべての設定が%ベースでどのサイズのボタンでも同じ見た目
// - 球はゆっくりと明るくなったり暗くなったりを繰り返す
// - 各球は上下左右にゆっくり揺らぐ（自然な動きを演出）
//
// 【使用例】
// <ParticleOrbit hovered={isHovered} />

import React, { useEffect, useRef, useState } from "react";

interface Particle {
  id: number;
  startDistance: number;     // 初期位置（ボタンサイズの%）
  startAngle: number;        // 初期位置の角度（度）
  moveDistance: number;      // 移動距離（ボタンサイズの%）
  moveAngle: number;         // 移動方向の角度（度）
  moveSpeed: number;         // 移動速度（lerp係数）
  baseSize: number;          // 球のサイズ（ボタンサイズの%）
  pulsePhase: number;        // 明るさ変化の位相（ラジアン）
  pulseSpeed: number;        // 明るさ変化の速度
  wobbleOffsetX: number;     // X軸の揺らぎ位相（ラジアン）
  wobbleOffsetY: number;     // Y軸の揺らぎ位相（ラジアン）
  wobbleAmplitudeX: number;  // X軸の揺らぎ幅（ボタンサイズの%）
  wobbleAmplitudeY: number;  // Y軸の揺らぎ幅（ボタンサイズの%）
  wobbleSpeedX: number;      // X軸の揺らぎ速度
  wobbleSpeedY: number;      // Y軸の揺らぎ速度
}

interface ParticleOrbitProps {
  hovered?: boolean;      // ホバー状態
  scale?: number;         // 玉のサイズ倍率（省略時は1.0、2.0で2倍、0.5で半分）
}

/**
 * 手動配置用の球の定義（すべて%ベース）
 */
interface ManualParticle {
  startDistance: number;   // 初期位置: ボタン中心からの距離（ボタンサイズの%、0〜100程度）
  startAngle: number;      // 初期位置: 角度（度） 0=右、90=上、180=左、270=下
  moveDistance: number;    // 移動距離（ボタンサイズの%、0〜100程度）
  moveAngle: number;       // 移動方向: 角度（度）
  size: number;            // 球のサイズ（ボタンサイズの%、1〜10程度）
  moveSpeed?: number;      // 移動速度（省略時は共通設定を使用）
  pulseSpeed?: number;     // 明るさ変化速度（省略時は1.0）
  pulsePhase?: number;     // 明るさ変化の初期位相（ラジアン、省略時は0）
  wobbleAmplitudeX?: number;  // X軸の揺らぎ幅（省略時はデフォルト値を使用）
  wobbleAmplitudeY?: number;  // Y軸の揺らぎ幅（省略時はデフォルト値を使用）
  wobbleSpeedX?: number;      // X軸の揺らぎ速度（省略時はデフォルト値を使用）
  wobbleSpeedY?: number;      // Y軸の揺らぎ速度（省略時はデフォルト値を使用）
}

/**
 * 調整可能なパラメータ
 */
const DEFAULT_MOVE_SPEED = 0.05;    // デフォルトの移動速度（0.0〜1.0、大きいほど速い）
const OPACITY_BASE = 0.9;          // 明るさの基準値
const OPACITY_AMPLITUDE = 0.4;     // 明るさの変化幅（base ± amplitude）
const GLOW_BASE = 25;              // 発光の基準値（px）
const GLOW_AMPLITUDE = 2;          // 発光の変化幅（base ± amplitude）

// 揺らぎのパラメータ
const WOBBLE_AMPLITUDE_X = 0.8;      // X軸の揺らぎ幅（ボタンサイズの%、デフォルト値）
const WOBBLE_AMPLITUDE_Y = 0.5;      // Y軸の揺らぎ幅（ボタンサイズの%、デフォルト値）
const WOBBLE_SPEED_X = 1;        // X軸の揺らぎ速度（デフォルト値）
const WOBBLE_SPEED_Y = 0.8;        // Y軸の揺らぎ速度（デフォルト値）

/**
 * 球の配置設定（すべて%ベース）
 *
 * startDistance: ボタン中心からの距離（%）
 *   - 0: ボタンの中心
 *   - 50: ボタンサイズの半分の距離
 *   - 100: ボタンサイズと同じ距離（ボタンの外側）
 *
 * startAngle / moveAngle: 角度（度）
 *   - 0: 右（→）
 *   - 45: 右下（↘）
 *   - 90: 下（↓）
 *   - 135: 左下（↙）
 *   - 180: 左（←）
 *   - 225: 左上（↖）
 *   - 270: 上（↑）
 *   - 315: 右上（↗）
 * 
 *
 * moveDistance: 移動距離（%）
 *   - ホバー時に移動する距離
 *
 * size: 球のサイズ（%）
 *   - 1〜10程度が推奨
 */
const MANUAL_PARTICLES: ManualParticle[] = [
  // 右下に大小一つずつ
  { startDistance: 35, startAngle: 20, moveDistance: 22, moveAngle: 45, size: 5, pulseSpeed: 0.8, pulsePhase: Math.PI / 2 },   // 右下・
  { startDistance: 45, startAngle: 15, moveDistance: 11, moveAngle: 25, size: 3, pulseSpeed: 0.7, pulsePhase:(Math.PI / 3) * 5 },   // 右下・

  { startDistance: 18, startAngle: 330, moveDistance: 37, moveAngle: 343, size: 2, pulseSpeed: 1.1, pulsePhase:(Math.PI / 3) * 5 }, // 右上・
  
  // 左上に大小3つ
  { startDistance: 39, startAngle: 185, moveDistance: 30, moveAngle: 210, size: 7, pulseSpeed: 0.7, pulsePhase: Math.PI }, // 左上・
  { startDistance: 37, startAngle: 195, moveDistance: 18, moveAngle: 240, size: 4, pulseSpeed: 0.9, pulsePhase:	(Math.PI / 3) * 2 }, // 左上・

  { startDistance: 11, startAngle: 120, moveDistance: 8, moveAngle: 131, size: 3, pulseSpeed: 1.0 }, // 左下・
  { startDistance: 25, startAngle: 155, moveDistance: 18, moveAngle: 120, size: 4.5, pulseSpeed: 0.7, pulsePhase:	(Math.PI / 3) * 2 }, // 左下・

];

/**
 * 光る玉の放射状展開エフェクト
 *
 * @param hovered - ホバー状態
 * @param scale - 玉のサイズ倍率（省略時は1.0、2.0で2倍、0.5で半分）
 *
 * @remarks
 * - requestAnimationFrame で60fps維持
 * - すべての設定が%ベース（ボタンサイズに自動調整）
 * - ホバー時: 設定した方向に広がる
 * - 非ホバー時: 初期位置に戻る
 * - 各球はゆっくりと明るさが変化（sin波）
 * - 各球は上下左右に自然な揺らぎを持つ（sin波、各球ごとに異なる位相）
 * - scale プロパティで玉のサイズを調整可能
 */
export function ParticleOrbit({
  hovered = false,
  scale = 1.0,
}: ParticleOrbitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [particleDistances, setParticleDistances] = useState<number[]>([]);
  const [buttonSize, setButtonSize] = useState({ width: 0, height: 0 });
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());

  // ボタンのサイズを取得
  useEffect(() => {
    if (!containerRef.current) return;

    // 親要素（MagicButtonのdiv）からボタン要素を探す
    const parentElement = containerRef.current.parentElement;
    if (!parentElement) return;

    const buttonElement = parentElement.querySelector('button');
    if (!buttonElement) return;

    // ボタンのサイズを取得
    const rect = buttonElement.getBoundingClientRect();
    setButtonSize({
      width: rect.width,
      height: rect.height,
    });

    // リサイズ時にも更新
    const resizeObserver = new ResizeObserver(() => {
      const rect = buttonElement.getBoundingClientRect();
      setButtonSize({
        width: rect.width,
        height: rect.height,
      });
    });

    resizeObserver.observe(buttonElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 玉の初期化（ボタンサイズが取得できたら実行）
  useEffect(() => {
    if (buttonSize.width === 0 || buttonSize.height === 0) return;

    const initialParticles: Particle[] = [];

    MANUAL_PARTICLES.forEach((manualParticle, i) => {
      initialParticles.push({
        id: i,
        startDistance: manualParticle.startDistance,
        startAngle: manualParticle.startAngle,
        moveDistance: manualParticle.moveDistance,
        moveAngle: manualParticle.moveAngle,
        moveSpeed: manualParticle.moveSpeed ?? DEFAULT_MOVE_SPEED,
        baseSize: manualParticle.size,
        pulsePhase: manualParticle.pulsePhase ?? 0,
        pulseSpeed: manualParticle.pulseSpeed ?? 1.0,
        // 揺らぎのパラメータ（各玉ごとにランダムな位相オフセットで自然な動きに）
        wobbleOffsetX: Math.random() * Math.PI * 2,
        wobbleOffsetY: Math.random() * Math.PI * 2,
        wobbleAmplitudeX: manualParticle.wobbleAmplitudeX ?? WOBBLE_AMPLITUDE_X,
        wobbleAmplitudeY: manualParticle.wobbleAmplitudeY ?? WOBBLE_AMPLITUDE_Y,
        wobbleSpeedX: manualParticle.wobbleSpeedX ?? WOBBLE_SPEED_X,
        wobbleSpeedY: manualParticle.wobbleSpeedY ?? WOBBLE_SPEED_Y,
      });
    });

    setParticles(initialParticles);
    setParticleDistances(new Array(initialParticles.length).fill(0));
  }, [buttonSize]);

  // アニメーションループ（各球の距離を個別に補間）
  useEffect(() => {
    if (particles.length === 0) return;

    const animate = () => {
      setParticleDistances((prev: number[]) =>
        prev.map((currentDist: number, i: number) => {
          const particle = particles[i];
          const target = hovered ? 1.0 : 0.0; // 0.0〜1.0の範囲!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
          // 線形補間（lerp）で滑らかに移動（各球の速度を使用）
          return currentDist + (target - currentDist) * particle.moveSpeed;
        })
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [hovered, particles]);

  // prefers-reduced-motion 対応
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    return null; // アニメーション無効
  }

  // ボタンサイズが取得できるまでは何も表示しない
  if (buttonSize.width === 0 || buttonSize.height === 0) {
    return <div ref={containerRef} style={{ display: "none" }} />;
  }

  // 基準サイズ（ボタンの幅と高さの大きい方を100%とする）
  const baseSize = Math.max(buttonSize.width, buttonSize.height);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: `${baseSize * 2}px`,
        height: `${baseSize * 2}px`,
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 10,
      }}
    >
      {particles.map((p: Particle, index: number) => {
        // 経過時間（秒）
        const time = (Date.now() - startTimeRef.current) / 1000;

        // 明るさの計算（sin波でゆっくり変化）
        const pulseValue = Math.sin(p.pulsePhase + time * p.pulseSpeed);
        const opacity = OPACITY_BASE + pulseValue * OPACITY_AMPLITUDE;
        const glowIntensity = GLOW_BASE + pulseValue * GLOW_AMPLITUDE;

        // 初期位置の計算（%をpxに変換）
        const startAngleRad = (p.startAngle * Math.PI) / 180;
        const startDist = (baseSize * p.startDistance) / 100;
        const startX = Math.cos(startAngleRad) * startDist;
        const startY = Math.sin(startAngleRad) * startDist;

        // 移動方向の計算
        const moveAngleRad = (p.moveAngle * Math.PI) / 180;
        const moveDist = ((baseSize * p.moveDistance) / 100) * particleDistances[index];
        const moveX = Math.cos(moveAngleRad) * moveDist;
        const moveY = Math.sin(moveAngleRad) * moveDist;

        // 揺らぎの計算（sin波を使用して滑らかに上下左右に揺らす）
        const wobbleX = Math.sin(p.wobbleOffsetX + time * p.wobbleSpeedX) * (baseSize * p.wobbleAmplitudeX) / 100;
        const wobbleY = Math.sin(p.wobbleOffsetY + time * p.wobbleSpeedY) * (baseSize * p.wobbleAmplitudeY) / 100;

        // 現在位置（初期位置 + 移動 + 揺らぎ）
        const x = startX + moveX + wobbleX;
        const y = startY + moveY + wobbleY;

        // 球のサイズ（%をpxに変換、scaleで倍率調整）
        const size = (baseSize * p.baseSize) / 100 * scale;

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: `${size}px`,
              height: `${size}px`,
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(255, 255, 255, ${opacity}), transparent)`,
              boxShadow: `0 0 ${glowIntensity}px rgba(255, 255, 255, ${opacity * 0.8})`,
              pointerEvents: "none",
              willChange: "transform, opacity",
              transition: "none", // requestAnimationFrameで制御するため
            }}
          />
        );
      })}
    </div>
  );
}
