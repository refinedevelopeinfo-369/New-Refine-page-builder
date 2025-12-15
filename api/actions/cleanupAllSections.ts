// api/actions/cleanupAllSections.ts
// アプリアンインストール前の全セクション削除用Global Action

export const run = async ({ params, logger, api, connections }: any) => {
  const shopify = connections.shopify.current;
  const currentShop = await api.shopifyShop.findOne(shopify.id);

  // 1. このショップのインストール履歴を全取得
  const installations = await api.installation.findMany({
    filter: { shopId: { equals: currentShop.id } },
    select: {
      id: true,
      section: {
        slug: true,
      },
    },
  });

  // 2. ループして削除実行
  for (const install of installations) {
    if (install.section?.slug) {
      try {
        await shopify.assets.delete({
          key: `sections/${install.section.slug}.liquid`,
        });
      } catch (e) {
        // 無視して次へ
      }
    }
    // レコード削除
    await api.installation.delete(install.id);
  }

  return { success: true, count: installations.length };
};

export const options = {
  triggers: { api: true },
};