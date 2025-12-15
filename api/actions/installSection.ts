import { ActionOptions } from "gadget-server";

export const run = async ({ params, logger, api, connections }: any) => {
  const { sectionSlug } = params;
  const shopify = connections.shopify.current;

  if (!shopify) {
    throw new Error("Shopify connection not found");
  }

  // 1. セクションのマスタデータを取得
  const sectionMaster = await api.sectionMaster.findFirst({
    filter: { slug: { equals: sectionSlug } },
  });

  if (!sectionMaster) {
    throw new Error(`Section master not found: ${sectionSlug}`);
  }

  // 現在公開されている「メインテーマ」のIDを探す
  const themes = await shopify.theme.list();
  const mainTheme = themes.find((t: any) => t.role === "main");

  if (!mainTheme) {
    throw new Error("Main theme not found");
  }

  const themeId = mainTheme.id;
  const assetKey = `sections/${sectionSlug}.liquid`;

  // 2. ファイルの存在確認
  try {
    const existingAsset = await shopify.asset.get(themeId, { asset: { key: assetKey } });
    if (existingAsset) {
      throw new Error("FILE_EXISTS");
    }
  } catch (error: any) {
    // ▼▼▼ 【修正ポイント】エラー判定の書き方を修正 ▼▼▼
    // Shopify API Nodeのエラーは error.response.statusCode に入っています
    if (error.response?.statusCode === 404) {
      // 404なら「ファイルがない」ということなので正常。処理を続行。
    } else if (error.message === "FILE_EXISTS") {
      throw error; // 既に存在する場合はエラーを投げる
    } else {
      throw error; // それ以外の本当のエラーは投げる
    }
  }

  // 3. ファイルを書き込む
  await shopify.asset.create(themeId, {
    key: assetKey,
    value: sectionMaster.liquidCode || "",
  });

  // 4. インストール履歴をDBに記録
  const shop = await api.shopifyShop.findOne(shopify.id);
  await api.installation.create({
    shop: { _link: shop.id },
    section: { _link: sectionMaster.id },
    installedVersion: sectionMaster.version,
  });

  return { success: true, message: "Installed successfully" };
};

export const options = {
  params: {
    sectionSlug: { type: "string" },
  },
  triggers: { api: true },
};