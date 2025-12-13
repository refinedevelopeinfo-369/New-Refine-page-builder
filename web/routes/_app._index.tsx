// App.tsx
// Reactコンポーネントと3Dロジックの骨組み


import React, { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text3D, BakeShadows, useKTX2, Center } from "@react-three/drei";
import { Group, Mesh, MeshStandardMaterial, Texture } from "three";

// 外部ファイルからデータと型をインポート
import { scenesData } from "../components/scenesData";
import type { RoomProps, InteractiveTextProps, SceneData } from "../components/types";
import { SectionSelection } from "../components/SectionSelection";
import { Button2D } from "../components/Button2D";

/**
 * Roomコンポーネント (変更なし)
 */
function Room({ textures }: RoomProps) { 
  const colorMap = useKTX2(textures.color) as Texture;
  const normalMap = useKTX2(textures.normal) as Texture;
  const roughnessMap = useKTX2(textures.roughness) as Texture;

  [colorMap, normalMap, roughnessMap].forEach(texture => {
    if (texture instanceof THREE.Texture) { 
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        texture.needsUpdate = true;
    }
  });

  const width = 16;
  const height = 9;
  const depth = 10;
  
  return ( 
    <group>
      {/* ... Roomのメッシュ ... */}
      <mesh receiveShadow position={[0, -height / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial map={colorMap} normalMap={normalMap} roughnessMap={roughnessMap} />
      </mesh>
      <mesh position={[0, height / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial map={colorMap} normalMap={normalMap} roughnessMap={roughnessMap} />
      </mesh>
      <mesh receiveShadow position={[0, 0, -depth / 2]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={colorMap} normalMap={normalMap} roughnessMap={roughnessMap} />
      </mesh>
      <mesh receiveShadow position={[-width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial map={colorMap} normalMap={normalMap} roughnessMap={roughnessMap} />
      </mesh>
      <mesh receiveShadow position={[width / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial map={colorMap} normalMap={normalMap} roughnessMap={roughnessMap} />
      </mesh>
    </group>
  );
}

/**
 * InteractiveTextコンポーネント
 *
 * @param disabled - ホバーアニメーションを無効化するかどうか（スクロール中など）
 *
 * @remarks
 * - disabled が true の時は、ホバー判定をスキップし、初期状態（縮小・後退・半透明）に戻る
 * - disabled かどうかに関わらず、lerp 速度は常に通常速度（自然な動き）
 * - これにより、スクロール中のアニメーション競合を防ぐ
 */
function InteractiveText({
  text,
  font,
  textColor,
  outlineColor,
  disabled = false
}: InteractiveTextProps) {
  const groupRef = useRef<Group>(null!);
  const backgroundMaterialRef = useRef<MeshStandardMaterial>(null!);
  const foregroundMaterialRef = useRef<MeshStandardMaterial>(null!);
  const { pointer } = useThree();

  const horizontalRange = 0.8;
  const verticalRange = 0.55;

  // 初期状態の定数を useRef で保持（各インスタンスごとに独立したオブジェクトを持つ）
  const defaultPosition = useRef(new THREE.Vector3(0, 0, -1));
  const defaultScale = useRef(new THREE.Vector3(0.8, 0.8, 0.8));
  const hoverPosition = useRef(new THREE.Vector3(0, 0, 0));
  const hoverScale = useRef(new THREE.Vector3(1, 1, 1));
  const defaultOpacity = 0.1;

  useFrame((state, delta) => {
    if (!groupRef.current || !backgroundMaterialRef.current || !foregroundMaterialRef.current) return;

    let targetRotationY = 0;
    let targetRotationX = 0;
    let targetPosition = defaultPosition.current;
    let targetScale = defaultScale.current;
    let targetOpacity = defaultOpacity;

    // disabled が false の場合のみ、ホバー判定を行う
    if (!disabled) {
      const isInsideX = pointer.x > -horizontalRange && pointer.x < horizontalRange;
      const isInsideY = pointer.y > -verticalRange && pointer.y < verticalRange;

      if (isInsideX && isInsideY) {
        // ホバー中: 拡大・前面・不透明・回転
        targetRotationY = pointer.x * 0.7;
        targetRotationX = -pointer.y * 0.8;
        targetPosition = hoverPosition.current;
        targetScale = hoverScale.current;
        targetOpacity = 1.0;
      }
    }
    // disabled が true の場合は、初期状態（defaultPosition, defaultScale, defaultOpacity）に戻る

    // lerp 係数: disabled かどうかに関わらず、常に通常速度
    // disabled 時も自然にアニメーションしながらスクロール遷移する
    const lerpFactor = 1 - Math.exp(-3 * delta);

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, lerpFactor);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, lerpFactor);
    groupRef.current.position.lerp(targetPosition, lerpFactor);
    groupRef.current.scale.lerp(targetScale, lerpFactor);
    backgroundMaterialRef.current.opacity = THREE.MathUtils.lerp(backgroundMaterialRef.current.opacity, targetOpacity, lerpFactor);
    foregroundMaterialRef.current.opacity = THREE.MathUtils.lerp(foregroundMaterialRef.current.opacity, targetOpacity, lerpFactor);
  });
  
  const foregroundProps = { font, size: 1, height: 0.32, curveSegments: 12, bevelEnabled: false };
  const backgroundProps = { font, size: 1, height: 0.111, curveSegments: 12, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.05, bevelOffset: 0, bevelSegments: 5 };

  return (
    <group ref={groupRef} position={defaultPosition.current} scale={defaultScale.current}> 
      <Center>
        <Text3D {...backgroundProps} castShadow>
          {text}
          <meshStandardMaterial ref={backgroundMaterialRef} color={outlineColor} opacity={defaultOpacity} transparent />
        </Text3D>
        <Text3D {...foregroundProps} position={[0, 0, 0.1]}>
          {text}
          <meshStandardMaterial 
            ref={foregroundMaterialRef}
            color={textColor}
            polygonOffset
            polygonOffsetFactor={-1}
            opacity={defaultOpacity} 
            transparent 
          />
        </Text3D>
      </Center>
    </group>
  );
}


/**
 * Scenesコンポーネント
 *
 * @param disableTextHover - テキストのホバーアニメーションを無効化するかどうか
 */
function Scenes({
  index,
  showText,
  onButtonClick,
  disableTextHover
}: {
  index: number;
  showText: boolean;
  onButtonClick: () => void;
  disableTextHover: boolean;
}) {
  const { viewport } = useThree();
  const groupRef = useRef<Group>(null!);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // ★ 修正点: index が 0 なら Y=0, index が 1 なら Y=viewport.height
    // マイナス符号を削除して、グループ全体が上に移動するようにします
    const targetY = index * viewport.height;

    // Y座標を滑らかにアニメーション
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 1 - Math.exp(-5 * delta));
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {scenesData.map((sceneProps, i) => (
        // 各シーンは 'index' に関係なく、元々のY位置に配置
        <group key={i} position={[0, -viewport.height * i, 0]}>
          <Room textures={sceneProps.textures} />

          {/* テキストは showText が true の時のみ表示 */}
          {/* ボタンは3D空間から削除し、HTML オーバーレイとして配置 */}
          {showText && (
            <InteractiveText
              text={sceneProps.text}
              font={sceneProps.font}
              textColor={sceneProps.textColor}
              outlineColor={sceneProps.outlineColor}
              disabled={i !== index || disableTextHover}
            />
          )}
        </group>
      ))}
    </group>
  );
}


/**
 * メインのAppコンポーネント
 */
export default function App() {
  const [index, setIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"room" | "section-selection">("room");
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);

  // 部屋の切り替えアニメーション中かどうか
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ボタンの表示状態（フェードイン/アウト制御）
  const [showButton, setShowButton] = useState(true);

  // テキストのホバーアニメーションを無効化するかどうか（スクロール中など）
  const [disableTextHover, setDisableTextHover] = useState(false);

  // 選択中のセクション（プレビュー表示用）
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // セクション選択画面ではスクロールを無効化
    if (viewMode === "section-selection") {
      return;
    }

    // アニメーション中やタイムアウト中は無効化
    if (wheelTimeout.current || isTransitioning) {
      return;
    }

    let newIndex = index;
    if (e.deltaY > 0) { // 下にスクロール
      newIndex = Math.min(index + 1, scenesData.length - 1);
    } else if (e.deltaY < 0) { // 上にスクロール
      newIndex = Math.max(index - 1, 0);
    }

    if (newIndex !== index) {
      // アニメーション開始
      setIsTransitioning(true);
      setShowButton(false); // ボタンをフェードアウト
      setDisableTextHover(true); // テキストのホバーアニメーションを無効化

      setIndex(newIndex);

      // 部屋の切り替えアニメーション時間（約1秒）
      wheelTimeout.current = setTimeout(() => {
        wheelTimeout.current = null;

        // アニメーション完了後、ボタンをフェードイン
        setShowButton(true);

        // フェードインの時間を確保してからトランジション状態を解除
        setTimeout(() => {
          setIsTransitioning(false);
          setDisableTextHover(false); // テキストのホバーアニメーションを再有効化
        }, 300); // ボタンのフェードイン時間（0.3秒）
      }, 1000);
    }
  };

  const handleButtonClick = () => {
    setViewMode("section-selection");
  };

  const handleBack = () => {
    setViewMode("room");
  };

  const handleSectionClick = (sectionId: string) => {
    setSelectedSectionId(sectionId); // 選択中のセクションを記録
    console.log("選択されたセクション:", sectionId);
    // TODO: セクション選択後の処理をここに実装
  };

  return (
    <div
      style={{ width: "100vw", height: "100vh", background: "#101010", position: "relative" }}
      onWheel={handleWheel}
    >
      <Canvas
        shadows
        camera={{ position: [0, 0, 11], fov: 50 }}
        gl={{ logarithmicDepthBuffer: true }}
      >
        <spotLight
            position={[0, 10, 8]}
            angle={0.25}
            penumbra={1}
            intensity={10}
            castShadow
        />
        <ambientLight intensity={2.5} />
        <BakeShadows />

        <Suspense fallback={null}>
          <Scenes
            index={index}
            showText={viewMode === "room"}
            onButtonClick={handleButtonClick}
            disableTextHover={disableTextHover}
          />
        </Suspense>

      </Canvas>

      {/* 2D HTMLボタン（Canvas の外、画面下部に固定） */}
      {viewMode === "room" && (
        <div
          style={{
            position: "absolute",
            bottom: "100px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
          }}
        >
          <Button2D
            text="セクションを選択"
            onClick={handleButtonClick}
            visible={showButton}
          />
        </div>
      )}

      {/* セクション選択画面のオーバーレイ */}
      {viewMode === "section-selection" && (
        <SectionSelection
          sections={scenesData[index].sections}
          selectedSectionId={selectedSectionId}
          onSectionClick={handleSectionClick}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

