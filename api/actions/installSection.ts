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

  // ★追加: 現在公開されている「メインテーマ」のIDを探す
  const themes = await shopify.theme.list();
  // roleが 'main' のものが公開テーマです
  const mainTheme = themes.find((t: any) => t.role === "main");

  if (!mainTheme) {
    throw new Error("Main theme not found");
  }

  const themeId = mainTheme.id; // これを使います！
  const assetKey = `sections/${sectionSlug}.liquid`;

  // 2. ファイルの存在確認 (テーマIDを指定して確認)
  try {
    const existingAsset = await shopify.asset.get(themeId, { asset: { key: assetKey } });
    if (existingAsset) {
      // 既にファイルがある場合はエラー (上書き確認用)
      throw new Error("FILE_EXISTS");
    }
  } catch (error: any) {
    // 404 (存在しない) ならOK
    if (error.code !== 404 && error.message !== "FILE_EXISTS") {
      // 本物のエラーならログに出してスロー
      logger.error({ error }, "Error checking asset existence");
      // 404扱いで無視できるケースか判断が難しい場合は一旦スルーしてPUTへ進む手もあるが、
      // ここではFILE_EXISTS以外は続行させる
    }
    if (error.message === "FILE_EXISTS") throw error;
  }

  // 3. ファイルを書き込む (テーマIDを指定してPUT)
  // ※ Shopify API Nodeの書き方に準拠
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