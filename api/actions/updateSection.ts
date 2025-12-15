// api/actions/updateSection.ts
// インストール済みセクションを最新バージョンに更新するGlobal Action

export const run = async ({ params, logger, api, connections }: any) => {
  const { sectionSlug } = params;
  const shopify = connections.shopify.current;

  // 1. 最新コード取得
  const sectionMaster = await api.sectionMaster.findFirst({
    filter: { slug: { equals: sectionSlug } },
  });

  if (!sectionMaster) throw new Error("Section master not found");

  // 2. 強制上書き (JSONはtemplates側にあるので、sectionsフォルダを上書きしても安全)
  await shopify.assets.put({
    key: `sections/${sectionSlug}.liquid`,
    value: sectionMaster.liquidCode,
  });

  // 3. 履歴データのバージョンを更新
  // (現在のショップが持っている該当セクションのレコードを探して更新)
  const currentShop = await api.shopifyShop.findOne(shopify.id);
  const installation = await api.installation.findFirst({
    filter: {
      shopId: { equals: currentShop.id },
      sectionId: { equals: sectionMaster.id },
    },
  });

  if (installation) {
    await api.installation.update(installation.id, {
      installedVersion: sectionMaster.version,
    });
  }

  return { success: true };
};

export const options = {
  params: {
    sectionSlug: { type: "string" },
  },
  triggers: { api: true },
};