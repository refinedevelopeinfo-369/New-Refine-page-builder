export const run = async ({ params, logger, api, connections }: any) => {
  const { sectionSlug } = params;
  const shopify = connections.shopify.current;

  // テーマID取得
  const themes = await shopify.theme.list();
  const mainTheme = themes.find((t: any) => t.role === "main");
  
  if (mainTheme) {
    // 1. Asset APIでファイルを削除
    try {
      // ▼▼▼ 【修正ポイント】 assets.delete -> asset.delete, 引数の形式変更 ▼▼▼
      await shopify.asset.delete(mainTheme.id, { 
        asset: { key: `sections/${sectionSlug}.liquid` } 
      });
    } catch (e) {
      logger.warn("File already deleted or not found");
    }
  }

  // 2. 履歴データを削除
  const sectionMaster = await api.sectionMaster.findFirst({
    filter: { slug: { equals: sectionSlug } },
  });
  
  if (sectionMaster) {
    const currentShop = await api.shopifyShop.findOne(shopify.id);
    const installation = await api.installation.findFirst({
      filter: {
        shopId: { equals: currentShop.id },
        sectionId: { equals: sectionMaster.id },
      },
    });

    if (installation) {
      await api.installation.delete(installation.id);
    }
  }

  return { success: true };
};

export const options = {
  params: {
    sectionSlug: { type: "string" },
  },
  triggers: { api: true },
};