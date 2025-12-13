// scenesData.ts
// 外部ファイルから型をインポートし、データ配列をexportします。

import type { SceneData } from "./types"; // 型定義をインポート

export const scenesData: SceneData[] = [
  {
    text: "Hero Sections",
    textColor: "#A1A3A6",
    outlineColor: "#000000",
    textures: {
      color: "https://cdn.shopify.com/s/files/1/0686/1740/4599/files/BaseColor.ktx2?v=1765624497",
      normal: "https://cdn.shopify.com/s/files/1/0686/1740/4599/files/Normal.ktx2?v=1765624497",
      roughness: "https://cdn.shopify.com/s/files/1/0686/1740/4599/files/Roughness.ktx2?v=1765624497",
    },
    font: "https://raw.githubusercontent.com/refinedevelopeinfo-369/my-3d-assets/main/Roboto%20Slab%20Black_Regular.json",
    sections: [
      {
        id: "hero-1",
        name: "Hero Section",
        description: "メインビジュアルとキャッチコピーで訪問者の注目を集めます",
        order: 0,
        minHeight: 350,
        thumbnailUrl: "https://cdn.shopify.com/s/files/1/0686/1740/4599/files/2025-11-26_200350.png?v=1764226224",
        previewVideoUrl: "https://cdn.shopify.com/videos/c/o/v/75643af35bc0430599afbd93d5ba5349.mp4", // 動画がある場合はURLを設定
      },
      {
        id: "hero-2",
        name: "Product Showcase",
        description: "主力商品を魅力的に紹介するセクション",
        order: 1,
        minHeight: 300,
        thumbnailUrl: "https://cdn.shopify.com/s/files/1/0686/1740/4599/files/2025-11-26_200404.png?v=1764226224",
        previewVideoUrl: "https://cdn.shopify.com/videos/c/o/v/83acddd3ae174382a96042b42747c0df.mp4",
      },
      {
        id: "hero-3",
        name: "Customer Reviews",
        description: "お客様の声で信頼感を高めます",
        order: 2,
        minHeight: 300,
        thumbnailUrl: "https://cdn.shopify.com/s/files/1/0686/1740/4599/files/2025-11-27_073151.png?v=1764196328",
        previewVideoUrl: "https://cdn.shopify.com/videos/c/o/v/8d1bcc31ad534551a924dd1501585163.mp4",
      },
      {
        id: "hero-4",
        name: "About Us",
        description: "ブランドストーリーやミッションを伝えます",
        order: 3,
        minHeight: 300,
        thumbnailUrl: "https://cdn.shopify.com/s/files/1/0686/1740/4599/files/2025-11-26_200428.png?v=1764226224",
        previewVideoUrl: "https://cdn.shopify.com/videos/c/o/v/8defb4d4f73948aebe3d716b4fb3f809.mp4",
      },
      {
        id: "hero-5",
        name: "Footer",
        description: "連絡先情報とナビゲーションリンク",
        order: 4,
        minHeight: 250,
        thumbnailUrl: "https://via.placeholder.com/800x300/9e4aff/ffffff?text=Footer+Section",
        previewVideoUrl: undefined,
      },
    ],
  },
  {
    text: "Next Room",
    textColor: "#FFD700",
    outlineColor: "#4B0082",
    textures: {
      color: "https://cdn.shopify.com/s/files/1/0686/1740/4599/files/BaseColor_Dirt.ktx2?v=1765624520",
      normal: "https://cdn.shopify.com/s/files/1/0686/1740/4599/files/Normal_Dirt.ktx2?v=1765624520",
      roughness: "https://cdn.shopify.com/s/files/1/0686/1740/4599/files/Roughness_Dirt.ktx2?v=1765624519",
    },
    font: "https://raw.githubusercontent.com/refinedevelopeinfo-369/my-3d-assets/main/Roboto%20Slab%20Black_Regular.json",
    sections: [
      {
        id: "next-1",
        name: "Hero Section",
        description: "第2テーマのメインビジュアル",
        order: 0,
        minHeight: 350,
        thumbnailUrl: "https://via.placeholder.com/800x450/ffd700/4b0082?text=Hero+Section",
        previewVideoUrl: undefined,
      },
      {
        id: "next-2",
        name: "Features",
        description: "製品の特徴を分かりやすく伝えます",
        order: 1,
        minHeight: 300,
        thumbnailUrl: "https://via.placeholder.com/800x400/ffd700/4b0082?text=Features+Section",
        previewVideoUrl: undefined,
      },
      {
        id: "next-3",
        name: "Pricing",
        description: "料金プランを比較しやすく表示",
        order: 2,
        minHeight: 300,
        thumbnailUrl: "https://via.placeholder.com/800x400/ffd700/4b0082?text=Pricing+Section",
        previewVideoUrl: undefined,
      },
      {
        id: "next-4",
        name: "CTA",
        description: "コンバージョンを促す行動喚起セクション",
        order: 3,
        minHeight: 300,
        thumbnailUrl: "https://via.placeholder.com/800x350/ffd700/4b0082?text=CTA+Section",
        previewVideoUrl: undefined,
      },
      {
        id: "next-5",
        name: "Footer",
        description: "連絡先とリンク",
        order: 4,
        minHeight: 250,
        thumbnailUrl: "https://via.placeholder.com/800x300/ffd700/4b0082?text=Footer+Section",
        previewVideoUrl: undefined,
      },
    ],
  },
];
