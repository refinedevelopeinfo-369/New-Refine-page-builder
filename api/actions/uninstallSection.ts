// api/actions/uninstallSection.ts
// 単一セクションをアンインストールするGlobal Action

export const run = async ({ params, logger, api, connections }: any) => {
  const { sectionSlug } = params;
  const shopify = connections.shopify.current;

  // 1. Asset APIでファイルを削除
  try {
    await shopify.assets.delete({ key: `sections/${sectionSlug}.liquid` });
  } catch (e) {
    logger.warn("File already deleted or not found");
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